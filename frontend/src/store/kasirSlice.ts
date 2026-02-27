import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { 
  KasirState, 
  KasirOrder, 
  PaymentFormData, 
  PaymentData,
  ReceiptData,
  KasirOrdersResponse,
  KasirOrderDetailsResponse,
  CloseOrderResponse,
  GenerateReceiptResponse,
  PaymentHistoryResponse
} from '../types/kasir';
import type { Pesanan } from '../types/pesanan';
import api from '../lib/api';

const initialState: KasirState = {
  orders: [],
  currentOrder: null,
  paymentHistory: [],
  loading: false,
  error: null,
  paymentLoading: false,
  receiptLoading: false,
};

// Async thunks
export const fetchKasirOrders = createAsyncThunk<
  KasirOrder[],
  void,
  { rejectValue: string }
>('kasir/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<KasirOrdersResponse>('/kasir/orders');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchKasirOrderDetails = createAsyncThunk<
  { order: KasirOrder; payment_details: any },
  number,
  { rejectValue: string }
>('kasir/fetchOrderDetails', async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get<KasirOrderDetailsResponse>(`/kasir/orders/${orderId}`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
  }
});

export const closeOrder = createAsyncThunk<
  { order: KasirOrder; payment: PaymentData },
  { orderId: number; paymentData: PaymentFormData },
  { rejectValue: string }
>('kasir/closeOrder', async ({ orderId, paymentData }, { rejectWithValue }) => {
  try {
    const response = await api.post<CloseOrderResponse>(`/kasir/orders/${orderId}/close`, {
      payment_method: paymentData.payment_method,
      payment_amount: parseFloat(paymentData.payment_amount),
      customer_name: paymentData.customer_name,
      notes: paymentData.notes,
    });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to close order');
  }
});

export const generateReceipt = createAsyncThunk<
  ReceiptData,
  number,
  { rejectValue: string }
>('kasir/generateReceipt', async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.post<GenerateReceiptResponse>(`/kasir/orders/${orderId}/receipt`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to generate receipt');
  }
});

export const fetchPaymentHistory = createAsyncThunk<
  Pesanan[],
  void,
  { rejectValue: string }
>('kasir/fetchPaymentHistory', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<PaymentHistoryResponse>('/kasir/payment-history');
    return response.data.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
  }
});

// Slice
const kasirSlice = createSlice({
  name: 'kasir',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    resetState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchKasirOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKasirOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchKasirOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch order details
    builder
      .addCase(fetchKasirOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKasirOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchKasirOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Close order
    builder
      .addCase(closeOrder.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(closeOrder.fulfilled, (state, action) => {
        state.paymentLoading = false;
        // Update order in list
        const index = state.orders.findIndex(order => order.id === action.payload.order.id);
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
        // Update current order
        if (state.currentOrder && state.currentOrder.id === action.payload.order.id) {
          state.currentOrder = action.payload.order;
        }
      })
      .addCase(closeOrder.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload as string;
      });

    // Generate receipt
    builder
      .addCase(generateReceipt.pending, (state) => {
        state.receiptLoading = true;
        state.error = null;
      })
      .addCase(generateReceipt.fulfilled, (state) => {
        state.receiptLoading = false;
      })
      .addCase(generateReceipt.rejected, (state, action) => {
        state.receiptLoading = false;
        state.error = action.payload as string;
      });

    // Fetch payment history
    builder
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentOrder, resetState } = kasirSlice.actions;
export default kasirSlice.reducer;
