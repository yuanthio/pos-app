import type { Pesanan } from './pesanan';

export interface PaymentData {
  pesanan_id: number;
  user_id?: number;
  payment_method: 'tunai' | 'transfer' | 'e-wallet';
  payment_amount: number;
  subtotal: number;
  tax: number;
  service: number;
  total: number;
  change: number;
  customer_name?: string;
  notes?: string;
  paid_at: string;
  tax_rate: number;
  service_rate: number;
}

export interface Payment {
  id: number;
  pesanan_id: number;
  payment_method: 'tunai' | 'transfer' | 'e-wallet';
  payment_amount: number;
  subtotal: number;
  tax: number;
  service: number;
  total: number;
  change: number;
  customer_name?: string;
  notes?: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentDetails {
  subtotal: number;
  tax: number;
  service: number;
  total: number;
  tax_rate: number;
  service_rate: number;
}

export interface KasirOrder extends Pesanan {
  payment_details?: PaymentDetails;
}

export interface PaymentFormData {
  payment_method: 'tunai' | 'transfer' | 'e-wallet';
  payment_amount: string;
  customer_name: string;
  notes: string;
}

export interface ReceiptData {
  receipt_url: string;
  filename: string;
  generated_at: string;
}

export interface KasirState {
  orders: KasirOrder[];
  currentOrder: KasirOrder | null;
  paymentHistory: Pesanan[];
  loading: boolean;
  error: string | null;
  paymentLoading: boolean;
  receiptLoading: boolean;
}

// API Response Types
export interface KasirOrdersResponse {
  success: boolean;
  data: KasirOrder[];
  message: string;
}

export interface KasirOrderDetailsResponse {
  success: boolean;
  data: {
    order: KasirOrder;
    payment_details: PaymentDetails;
  };
  message: string;
}

export interface CloseOrderResponse {
  success: boolean;
  data: {
    order: Pesanan;
    payment: PaymentData;
  };
  message: string;
}

export interface GenerateReceiptResponse {
  success: boolean;
  data: ReceiptData;
  message: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    data: Pesanan[];
    current_page: number;
    total: number;
  };
  message: string;
}
