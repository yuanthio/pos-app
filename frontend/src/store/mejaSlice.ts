import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Meja, MejaResponse, MejaStatusCount, CreateOrderRequest, CreateOrderResponse, Pesanan, PesananResponse } from '@/types'
import api from '@/lib/api'

interface MejaState {
  mejas: Meja[]
  statusCount: MejaStatusCount
  totalMeja: number
  pesanans: Pesanan[]
  loading: boolean
  error: string | null
  createOrderLoading: boolean
  updateStatusLoading: boolean
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
  loading: false,
  error: null,
  createOrderLoading: false,
  updateStatusLoading: false
}

// Async thunks
export const fetchMejas = createAsyncThunk(
  'meja/fetchMejas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<MejaResponse>('/pelayan/tables')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tables')
    }
  }
)

export const createOrder = createAsyncThunk(
  'meja/createOrder',
  async (orderData: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateOrderResponse>('/pelayan/orders', orderData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order')
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
  async ({ mejaId, status }: { mejaId: number; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pelayan/tables/${mejaId}`, { status })
      return response.data
    } catch (error: any) {
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
    }
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
      })
      .addCase(fetchMejas.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.createOrderLoading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<CreateOrderResponse>) => {
        state.createOrderLoading = false
        // Update the table status in the local state
        const updatedMeja = state.mejas.find(m => m.id === action.payload.data.meja_id)
        if (updatedMeja) {
          updatedMeja.status = 'terisi'
        }
        // Update status count
        state.statusCount.tersedia -= 1
        state.statusCount.terisi += 1
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createOrderLoading = false
        state.error = action.payload as string
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
        // Update the table status in local state
        const updatedMeja = action.payload.data
        const mejaIndex = state.mejas.findIndex(m => m.id === updatedMeja.id)
        if (mejaIndex !== -1) {
          const oldStatus = state.mejas[mejaIndex].status
          state.mejas[mejaIndex] = updatedMeja
          
          // Update status count
          state.statusCount[oldStatus as keyof MejaStatusCount] -= 1
          state.statusCount[updatedMeja.status as keyof MejaStatusCount] += 1
        }
      })
      .addCase(updateTableStatus.rejected, (state, action) => {
        state.updateStatusLoading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, clearCreateOrderLoading } = mejaSlice.actions
export default mejaSlice.reducer
