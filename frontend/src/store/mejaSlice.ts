import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Meja, MejaResponse, MejaStatusCount, CreateOrderRequest, CreateOrderResponse, Pesanan, PesananResponse } from '@/types'
import api from '@/lib/api'
import { addOrder } from './pesananSlice'

interface MejaState {
  mejas: Meja[]
  statusCount: MejaStatusCount
  totalMeja: number
  pesanans: Pesanan[]
  unreadOrdersCount: number
  loading: boolean
  error: string | null
  createOrderLoading: boolean
  updateStatusLoading: boolean
  lastFetch: number | null
}

const initialState: MejaState = {
  mejas: [],
  statusCount: {
    tersedia: 0,
    terisi: 0,
    dipesan: 0,
    tidak_aktif: 0
  },
  totalMeja: 0,
  pesanans: [],
  unreadOrdersCount: 0,
  loading: false,
  error: null,
  createOrderLoading: false,
  updateStatusLoading: false,
  lastFetch: null
}

// Async thunks
export const fetchMejas = createAsyncThunk(
  'meja/fetchMejas',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Optimized: Check if we have fresh data (cache for 30 seconds)
      const state = getState() as { meja: MejaState }
      const lastFetch = state.meja.lastFetch || 0
      const now = Date.now()
      const CACHE_DURATION = 30000 // 30 seconds
      
      // Return cached data if still fresh
      if (lastFetch && (now - lastFetch) < CACHE_DURATION && state.meja.mejas.length > 0) {
        // Simulate API response structure for cached data
        return {
          success: true,
          data: {
            mejas: state.meja.mejas,
            status_count: state.meja.statusCount,
            total_meja: state.meja.totalMeja
          }
        } as MejaResponse
      }
      
      const response = await api.get<MejaResponse>('/pelayan/tables')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tables')
    }
  }
)

export const createOrder = createAsyncThunk(
  'meja/createOrder',
  async (orderData: CreateOrderRequest, { rejectWithValue, dispatch, getState }) => {
    const state = getState() as { meja: MejaState }
    const meja = state.meja.mejas.find(m => m.id === orderData.meja_id)
    
    if (!meja) {
      return rejectWithValue('Meja tidak ditemukan')
    }

    // Create optimistic pesanan object
    const optimisticPesanan: Pesanan = {
      id: Date.now(), // Temporary ID using timestamp
      meja_id: orderData.meja_id,
      user_id: 0, // Will be updated by server
      nama_pelanggan: orderData.nama_pelanggan || undefined,
      status: 'menunggu',
      total_harga: 0, // Will be updated by server
      catatan: orderData.catatan || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      meja: meja
    }

    // Optimistic update - tambahkan pesanan ke state
    dispatch(addPesananOptimistically(optimisticPesanan))
    dispatch(updateTableStatusOptimistically({ mejaId: orderData.meja_id, newStatus: 'terisi' }))

    try {
      const response = await api.post<CreateOrderResponse>('/pelayan/orders', orderData)
      
      // Replace optimistic pesanan with real data from server
      dispatch(removePesananOptimistically(optimisticPesanan.id))
      dispatch(addPesananOptimistically(response.data.data))
      
      // Sync with pesananSlice state
      dispatch(addOrder(response.data.data))
      
      // Update table status in mejaSlice
      if (response.data.data.meja) {
        dispatch(updateTableStatusOptimistically({ 
          mejaId: response.data.data.meja.id, 
          newStatus: 'terisi' 
        }))
      }
      
      return response.data
    } catch (error: any) {
      // Rollback optimistic update on error
      dispatch(removePesananOptimistically(optimisticPesanan.id))
      dispatch(updateTableStatusOptimistically({ mejaId: orderData.meja_id, newStatus: meja.status }))
      
      return rejectWithValue(error.response?.data?.message || 'Failed to create order')
    }
  }
)

export const deleteOrderFromMejaSlice = createAsyncThunk(
  'meja/deleteOrder',
  async (orderId: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.delete(`/pelayan/orders/${orderId}`)
      
      // Update table status to available
      // Note: Backend handles this automatically, but we can also update optimistically
      
      return { orderId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete order')
    }
  }
)

