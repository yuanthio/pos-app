import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, Eye, Download } from 'lucide-react';
import type { Pesanan } from '@/types/pesanan';
import { formatCurrency, formatDate } from '@/utils/kasirHelpers';

interface PaymentHistoryGridViewProps {
  orders: Pesanan[];
  onViewDetail: (order: Pesanan) => void;
  onDownloadReceipt: (orderId: number) => void;
}

export default function PaymentHistoryGridView({ 
  orders, 
  onViewDetail, 
  onDownloadReceipt 
}: PaymentHistoryGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order: Pesanan) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Pesanan #{order.id}</h3>
                <Badge className="bg-purple-100 text-purple-800 text-xs">
                  <DollarSign className="h-3 w-3" />
                  Dibayar
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium">Pelanggan:</span> {order.nama_pelanggan || 'Guest'}
                </div>
                <div>
                  <span className="font-medium">Meja:</span> {order.meja?.nomor_meja || 'Take Away'}
                </div>
                <div>
                  <span className="font-medium">Pelayan:</span> {order.user?.name || '-'}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-green-600">
                    {formatCurrency(order.total_with_tax_service || order.total_harga)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={() => onViewDetail(order)}
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="h-3 w-3" />
                  Detail
                </Button>
                
                <Button
                  onClick={() => onDownloadReceipt(order.id)}
                  variant="default"
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-3 w-3" />
                  Struk
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
