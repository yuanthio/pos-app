import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { KasirOrder } from '@/types/kasir';

interface OrderDetailHeaderProps {
  order: KasirOrder;
  onBack: () => void;
}

export default function OrderDetailHeader({ order, onBack }: OrderDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Detail Pesanan</h2>
          <p className="text-muted-foreground">Order #{order.id}</p>
        </div>
      </div>
    </div>
  );
}
