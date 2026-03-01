import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KasirOrder } from '@/types/kasir';
import type { DetailPesanan } from '@/types/pesanan';
import { formatCurrency } from '@/utils/kasirHelpers';

interface OrderDetailItemsProps {
  order: KasirOrder;
}

export default function OrderDetailItems({ order }: OrderDetailItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Pesanan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.detail_pesanans?.map((item: DetailPesanan) => (
            <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.makanan?.nama}</div>
                <div className="text-sm text-gray-600">
                  {item.jumlah} × {formatCurrency(item.harga_satuan)}
                </div>
                {item.catatan && (
                  <div className="text-sm text-gray-500 italic mt-1">
                    Catatan: {item.catatan}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(item.subtotal)}</div>
              </div>
            </div>
          )) || (
            <div className="text-center py-4 text-gray-500">
              Tidak ada item pesanan
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
