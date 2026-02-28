import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calculator, Receipt, Clock, CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchKasirOrderDetails, clearCurrentOrder } from '@/store/kasirSlice';
import type { KasirOrder } from '@/types/kasir';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel, downloadReceipt } from '@/utils/kasirHelpers';
import PaymentDialog from './PaymentDialog';

interface OrderDetailProps {
  order: KasirOrder;
  onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onBack }) => {
  const dispatch = useAppDispatch();
  const { currentOrder, loading } = useAppSelector((state) => state.kasir);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchKasirOrderDetails(order.id));
    
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, order.id]);

  const orderData = currentOrder || order;

  const getStatusColor = (status: string) => {
    return getOrderStatusColor(status);
  };

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

  const handleDownloadReceipt = async () => {
    try {
      await downloadReceipt(orderData.id);
    } catch (error) {
      console.error('Download receipt failed:', error);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh order details after payment
    dispatch(fetchKasirOrderDetails(order.id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-muted-foreground">Memuat detail pesanan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h2 className="text-2xl font-bold">Detail Pesanan #{orderData.id}</h2>
        </div>
        <Badge className={getStatusColor(orderData.status)}>
          <div className="flex items-center gap-1">
            {getStatusIcon(orderData.status)}
            {getOrderStatusLabel(orderData.status)}
          </div>
        </Badge>
      </div>

      {/* Order Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama Pelanggan</p>
              <p className="font-medium">{orderData.nama_pelanggan || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meja</p>
              <p className="font-medium">{orderData.meja?.nomor_meja || 'Take Away'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pelayan</p>
              <p className="font-medium">{orderData.user?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal</p>
              <p className="font-medium">{formatDate(orderData.created_at)}</p>
            </div>
          </div>
          {orderData.catatan && (
            <div>
              <p className="text-sm text-muted-foreground">Catatan</p>
              <p className="font-medium">{orderData.catatan}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Item Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          {orderData.detail_pesanans && orderData.detail_pesanans.length > 0 ? (
            <div className="space-y-3">
              {orderData.detail_pesanans.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.makanan?.nama}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.harga_satuan)} x {item.jumlah}
                    </p>
                    {item.catatan && (
                      <p className="text-sm text-muted-foreground italic">Cat: {item.catatan}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2"></div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Total Harga:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(orderData.total_harga)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Tidak ada item dalam pesanan</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Calculation */}
      {orderData.status !== 'dibayar' && (
        <Card>
          <CardHeader>
            <CardTitle>Perhitungan Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(orderData.total_harga)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak (10%):</span>
                <span>{formatCurrency(orderData.total_harga * 0.1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service (5%):</span>
                <span>{formatCurrency(orderData.total_harga * 0.05)}</span>
              </div>
              <div className="border-t pt-2 mt-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total Pembayaran:</span>
                <span className="text-green-600">
                  {formatCurrency(orderData.total_harga * 1.15)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {orderData.status !== 'dibayar' && (
          <Button
            onClick={() => setShowPaymentDialog(true)}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Proses Pembayaran
          </Button>
        )}
        
        {orderData.status === 'dibayar' && (
          <Button
            onClick={handleDownloadReceipt}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Receipt className="h-4 w-4" />
            Download Struk
          </Button>
        )}
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        order={orderData}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default OrderDetail;
