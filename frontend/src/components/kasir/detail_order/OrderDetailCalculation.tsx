import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KasirOrder } from '@/types/kasir';
import { formatCurrency, calculatePaymentDetails } from '@/utils/kasirHelpers';

interface OrderDetailCalculationProps {
  order: KasirOrder;
}

export default function OrderDetailCalculation({ order }: OrderDetailCalculationProps) {
  const paymentDetails = calculatePaymentDetails(order.total_harga);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perhitungan Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(paymentDetails.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pajak (10%):</span>
            <span>{formatCurrency(paymentDetails.tax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service (5%):</span>
            <span>{formatCurrency(paymentDetails.service)}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(paymentDetails.total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
