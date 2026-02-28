<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meja;
use App\Models\Pesanan;
use App\Models\Makanan;
use App\Models\DetailPesanan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PelayanController extends Controller
{
    /**
     * Get all tables with status summary (optimized)
     */
    public function getTables(): JsonResponse
    {
        // Optimized: Use select only needed columns and avoid N+1
        $mejas = Meja::select(['id', 'nomor_meja', 'status', 'kapasitas', 'catatan'])->get();
        
        // Optimized: Process customer info in single pass without accessors
        $mejasWithCustomer = $mejas->map(function ($meja) {
            // Manual array construction to avoid toArray issues
            $mejaArray = [
                'id' => $meja->id,
                'nomor_meja' => $meja->nomor_meja,
                'status' => $meja->status,
                'kapasitas' => $meja->kapasitas,
                'catatan' => $meja->catatan,
            ];
            
            // Optimized: Direct parsing without accessor overhead
            $customerName = null;
            $bookingNotes = null;
            
            if ($meja->status === 'dipesan' && $meja->catatan) {
                // Direct string parsing - more efficient than accessors
                if (strpos($meja->catatan, 'Booking untuk:') === 0) {
                    $bookingText = substr($meja->catatan, 14);
                    $parts = explode(' - ', $bookingText, 2);
                    $customerName = isset($parts[0]) ? trim($parts[0]) : null;
                    $bookingNotes = isset($parts[1]) ? trim($parts[1]) : null;
                }
            }
            
            $mejaArray['nama_pelanggan'] = $customerName;
            $mejaArray['booking_notes'] = $bookingNotes;
            
            return $mejaArray;
        });
        
        // Optimized: Count from collection instead of multiple queries
        $statusCount = [
            'tersedia' => $mejas->where('status', 'tersedia')->count(),
            'terisi' => $mejas->where('status', 'terisi')->count(),
            'dipesan' => $mejas->where('status', 'dipesan')->count(),
            'tidak_aktif' => $mejas->where('status', 'tidak_aktif')->count(),
        ];

        $response = [
            'success' => true,
            'data' => [
                'mejas' => $mejasWithCustomer,
                'status_count' => $statusCount,
                'total_meja' => $mejas->count()
            ]
        ];

        // Optimized: Cache response for 30 seconds
        return response()->json($response)->header('Cache-Control', 'public, max-age=30');
    }

    /**
     * Create new order for table
     */
    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'meja_id' => 'required|exists:mejas,id',
            'nama_pelanggan' => 'nullable|string|max:255',
            'catatan' => 'nullable|string'
        ]);

        $meja = Meja::findOrFail($request->meja_id);

        // Allow order creation from 'dipesan' tables as well
        if (!$meja->isAvailable() && $meja->status !== 'dipesan') {
            return response()->json([
                'success' => false,
                'message' => 'Meja tidak tersedia untuk pesanan baru'
            ], 400);
        }

        // Extract customer info from booking if available
        $namaPelanggan = $request->nama_pelanggan;
        $catatan = $request->catatan;

        if (!$namaPelanggan && $meja->status === 'dipesan') {
            $namaPelanggan = $meja->nama_pelanggan;
            // Jangan sertakan catatan booking saat membuat pesanan
            $catatan = null;
        }

        // Update table status to terisi
        $meja->update(['status' => 'terisi']);

        // Create new order
        $pesanan = Pesanan::create([
            'meja_id' => $request->meja_id,
            'user_id' => $request->user()->id,
            'nama_pelanggan' => $namaPelanggan,
            'status' => 'menunggu',
            'total_harga' => 0,
            'catatan' => $catatan // Catatan bisa null jika dari booking
        ]);

        return response()->json([
            'success' => true,
            'data' => $pesanan->load(['meja', 'user']),
            'message' => 'Pesanan berhasil dibuat'
        ]);
    }

    public function deleteOrder($pesanan): JsonResponse
    {
        try {
            $order = Pesanan::findOrFail($pesanan);
            
            // Get meja information before deleting
            $meja = $order->meja;
            
            // Hapus pesanan
            $order->delete();
            
            // Update meja status ke tersedia dan hapus catatan jika dari booking
            if ($meja) {
                $updateData = ['status' => 'tersedia'];
                
                // Hapus catatan jika meja ini dari booking (ada catatan booking)
                if ($meja->catatan && str_contains($meja->catatan, 'Booking untuk:')) {
                    $updateData['catatan'] = null;
                }
                
                $meja->update($updateData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pesanan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function bookTable(Request $request, Meja $meja): JsonResponse
    {
        $request->validate([
            'nama_pelanggan' => 'required|string|max:255',
            'catatan' => 'nullable|string|max:1000'
        ]);

        // Check if table is available for booking
        if ($meja->status !== 'tersedia') {
            return response()->json([
                'success' => false,
                'message' => 'Meja tidak tersedia untuk booking'
            ], 400);
        }

        // Update table status to dipesan with customer info
        $meja->update([
            'status' => 'dipesan',
            'catatan' => $request->catatan ? 
                "Booking untuk: {$request->nama_pelanggan}" . 
                ($request->catatan ? " - {$request->catatan}" : "") : 
                "Booking untuk: {$request->nama_pelanggan}"
        ]);

        return response()->json([
            'success' => true,
            'data' => $meja->fresh(),
            'message' => 'Meja berhasil di-booking untuk ' . $request->nama_pelanggan
        ]);
    }

    /**
     * Get orders for pelayan
     */
    public function getOrders(): JsonResponse
    {
        $user = request()->user();
        $pesanans = Pesanan::with(['meja', 'detailPesanans.makanan'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pesanans
        ]);
    }

    /**
     * Update table status
     */
    public function updateTableStatus(Request $request, Meja $meja): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:tersedia,terisi,dipesan,tidak_aktif',
            'nama_pelanggan' => 'nullable|string|max:255',
            'catatan' => 'nullable|string'
        ]);

        $updateData = ['status' => $request->status];

        // Handle nama_pelanggan and catatan for 'dipesan' status
        if ($request->status === 'dipesan') {
            if ($request->nama_pelanggan) {
                $updateData['catatan'] = $request->catatan ? 
                    "Booking untuk: {$request->nama_pelanggan}" . 
                    ($request->catatan ? " - {$request->catatan}" : "") : 
                    "Booking untuk: {$request->nama_pelanggan}";
            }
        }

        // Hapus catatan saat status berubah ke 'terisi' atau 'tersedia'
        if ($request->status === 'terisi' || $request->status === 'tersedia') {
            $updateData['catatan'] = null;
        }

        $meja->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $meja->fresh(),
            'message' => 'Status meja berhasil diperbarui'
        ]);
    }

    /**
     * Get order detail with menu items
     */
    public function getOrderDetail(Pesanan $pesanan): JsonResponse
    {
        // Check if the pesanan belongs to the authenticated user
        if ($pesanan->user_id !== request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        $pesanan->load(['meja', 'user', 'detailPesanans.makanan']);

        return response()->json([
            'success' => true,
            'data' => $pesanan
        ]);
    }

    /**
     * Add item to order
     */
    public function addItemToOrder(Request $request, Pesanan $pesanan): JsonResponse
    {
        try {
            // Check if the pesanan belongs to the authenticated user
            if ($pesanan->user_id !== request()->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this order'
                ], 403);
            }

        // Check if order can be modified
        if (!$pesanan->canBeModified()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dimodifikasi karena status: ' . $pesanan->status_label
            ], 400);
        }

        $request->validate([
            'makanan_id' => 'required|integer|min:1',
            'jumlah' => 'required|integer|min:1',
            'catatan' => 'nullable|string|max:255'
        ]);

        // Check if makanan exists
        $makanan = Makanan::find($request->makanan_id);
        if (!$makanan) {
            return response()->json([
                'success' => false,
                'message' => 'Makanan tidak ditemukan',
                'errors' => [
                    'makanan_id' => ['Makanan dengan ID ' . $request->makanan_id . ' tidak ada dalam database']
                ]
            ], 404);
        }

        if (!$makanan->tersedia) {
            return response()->json([
                'success' => false,
                'message' => 'Makanan tidak tersedia'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Check if item already exists in order
            $existingDetail = DetailPesanan::where('pesanan_id', $pesanan->id)
                ->where('makanan_id', $request->makanan_id)
                ->first();

            if ($existingDetail) {
                // Update existing item quantity
                $existingDetail->jumlah += $request->jumlah;
                $existingDetail->subtotal = $existingDetail->jumlah * $existingDetail->harga_satuan;
                $existingDetail->save();
            } else {
                // Create new detail item
                DetailPesanan::create([
                    'pesanan_id' => $pesanan->id,
                    'makanan_id' => $request->makanan_id,
                    'jumlah' => $request->jumlah,
                    'harga_satuan' => $makanan->harga,
                    'subtotal' => $makanan->harga * $request->jumlah,
                    'catatan' => $request->catatan
                ]);
            }

            // Update total harga
            $this->updateOrderTotal($pesanan);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pesanan->fresh()->load(['meja', 'user', 'detailPesanans.makanan']),
                'message' => 'Makanan berhasil ditambahkan ke pesanan'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan makanan: ' . $e->getMessage()
            ], 500);
        }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order total
     */
    private function updateOrderTotal(Pesanan $pesanan): void
    {
        $total = $pesanan->detailPesanans()->sum('subtotal');
        $pesanan->update(['total_harga' => (float) $total]);
    }

    /**
     * Update item quantity in order
     */
    public function updateItemQuantity(Request $request, Pesanan $pesanan, DetailPesanan $detailPesanan): JsonResponse
    {
        // Check if the pesanan belongs to the authenticated user
        if ($pesanan->user_id !== request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        // Check if detail pesanan belongs to the pesanan
        if ($detailPesanan->pesanan_id !== $pesanan->id) {
            return response()->json([
                'success' => false,
                'message' => 'Item tidak ditemukan dalam pesanan ini'
            ], 404);
        }

        // Check if order can be modified
        if (!$pesanan->canBeModified()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dimodifikasi karena status: ' . $pesanan->status_label
            ], 400);
        }

        $request->validate([
            'jumlah' => 'required|integer|min:1'
        ]);

        // Check if makanan still exists
        $makanan = $detailPesanan->makanan;
        if (!$makanan) {
            return response()->json([
                'success' => false,
                'message' => 'Makanan tidak ditemukan',
                'errors' => [
                    'makanan' => ['Makanan untuk item ini tidak ada dalam database']
                ]
            ], 404);
        }

        DB::beginTransaction();
        try {
            $detailPesanan->jumlah = $request->jumlah;
            $detailPesanan->subtotal = $detailPesanan->jumlah * $detailPesanan->harga_satuan;
            $detailPesanan->save();

            $this->updateOrderTotal($pesanan);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pesanan->fresh()->load(['meja', 'user', 'detailPesanans.makanan']),
                'message' => 'Jumlah item berhasil diperbarui'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui jumlah: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from order
     */
    public function removeItemFromOrder(Pesanan $pesanan, DetailPesanan $detailPesanan): JsonResponse
    {
        // Check if the pesanan belongs to the authenticated user
        if ($pesanan->user_id !== request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        // Check if detail pesanan belongs to the pesanan
        if ($detailPesanan->pesanan_id !== $pesanan->id) {
            return response()->json([
                'success' => false,
                'message' => 'Item tidak ditemukan dalam pesanan ini'
            ], 404);
        }

        // Check if order can be modified
        if (!$pesanan->canBeModified()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dimodifikasi karena status: ' . $pesanan->status_label
            ], 400);
        }

        // Check if makanan still exists (for logging purposes)
        $makanan = $detailPesanan->makanan;
        if (!$makanan) {
            return response()->json([
                'success' => false,
                'message' => 'Makanan tidak ditemukan',
                'errors' => [
                    'makanan' => ['Makanan untuk item ini tidak ada dalam database']
                ]
            ], 404);
        }

        DB::beginTransaction();
        try {
            $detailPesanan->delete();
            $this->updateOrderTotal($pesanan);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pesanan->fresh()->load(['meja', 'user', 'detailPesanans.makanan']),
                'message' => 'Item berhasil dihapus dari pesanan'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete order (menyelesaikan pesanan)
     */
    public function completeOrder(Pesanan $pesanan): JsonResponse
    {
        // Check if pesanan belongs to authenticated user
        if ($pesanan->user_id !== request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        // Check if order can be completed
        if (!$pesanan->canBeCompleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat diselesaikan karena status: ' . $pesanan->status_label
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update order status to selesai
            $pesanan->update(['status' => 'selesai']);

            // Update table status to tersedia
            $meja = $pesanan->meja;
            if ($meja) {
                $meja->update(['status' => 'tersedia']);
            }

            // Final calculation of total
            $this->updateOrderTotal($pesanan);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pesanan->fresh()->load(['meja', 'user', 'detailPesanans.makanan']),
                'message' => 'Pesanan berhasil diselesaikan'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyelesaikan pesanan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel order (membatalkan pesanan)
     */
    public function cancelOrder(Request $request, Pesanan $pesanan): JsonResponse
    {
        // Check if pesanan belongs to authenticated user
        if ($pesanan->user_id !== request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        // Check if order can be cancelled
        if (!$pesanan->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dibatalkan karena status: ' . $pesanan->status_label
            ], 400);
        }

        $request->validate([
            'alasan' => 'nullable|string|max:255'
        ]);

        DB::beginTransaction();
        try {
            // Update order status to dibatalkan
            $pesanan->update([
                'status' => 'dibatalkan',
                'catatan' => $pesanan->catatan . ($request->alasan ? "\n\nAlasan pembatalan: " . $request->alasan : "")
            ]);

            // Update table status to tersedia dan hapus catatan jika dari booking
            $meja = $pesanan->meja;
            if ($meja) {
                $updateData = ['status' => 'tersedia'];
                
                // Hapus catatan jika meja ini dari booking (ada catatan booking)
                if ($meja->catatan && str_contains($meja->catatan, 'Booking untuk:')) {
                    $updateData['catatan'] = null;
                }
                
                $meja->update($updateData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pesanan->fresh()->load(['meja', 'user', 'detailPesanans.makanan']),
                'message' => 'Pesanan berhasil dibatalkan'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membatalkan pesanan: ' . $e->getMessage()
            ], 500);
        }
    }
}
