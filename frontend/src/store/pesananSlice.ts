import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type {
  Pesanan,
  PesananState,
  PesananResponse,
  SinglePesananResponse,
  AddItemRequest,
  AddItemResponse,
  UpdateItemResponse,
  RemoveItemResponse,
  PesananFilters,
  OrderSummary,
  DetailPesanan
} from '@/types'
import api from '@/lib/api'

const initialState: PesananState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchOrders = createAsyncThunk<
  Pesanan[],
  PesananFilters | undefined,
  { rejectValue: string }
>(
  'pesanan/fetchOrders',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const response = await api.get<PesananResponse>(`/pelayan/orders?${params}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Gagal mengambil data pesanan'
      )
    }
  }
)

export const fetchOrderDetail = createAsyncThunk<
  Pesanan,
  number,
  { rejectValue: string }
>(
  'pesanan/fetchOrderDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get<SinglePesananResponse>(`/pelayan/orders/${orderId}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Gagal mengambil detail pesanan'
      )
    }
  }
)

export const deleteOrder = createAsyncThunk(
  'pesanan/deleteOrder',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/pelayan/orders/${orderId}`)
      return { orderId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete order')
    }
  }
)

export const addItemToOrder = createAsyncThunk<
  Pesanan,
  { orderId: number; item: AddItemRequest },
  { rejectValue: string }
>(
  'pesanan/addItemToOrder',
  async ({ orderId, item }, { rejectWithValue }) => {
    try {
      const response = await api.post<AddItemResponse>(
        `/pelayan/orders/${orderId}/items`,
        item
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Gagal menambahkan item ke pesanan'
      )
    }
  }
)

export const updateItemQuantity = createAsyncThunk<
  Pesanan,
  { orderId: number; detailId: number; quantity: number },
  { rejectValue: string }
>(
  'pesanan/updateItemQuantity',
  async ({ orderId, detailId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put<UpdateItemResponse>(
        `/pelayan/orders/${orderId}/items/${detailId}`,
        { jumlah: quantity }
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Gagal memperbarui jumlah item'
      )
    }
  }
)

export const removeItemFromOrder = createAsyncThunk<
  Pesanan,
  { orderId: number; detailId: number },
  { rejectValue: string }
>(
  'pesanan/removeItemFromOrder',
  async ({ orderId, detailId }, { rejectWithValue }) => {
    try {
      const response = await api.delete<RemoveItemResponse>(
        `/pelayan/orders/${orderId}/items/${detailId}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Gagal menghapus item dari pesanan'
      )
    }
  }
)

export const fetchOrderSummary = createAsyncThunk<
  OrderSummary,
  void,
  { rejectValue: string }
>(
  'pesanan/fetchOrderSummary',
  async (_, { rejectWithValue }) => {
    try {
      // This would be a new endpoint for dashboard summary
      // For now, we'll calculate from existing orders
      const response = await api.get<PesananResponse>('/pelayan/orders')
      const orders = response.data.data
      
      const summary: OrderSummary = {
        total_orders: orders.length,
        active_orders: orders.filter((o: Pesanan) => o.status === 'menunggu' || o.status === 'diproses').length,
        completed_orders: orders.filter((o: Pesanan) => o.status === 'selesai').length,
        total_revenue: orders.filter((o: Pesanan) => o.status === 'selesai').reduce((sum: number, o: Pesanan) => sum + o.total_harga, 0),
      }
      
      return summary
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Gagal mengambil ringkasan pesanan'
      )
    }
  }
)

