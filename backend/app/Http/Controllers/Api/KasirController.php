<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Models\DetailPesanan;
use App\Models\Payment;
use App\Services\ReceiptService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class KasirController extends Controller
{
    protected $receiptService;

    public function __construct(ReceiptService $receiptService)
    {
        $this->receiptService = $receiptService;
    }

    /**
     * Get list of orders ready for payment
     */
    public function getOrders(): JsonResponse
    {
        $orders = Pesanan::with(['meja', 'user', 'detailPesanans.makanan'])
            ->whereIn('status', ['diproses', 'selesai'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
            'message' => 'Daftar pesanan berhasil diambil'
        ]);
    }

    /**
     * Get order details for payment
     */
    public function getOrderDetails(Pesanan $pesanan): JsonResponse
    {
        if ($pesanan->status === 'dibatalkan') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan dibatalkan tidak dapat diproses'
            ], 400);
        }

        $pesanan->load(['detailPesanans.makanan', 'meja', 'user']);

        // Calculate payment details
        $subtotal = $pesanan->detailPesanans->sum('subtotal');
        $tax = $subtotal * 0.1; // 10% tax
        $service = $subtotal * 0.05; // 5% service charge
        $total = $subtotal + $tax + $service;

        $paymentDetails = [
            'subtotal' => $subtotal,
            'tax' => $tax,
            'service' => $service,
            'total' => $total,
            'tax_rate' => 10,
            'service_rate' => 5
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $pesanan,
                'payment_details' => $paymentDetails
            ],
            'message' => 'Detail pesanan berhasil diambil'
        ]);
    }

    /**
     * Close order and mark as paid
     */
    public function closeOrder(Request $request, Pesanan $pesanan): JsonResponse
    {
        $request->validate([
            'payment_method' => 'required|string|in:tunai,transfer,ewallet',
            'payment_amount' => 'required|numeric|min:0',
            'customer_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500'
        ]);

        // Check if order can be closed
        if (!in_array($pesanan->status, ['diproses', 'selesai'])) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat ditutup karena status: ' . $pesanan->status_label
            ], 400);
        }

        // Calculate payment details
        $subtotal = $pesanan->detailPesanans->sum('subtotal');
        $tax = $subtotal * 0.1;
        $service = $subtotal * 0.05;
        $total = $subtotal + $tax + $service;

        // Validate payment amount
        if ($request->payment_amount < $total) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah pembayaran kurang dari total yang harus dibayar',
                'data' => [
                    'required_amount' => $total,
                    'payment_amount' => $request->payment_amount,
                    'shortage' => $total - $request->payment_amount
                ]
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update order status
            $pesanan->update([
                'status' => 'dibayar',
                'catatan' => $pesanan->catatan . "\nPembayaran: " . $request->payment_method . " - " . $request->notes
            ]);

            // Update table status
            $meja = $pesanan->meja;
            if ($meja) {
                $meja->update(['status' => 'tersedia']);
            }

            // Save payment data to database
            $payment = Payment::create([
                'pesanan_id' => $pesanan->id,
                'payment_method' => $request->payment_method,
                'payment_amount' => $request->payment_amount,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'service' => $service,
                'total' => $total,
                'change' => $request->payment_amount - $total,
                'customer_name' => $request->customer_name,
                'notes' => $request->notes,
                'paid_at' => now()
            ]);

            // Store payment data in session for backward compatibility
            $paymentData = [
                'pesanan_id' => $pesanan->id,
                'user_id' => Auth::id(),
                'payment_method' => $request->payment_method,
                'payment_amount' => $request->payment_amount,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'service' => $service,
                'total' => $total,
                'change' => $request->payment_amount - $total,
                'customer_name' => $request->customer_name,
                'notes' => $request->notes,
                'paid_at' => now(),
                'tax_rate' => 10,
                'service_rate' => 5
            ];

            // Store payment data in session or create payment record
            session(['payment_' . $pesanan->id => $paymentData]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => $pesanan->fresh()->load(['meja', 'user', 'detailPesanans.makanan']),
                    'payment' => $paymentData
                ],
                'message' => 'Pesanan berhasil ditutup dan dibayar'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menutup pesanan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate receipt PDF
     */
    public function generateReceipt(Pesanan $pesanan): JsonResponse
    {
        if ($pesanan->status !== 'dibayar') {
            return response()->json([
                'success' => false,
                'message' => 'Struk hanya dapat dibuat untuk pesanan yang sudah dibayar'
            ], 400);
        }

        try {
            $pesanan->load(['detailPesanans.makanan', 'meja', 'user']);
            
            // Get payment data from database first, fallback to session
            $payment = Payment::where('pesanan_id', $pesanan->id)->first();
            
            if ($payment) {
                $paymentData = [
                    'pesanan_id' => $payment->pesanan_id,
                    'payment_method' => $payment->payment_method,
                    'payment_amount' => $payment->payment_amount,
                    'subtotal' => $payment->subtotal,
                    'tax' => $payment->tax,
                    'service' => $payment->service,
                    'total' => $payment->total,
                    'change' => $payment->change,
                    'customer_name' => $payment->customer_name,
                    'notes' => $payment->notes,
                    'paid_at' => $payment->paid_at->format('Y-m-d H:i:s'),
                    'tax_rate' => 10,
                    'service_rate' => 5
                ];
            } else {
                // Fallback to session
                $paymentData = session('payment_' . $pesanan->id);
                
                // Add tax_rate and service_rate if not exists
                if ($paymentData && !isset($paymentData['tax_rate'])) {
                    $paymentData['tax_rate'] = 10;
                    $paymentData['service_rate'] = 5;
                }
                
                // Debug: Log session data
                \Log::info('Payment session data for order ' . $pesanan->id, [
                    'session_data' => $paymentData,
                    'all_session_keys' => array_keys(session()->all())
                ]);
            }
            
            if (!$paymentData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data pembayaran tidak ditemukan',
                    'debug' => [
                        'order_id' => $pesanan->id,
                        'session_key' => 'payment_' . $pesanan->id,
                        'available_keys' => array_keys(session()->all()),
                        'payment_exists' => $payment ? true : false
                    ]
                ], 404);
            }

            // Generate PDF
            $pdf = $this->receiptService->generateReceipt($pesanan, $paymentData);
            
            // Save PDF to storage
            $filename = 'receipt_' . $pesanan->id . '_' . time() . '.pdf';
            $path = storage_path('app/public/receipts/' . $filename);
            
            // Ensure directory exists
            $directory = dirname($path);
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }
            
            $pdf->save($path);

            return response()->json([
                'success' => true,
                'data' => [
                    'receipt_url' => url('storage/receipts/' . $filename),
                    'filename' => $filename,
                    'generated_at' => now()->toISOString()
                ],
                'message' => 'Struk berhasil dibuat'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat struk: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download receipt PDF
     */
    public function downloadReceipt(Pesanan $pesanan)
    {
        if ($pesanan->status !== 'dibayar') {
            abort(404, 'Struk tidak ditemukan');
        }

        try {
            $pesanan->load(['detailPesanans.makanan', 'meja', 'user']);
            
            // Get payment data from database first, fallback to session
            $payment = Payment::where('pesanan_id', $pesanan->id)->first();
            
            if ($payment) {
                $paymentData = [
                    'pesanan_id' => $payment->pesanan_id,
                    'payment_method' => $payment->payment_method,
                    'payment_amount' => $payment->payment_amount,
                    'subtotal' => $payment->subtotal,
                    'tax' => $payment->tax,
                    'service' => $payment->service,
                    'total' => $payment->total,
                    'change' => $payment->change,
                    'customer_name' => $payment->customer_name,
                    'notes' => $payment->notes,
                    'paid_at' => $payment->paid_at->format('Y-m-d H:i:s'),
                    'tax_rate' => 10,
                    'service_rate' => 5
                ];
            } else {
                // Fallback to session
                $paymentData = session('payment_' . $pesanan->id);
                
                // Add tax_rate and service_rate if not exists
                if ($paymentData && !isset($paymentData['tax_rate'])) {
                    $paymentData['tax_rate'] = 10;
                    $paymentData['service_rate'] = 5;
                }
                
                // Debug: Log session data
                \Log::info('Download receipt - Payment session data for order ' . $pesanan->id, [
                    'session_data' => $paymentData,
                    'all_session_keys' => array_keys(session()->all())
                ]);
            }
            
            if (!$paymentData) {
                abort(404, 'Data pembayaran tidak ditemukan');
            }

            $pdf = $this->receiptService->generateReceipt($pesanan, $paymentData);
            
            $filename = 'Struk_Pesanan_' . $pesanan->id . '_' . date('Y-m-d_H-i-s') . '.pdf';
            
            return $pdf->download($filename);

        } catch (\Exception $e) {
            abort(500, 'Gagal membuat struk: ' . $e->getMessage());
        }
    }

    /**
     * Get payment history
     */
    public function getPaymentHistory(): JsonResponse
    {
        $orders = Pesanan::with(['meja', 'user', 'detailPesanans.makanan'])
            ->where('status', 'dibayar')
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        // Calculate total with tax and service for each order
        $orders->getCollection()->transform(function ($order) {
            $subtotal = $order->detailPesanans->sum('subtotal');
            $tax = $subtotal * 0.1; // 10% tax
            $service = $subtotal * 0.05; // 5% service
            $total_with_tax_service = $subtotal + $tax + $service;
            
            // Add calculated total to order
            $order->total_with_tax_service = $total_with_tax_service;
            $order->tax_amount = $tax;
            $order->service_amount = $service;
            $order->subtotal_amount = $subtotal;
            
            return $order;
        });

        return response()->json([
            'success' => true,
            'data' => $orders,
            'message' => 'Riwayat pembayaran berhasil diambil'
        ]);
    }
}
