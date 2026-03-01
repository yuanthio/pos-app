<?php

namespace App\Services;

use App\Models\Pesanan;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptService
{
    /**
     * Generate receipt PDF
     */
    public function generateReceipt(Pesanan $pesanan, array $paymentData)
    {
        $pesananWithRelations = Pesanan::with(['detailPesanans.makanan', 'user', 'meja'])
            ->find($pesanan->id);

        $data = [
            'pesanan' => $pesananWithRelations,
            'payment' => $paymentData,
            'restaurant' => $this->getRestaurantInfo(),
            'date' => now()->format('d F Y H:i:s')
        ];

        $pdf = Pdf::loadView('receipts.order', $data);

        // PERBAIKAN: Gunakan format array [width, height] dalam point (1mm = 2.83pt)
        // 80mm = 226.77pt. Tinggi kita buat dinamis atau secukupnya (misal: 400pt-500pt)
        // Untuk struk thermal, biasanya kita set tinggi yang sangat pas.
        $pdf->setPaper([0, 0, 226.77, 500], 'portrait');

        return $pdf;
    }

    /**
     * Get restaurant information
     */
    private function getRestaurantInfo(): array
    {
        return [
            'name' => config('app.name', 'POS Restaurant'),
            'address' => 'Jl. Example No. 123, Jakarta',
            'phone' => '+62 812-3456-7890',
            'email' => 'info@posrestaurant.com',
            'tax_id' => 'NPWP: 12.345.678.9-012.000'
        ];
    }

    /**
     * Format currency
     */
    public function formatCurrency($amount): string
    {
        return 'Rp ' . number_format($amount, 0, ',', '.');
    }

    /**
     * Calculate payment breakdown
     */
    public function calculateBreakdown(Pesanan $pesanan): array
    {
        $subtotal = $pesanan->detailPesanans->sum('subtotal');
        $tax = $subtotal * 0.1;
        $service = $subtotal * 0.05;
        $total = $subtotal + $tax + $service;

        return [
            'subtotal' => $subtotal,
            'tax' => $tax,
            'service' => $service,
            'total' => $total,
            'tax_rate' => 10,
            'service_rate' => 5
        ];
    }
}
