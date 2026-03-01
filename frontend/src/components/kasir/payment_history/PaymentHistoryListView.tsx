import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, Eye, Download } from 'lucide-react';
import type { Pesanan } from '@/types/pesanan';
import { formatCurrency, formatDate } from '@/utils/kasirHelpers';

interface PaymentHistoryListViewProps {
  orders: Pesanan[];
  onViewDetail: (order: Pesanan) => void;
  onDownloadReceipt: (orderId: number) => void;
}

export default function PaymentHistoryListView({ 
  orders, 
  onViewDetail, 
  onDownloadReceipt 
}: PaymentHistoryListViewProps) {
  return (
    <div className="space-y-4">
      {orders.map((order: Pesanan) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">Pesanan #{order.id}</h3>
                  <Badge className="bg-purple-100 text-purple-800">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Dibayar
                    </div>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Pelanggan:</span> {order.nama_pelanggan || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Pelayan:</span> {order.user?.name || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Meja:</span> {order.meja?.nomor_meja || 'Take Away'}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> {formatCurrency(order.total_harga)}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onViewDetail(order)}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Detail
                </Button>
                
                <Button
                  onClick={() => onDownloadReceipt(order.id)}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4" />
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
