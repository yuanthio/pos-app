import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, DollarSign } from 'lucide-react';
import type { KasirOrder } from '@/types/kasir';
import { formatDate, getOrderStatusColor, getOrderStatusLabel } from '@/utils/kasirHelpers';

interface OrderDetailInfoProps {
  order: KasirOrder;
}

export default function OrderDetailInfo({ order }: OrderDetailInfoProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'diproses':
        return <Clock className="h-4 w-4" />;
      case 'selesai':
        return <CheckCircle className="h-4 w-4" />;
      case 'dibayar':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Nomor Pesanan:</span>
          <span className="font-medium">#{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Nama Pelanggan:</span>
          <span className="font-medium">{order.nama_pelanggan || 'Guest'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <Badge className={getOrderStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            <span className="ml-1">{getOrderStatusLabel(order.status)}</span>
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Waktu Pesanan:</span>
          <span className="font-medium">{formatDate(order.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Meja:</span>
          <span className="font-medium">{order.meja?.nomor_meja || `#${order.meja_id}`}</span>
        </div>
      </CardContent>
    </Card>
  );
}
