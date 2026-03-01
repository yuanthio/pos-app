import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchKasirOrderDetails, clearCurrentOrder } from '@/store/kasirSlice';
import type { KasirOrder } from '@/types/kasir';
import { downloadReceipt } from '@/utils/kasirHelpers';
import { 
  OrderDetailHeader, 
  OrderDetailInfo, 
  OrderDetailItems, 
  OrderDetailCalculation, 
  OrderDetailActions, 
  PaymentDialog 
} from './index';

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
      <OrderDetailHeader order={orderData} onBack={onBack} />

      {/* Order Info */}
      <OrderDetailInfo order={orderData} />

      {/* Order Items */}
      <OrderDetailItems order={orderData} />

      {/* Payment Calculation */}
      <OrderDetailCalculation order={orderData} />

      {/* Actions */}
      <OrderDetailActions
        order={orderData}
        onPayment={() => setShowPaymentDialog(true)}
        onDownloadReceipt={() => downloadReceipt(orderData.id)}
      />

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
