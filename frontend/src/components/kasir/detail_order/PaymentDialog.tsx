import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, CreditCard, Wallet, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { closeOrder, generateReceipt } from '@/store/kasirSlice';
import type { KasirOrder, PaymentFormData } from '@/types/kasir';
import { 
  formatCurrency, 
  validatePaymentForm, 
  calculatePaymentDetails,
  getPaymentMethodLabel,
  getOrderStatusColor,
  getOrderStatusLabel,
  handleApiError
} from '@/utils/kasirHelpers';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: KasirOrder | null;
  onSuccess?: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  order,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { paymentLoading, receiptLoading } = useAppSelector((state) => state.kasir);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    payment_method: 'tunai',
    payment_amount: '',
    customer_name: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate payment details
  const paymentDetails = calculatePaymentDetails(order?.total_harga || 0);
  const paymentAmount = parseFloat(formData.payment_amount) || 0;
  const change = paymentAmount - paymentDetails.total;
  
  // Check if payment amount is sufficient
  const isPaymentSufficient = paymentAmount >= paymentDetails.total;
  const isFormValid = isPaymentSufficient && formData.payment_amount !== '' && !isNaN(paymentAmount);

  useEffect(() => {
    if (order) {
      setFormData(prev => ({
        ...prev,
        customer_name: order.nama_pelanggan || '',
        payment_amount: paymentDetails.total.toString(),
      }));
    }
  }, [order, paymentDetails.total]);

  const validateForm = (): boolean => {
    if (!order) return false;

    const validationErrors = validatePaymentForm(formData, paymentDetails.total);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order || !validateForm()) return;

    // Optimistic update - update UI immediately
    const updatedOrder = {
      ...order,
      status: 'dibayar' as const,
    };

    try {
      // Close dialog immediately for better UX
      onOpenChange(false);
      
      // Reset form
      setFormData({
        payment_method: 'tunai',
        payment_amount: '',
        customer_name: '',
        notes: '',
      });

      // Call API in background
      await dispatch(closeOrder({
        orderId: order.id,
        paymentData: formData,
      })).unwrap();

      // Generate receipt
      await dispatch(generateReceipt(order.id)).unwrap();

      onSuccess?.();
      
      // Show success message
      toast.success('Pembayaran berhasil! Struk sedang dicetak...', {
        duration: 3000,
        position: 'bottom-right',
      });
      
    } catch (error: any) {
      console.error('Payment failed:', error);
      const errorMessage = handleApiError(error);
      
      // Re-open dialog on error
      onOpenChange(true);
      
      // Restore form data
      setFormData({
        payment_method: 'tunai',
        payment_amount: paymentDetails.total.toString(),
        customer_name: order.nama_pelanggan || '',
        notes: '',
      });
      
      // Show error toast
      toast.error(errorMessage, {
        duration: 5000,
        position: 'bottom-right',
      });
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'tunai':
        return <DollarSign className="h-4 w-4" />;
      case 'transfer':
        return <CreditCard className="h-4 w-4" />;
      case 'e-wallet':
        return <Wallet className="h-4 w-4" />;
      default:
        return <Calculator className="h-4 w-4" />;
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pembayaran Pesanan #{order.id}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Ringkasan Pesanan</h3>
                <Badge className={getOrderStatusColor(order.status)}>
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span>{order.nama_pelanggan || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Meja:</span>
                  <span>{order.meja?.nomor_meja || 'Take Away'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelayan:</span>
                  <span>{order.user?.name || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Detail Pembayaran</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(paymentDetails.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (10%):</span>
                  <span>{formatCurrency(paymentDetails.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service (5%):</span>
                  <span>{formatCurrency(paymentDetails.service)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(paymentDetails.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Metode Pembayaran</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value: 'tunai' | 'transfer' | 'e-wallet') =>
                    setFormData(prev => ({ ...prev, payment_method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon('tunai')}
                        {getPaymentMethodLabel('tunai')}
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon('transfer')}
                        {getPaymentMethodLabel('transfer')}
                      </div>
                    </SelectItem>
                    <SelectItem value="e-wallet">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon('e-wallet')}
                        {getPaymentMethodLabel('e-wallet')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-sm text-red-600">{errors.payment_method}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_amount">Jumlah Pembayaran</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  placeholder="0"
                  value={formData.payment_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_amount: e.target.value }))}
                  className={`text-lg font-semibold ${!isPaymentSufficient && formData.payment_amount !== '' ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.payment_amount && (
                  <p className="text-sm text-red-600">{errors.payment_amount}</p>
                )}
                {!isPaymentSufficient && formData.payment_amount !== '' && (
                  <p className="text-sm text-red-600">
                    Nominal pembayaran kurang {formatCurrency(paymentDetails.total - paymentAmount)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_name">Nama Pelanggan</Label>
              <Input
                id="customer_name"
                placeholder="Masukkan nama pelanggan"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan pembayaran (opsional)"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Change Calculation */}
            {paymentAmount > paymentDetails.total && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-800">Kembalian:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(change)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={paymentLoading || receiptLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={paymentLoading || receiptLoading || !isFormValid}
            >
              {paymentLoading || receiptLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                'Bayar & Cetak Struk'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
