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
        $data = [
            'pesanan' => $pesanan,
            'payment' => $paymentData,
            'restaurant' => $this->getRestaurantInfo(),
            'date' => now()->format('d F Y H:i:s')
        ];

        $pdf = Pdf::loadView('receipts.order', $data);
        
        // Set paper size and orientation
        $pdf->setPaper([0, 0, 226.77, 850.39], 'portrait'); // 80mm width
        
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
