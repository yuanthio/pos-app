import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, Receipt } from 'lucide-react';
import type { KasirOrder } from '@/types/kasir';

interface OrderDetailActionsProps {
  order: KasirOrder;
  onPayment: () => void;
  onDownloadReceipt?: () => void;
}

export default function OrderDetailActions({ 
  order, 
  onPayment, 
  onDownloadReceipt 
}: OrderDetailActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {order.status === 'selesai' && (
        <Button
          onClick={onPayment}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <Calculator className="h-4 w-4" />
          Proses Pembayaran
        </Button>
      )}
      
      {order.status === 'dibayar' && onDownloadReceipt && (
        <Button
          onClick={onDownloadReceipt}
          variant="default"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Receipt className="h-4 w-4" />
          Download Struk
        </Button>
      )}
    </div>
  );
}
