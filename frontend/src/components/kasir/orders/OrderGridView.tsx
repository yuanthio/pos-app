import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, DollarSign, Calendar } from 'lucide-react';
import type { KasirOrder } from '@/types/kasir';
import { formatCurrency, getOrderStatusColor, getOrderStatusLabel, formatDate } from '@/utils/kasirHelpers';

interface OrderGridViewProps {
  orders: KasirOrder[];
  onSelectOrder: (order: KasirOrder) => void;
  onOptimisticPayment: (order: KasirOrder) => void;
  processingOrders: Set<number>;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

export default function OrderGridView({ 
  orders, 
  onSelectOrder, 
  onOptimisticPayment,
  processingOrders,
  getStatusColor,
  getStatusIcon
}: OrderGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order: KasirOrder) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Pesanan #{order.id}</h3>
                <Badge className={`${getStatusColor(order.status)} text-xs`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {getOrderStatusLabel(order.status)}
                  </div>
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
                  <span className="font-medium">Pelayan:</span> {order.user?.name || '-'}
                </div>
                <div>
                  <span className="font-medium">Meja:</span> {order.meja?.nomor_meja || 'Take Away'}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-green-600">
                    {formatCurrency(order.total_harga)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={() => onSelectOrder(order)}
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="h-3 w-3" />
                  Detail
                </Button>
                
                {order.status !== 'dibayar' && (
                  <Button
                    onClick={() => onOptimisticPayment(order)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={processingOrders.has(order.id)}
                  >
                    {processingOrders.has(order.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Bayar
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