export const bookTable = createAsyncThunk(
  'meja/bookTable',
  async ({ mejaId, namaPelanggan, catatan }: { mejaId: number; namaPelanggan: string; catatan?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pelayan/tables/${mejaId}/book`, {
        nama_pelanggan: namaPelanggan,
        catatan: catatan
      })
      
      return { mejaId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book table')
    }
  }
)

export const fetchPesanans = createAsyncThunk(
  'meja/fetchPesanans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<PesananResponse>('/pelayan/orders')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const updateTableStatus = createAsyncThunk(
  'meja/updateTableStatus',
  async ({ 
    mejaId, 
    status, 
    nama_pelanggan, 
    catatan 
  }: { 
    mejaId: number; 
    status: string; 
    nama_pelanggan?: string; 
    catatan?: string; 
  }, { rejectWithValue, dispatch, getState }) => {
    const state = getState() as { meja: MejaState }
    const meja = state.meja.mejas.find(m => m.id === mejaId)
    
    if (!meja) {
      return rejectWithValue('Meja tidak ditemukan')
    }

    // Optimistic update - update UI immediately
    dispatch(updateTableStatusOptimistically({ mejaId, newStatus: status as any }))

    try {
      const response = await api.put(`/pelayan/tables/${mejaId}`, { 
        status, 
        nama_pelanggan, 
        catatan 
      })
      
      return response.data
    } catch (error: any) {
      // Rollback optimistic update on error
      dispatch(updateTableStatusOptimistically({ mejaId, newStatus: meja.status as any }))
      
      return rejectWithValue(error.response?.data?.message || 'Failed to update table status')
    }
  }
)

const mejaSlice = createSlice({
  name: 'meja',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCreateOrderLoading: (state) => {
      state.createOrderLoading = false
    },
    // Optimistic update actions
    addPesananOptimistically: (state, action: PayloadAction<Pesanan>) => {
      // Tambahkan pesanan baru ke awal array pesanans
      state.pesanans.unshift(action.payload)
      // Increment unread orders count
      state.unreadOrdersCount += 1
    },
    removePesananOptimistically: (state, action: PayloadAction<number>) => {
      // Hapus pesanan berdasarkan ID
      state.pesanans = state.pesanans.filter(p => p.id !== action.payload)
    },
    updateTableStatusOptimistically: (state, action: PayloadAction<{ mejaId: number; newStatus: 'tersedia' | 'terisi' | 'dipesan' | 'tidak_aktif' }>) => {
      const { mejaId, newStatus } = action.payload
      const mejaIndex = state.mejas.findIndex(m => m.id === mejaId)
      if (mejaIndex !== -1) {
        const oldStatus = state.mejas[mejaIndex].status
        
        // Update status
        state.mejas[mejaIndex].status = newStatus
        
        // Clear catatan when status changes to 'terisi' or 'tersedia'
        if (newStatus === 'terisi' || newStatus === 'tersedia') {
          state.mejas[mejaIndex].catatan = null
          state.mejas[mejaIndex].nama_pelanggan = null
        }
        
        // Update status count
        state.statusCount[oldStatus as keyof MejaStatusCount] -= 1
        state.statusCount[newStatus as keyof MejaStatusCount] += 1
      }
    },
    // New reducers for unread orders management
    markOrdersAsRead: (state) => {
      state.unreadOrdersCount = 0
    },
    incrementUnreadOrders: (state, action: PayloadAction<number>) => {
      state.unreadOrdersCount += action.payload
    },
    removePesananFromMejaSlice: (state, action: PayloadAction<number>) => {
      // Remove pesanan from mejaSlice state
      state.pesanans = state.pesanans.filter(p => p.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    // Fetch Mejas
    builder
      .addCase(fetchMejas.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMejas.fulfilled, (state, action: PayloadAction<MejaResponse>) => {
        state.loading = false
        state.mejas = action.payload.data.mejas
        state.statusCount = action.payload.data.status_count
        state.totalMeja = action.payload.data.total_meja
        state.lastFetch = Date.now() // Set lastFetch timestamp
      })
      .addCase(fetchMejas.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        // Hapus loading state untuk pure optimistic update
        state.error = null
      })
      .addCase(createOrder.fulfilled, () => {
        // Logic sudah dipindahkan ke optimistic update di thunk
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.error = action.payload as string
        // Rollback sudah dilakukan di thunk
      })

    // Fetch Pesanans
    builder
      .addCase(fetchPesanans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPesanans.fulfilled, (state, action: PayloadAction<PesananResponse>) => {
        state.loading = false
        state.pesanans = action.payload.data
      })
      .addCase(fetchPesanans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update Table Status
    builder
      .addCase(updateTableStatus.pending, (state) => {
        state.updateStatusLoading = true
        state.error = null
      })
      .addCase(updateTableStatus.fulfilled, (state, action) => {
        state.updateStatusLoading = false
        // Update the table status in local state with backend response
        const updatedMeja = action.payload.data
        const mejaIndex = state.mejas.findIndex(m => m.id === updatedMeja.id)
        if (mejaIndex !== -1) {
          const oldStatus = state.mejas[mejaIndex].status
          state.mejas[mejaIndex] = updatedMeja // Use backend data
          
          // Update status count
          state.statusCount[oldStatus as keyof MejaStatusCount] -= 1
          state.statusCount[updatedMeja.status as keyof MejaStatusCount] += 1
        }
      })
      .addCase(updateTableStatus.rejected, (state, action) => {
        state.updateStatusLoading = false
        state.error = action.payload as string
      })
      .addCase(deleteOrderFromMejaSlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteOrderFromMejaSlice.fulfilled, (state, action) => {
        state.loading = false
        // Remove pesanan from mejaSlice state
        state.pesanans = state.pesanans.filter(p => p.id !== action.payload.orderId)
      })
      .addCase(deleteOrderFromMejaSlice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(bookTable.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bookTable.fulfilled, (state, action) => {
        state.loading = false
        // Update table status optimistically
        const { mejaId } = action.payload
        const mejaIndex = state.mejas.findIndex(m => m.id === mejaId)
        if (mejaIndex !== -1) {
          const oldStatus = state.mejas[mejaIndex].status
          state.mejas[mejaIndex] = action.payload.data
          
          // Update status count
          if (oldStatus !== action.payload.data.status) {
            state.statusCount[oldStatus as keyof MejaStatusCount] -= 1
            state.statusCount[action.payload.data.status as keyof MejaStatusCount] += 1
          }
        }
      })
      .addCase(bookTable.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { 
  clearError, 
  clearCreateOrderLoading, 
  addPesananOptimistically, 
  removePesananOptimistically, 
  updateTableStatusOptimistically,
  markOrdersAsRead,
  incrementUnreadOrders,
  removePesananFromMejaSlice
} = mejaSlice.actions
export default mejaSlice.reducer
