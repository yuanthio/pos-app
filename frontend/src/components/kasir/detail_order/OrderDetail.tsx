import React, { useEffect, useState } from 'react';
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
  const { currentOrder } = useAppSelector((state) => state.kasir);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchKasirOrderDetails(order.id));
    
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, order.id]);

  const orderData = currentOrder || order;

  const handlePaymentSuccess = () => {
    // Do not refetch here; kasirSlice.closeOrder already updates currentOrder optimistically.
  };

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
