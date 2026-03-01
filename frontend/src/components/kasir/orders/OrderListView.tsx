import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar } from 'lucide-react';
import type { KasirOrder } from '@/types/kasir';
import { formatCurrency, getOrderStatusColor, getOrderStatusLabel, formatDate } from '@/utils/kasirHelpers';

interface OrderListViewProps {
  orders: KasirOrder[];
  onSelectOrder: (order: KasirOrder) => void;
  onOptimisticPayment: (order: KasirOrder) => void;
  processingOrders: Set<number>;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

export default function OrderListView({ 
  orders, 
  onSelectOrder, 
  onOptimisticPayment,
  processingOrders,
  getStatusColor,
  getStatusIcon
}: OrderListViewProps) {
  return (
    <div className="space-y-4">
      {orders.map((order: KasirOrder) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">Pesanan #{order.id}</h3>
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {getOrderStatusLabel(order.status)}
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
                  onClick={() => onSelectOrder(order)}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Detail
                </Button>
                
                {order.status !== 'dibayar' && (
                  <Button
                    onClick={() => onOptimisticPayment(order)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processingOrders.has(order.id)}
                  >
                    {processingOrders.has(order.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Memproses...
                      </>
                    ) : (
                      'Bayar'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