// Slice
const pesananSlice = createSlice({
  name: 'pesanan',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: number; status: string }>) => {
      const order = state.orders.find(o => o.id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status as any
      }
      if (state.currentOrder && state.currentOrder.id === action.payload.orderId) {
        state.currentOrder.status = action.payload.status as any
      }
    },
    addOrder: (state, action: PayloadAction<Pesanan>) => {
      // Add new order to the beginning of array
      state.orders.unshift(action.payload)
    },
    removeOrder: (state, action: PayloadAction<number>) => {
      // Remove order from orders array
      state.orders = state.orders.filter(order => order.id !== action.payload)
      
      // Clear current order if it's the one being deleted
      if (state.currentOrder && state.currentOrder.id === action.payload) {
        state.currentOrder = null
      }
    },
    addItemOptimistic: (state, action: PayloadAction<{ orderId: number; item: DetailPesanan }>) => {
      if (state.currentOrder && state.currentOrder.id === action.payload.orderId) {
        if (!state.currentOrder.detail_pesanans) {
          state.currentOrder.detail_pesanans = []
        }
        // Add new item to the beginning of the array
        state.currentOrder.detail_pesanans.unshift(action.payload.item)
        // Update total harga
        state.currentOrder.total_harga += action.payload.item.subtotal
      }
    },
    updateItemOptimistic: (state, action: PayloadAction<{ orderId: number; detailId: number; quantity: number; subtotal: number }>) => {
      if (state.currentOrder && state.currentOrder.id === action.payload.orderId && state.currentOrder.detail_pesanans) {
        const item = state.currentOrder.detail_pesanans.find(d => d.id === action.payload.detailId)
        if (item) {
          const oldSubtotal = item.subtotal
          item.jumlah = action.payload.quantity
          item.subtotal = action.payload.subtotal
          // Update total harga
          state.currentOrder.total_harga += (action.payload.subtotal - oldSubtotal)
        }
      }
    },
    removeItemOptimistic: (state, action: PayloadAction<{ orderId: number; detailId: number }>) => {
      if (state.currentOrder && state.currentOrder.id === action.payload.orderId && state.currentOrder.detail_pesanans) {
        const itemIndex = state.currentOrder.detail_pesanans.findIndex(d => d.id === action.payload.detailId)
        if (itemIndex !== -1) {
          const item = state.currentOrder.detail_pesanans[itemIndex]
          // Update total harga
          state.currentOrder.total_harga -= item.subtotal
          // Remove item
          state.currentOrder.detail_pesanans.splice(itemIndex, 1)
        }
      }
    },
  },
  extraReducers: (builder) => {
    // fetchOrders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Gagal mengambil data pesanan'
      })

    // fetchOrderDetail
    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Gagal mengambil detail pesanan'
      })

    // addItemToOrder
    builder
      .addCase(addItemToOrder.pending, (state) => {
        // Jangan ubah loading state untuk maintain optimistic update
        state.error = null
      })
      .addCase(addItemToOrder.fulfilled, (state, action) => {
        // Sync with server data (includes complete order info)
        state.currentOrder = action.payload
        // Update order in orders array if it exists
        const index = state.orders.findIndex(order => order.id === action.payload.id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
      })
      .addCase(addItemToOrder.rejected, (state, action) => {
        // Jangan ubah loading state untuk maintain optimistic update
        state.error = action.payload || 'Gagal menambahkan item ke pesanan'
      })

    // updateItemQuantity
    builder
      .addCase(updateItemQuantity.pending, (state) => {
        // Jangan ubah loading state untuk maintain optimistic update
        state.error = null
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        // Sync with server data
        state.currentOrder = action.payload
        // Update order in orders array if it exists
        const index = state.orders.findIndex(order => order.id === action.payload.id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        // Jangan ubah loading state untuk maintain optimistic update
        state.error = action.payload || 'Gagal memperbarui jumlah item'
      })

    // removeItemFromOrder
    builder
      .addCase(removeItemFromOrder.pending, (state) => {
        // Jangan ubah loading state untuk maintain optimistic update
        state.error = null
      })
      .addCase(removeItemFromOrder.fulfilled, (state, action) => {
        // Sync with server data
        state.currentOrder = action.payload
        // Update order in orders array if it exists
        const index = state.orders.findIndex(order => order.id === action.payload.id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
      })
      .addCase(removeItemFromOrder.rejected, (state, action) => {
        // Jangan ubah loading state untuk maintain optimistic update
        state.error = action.payload || 'Gagal menghapus item'
      })

    // fetchOrderSummary
    builder
      .addCase(fetchOrderSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderSummary.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(fetchOrderSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Gagal mengambil ringkasan pesanan'
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false
        // Remove order from state
        state.orders = state.orders.filter(order => order.id !== action.payload.orderId)
        
        // Clear current order if it's the one being deleted
        if (state.currentOrder && state.currentOrder.id === action.payload.orderId) {
          state.currentOrder = null
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCurrentOrder, clearError, updateOrderStatus, addOrder } = pesananSlice.actions
export default pesananSlice.reducer
