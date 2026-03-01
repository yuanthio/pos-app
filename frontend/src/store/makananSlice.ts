import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Makanan, MakananParams, MakananResponse, SingleMakananResponse, CategoriesResponse, CreateMakanan, UpdateMakanan } from '@/types'
import { makananAPI } from '@/lib/api'

interface MakananState {
  makanans: Makanan[]
  categories: Array<{ value: string; label: string }>
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  loading: boolean
  error: string | null
  filters: MakananParams
  // Specific loading states for optimistic updates
  creating: boolean
  updating: boolean
  deleting: boolean
}

const initialState: MakananState = {
  makanans: [],
  categories: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  loading: false,
  error: null,
  filters: {
    page: 1,
    per_page: 10,
  },
  // Specific loading states for optimistic updates
  creating: false,
  updating: false,
  deleting: false,
}

// Async thunks
export const fetchMakanans = createAsyncThunk(
  'makanan/fetchMakanans',
  async (params?: MakananParams) => {
    const response = await makananAPI.getAll(params)
    return response
  }
)

export const fetchCategories = createAsyncThunk(
  'makanan/fetchCategories',
  async () => {
    const response = await makananAPI.getCategories()
    return response
  }
)

export const createMakanan = createAsyncThunk(
  'makanan/createMakanan',
  async (data: CreateMakanan) => {
    const response = await makananAPI.create(data)
    return response
  }
)

export const updateMakanan = createAsyncThunk(
  'makanan/updateMakanan',
  async ({ id, data }: { id: number; data: UpdateMakanan }) => {
    const response = await makananAPI.update(id, data)
    return response
  }
)

export const deleteMakanan = createAsyncThunk(
  'makanan/deleteMakanan',
  async (id: number) => {
    await makananAPI.delete(id)
    return id
  }
)

export const toggleAvailability = createAsyncThunk(
  'makanan/toggleAvailability',
  async (id: number) => {
    const response = await makananAPI.toggleAvailability(id)
    return response
  }
)

// Slice
const makananSlice = createSlice({
  name: 'makanan',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<MakananParams>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        per_page: 10,
      }
    },
    // Optimistic update reducers
    addMakananOptimistic: (state, action: PayloadAction<Makanan>) => {
      state.makanans.unshift(action.payload)
      state.pagination.total += 1
    },
    updateMakananOptimistic: (state, action: PayloadAction<Makanan>) => {
      const index = state.makanans.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.makanans[index] = action.payload
      }
    },
    removeMakananOptimistic: (state, action: PayloadAction<number>) => {
      state.makanans = state.makanans.filter(m => m.id !== action.payload)
      state.pagination.total -= 1
    },
  },
  extraReducers: (builder) => {
    // Fetch makanans
    builder
      .addCase(fetchMakanans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMakanans.fulfilled, (state, action: PayloadAction<MakananResponse>) => {
        state.loading = false
        state.makanans = action.payload.data.makanans
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchMakanans.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch makanans'
      })

    // Fetch categories
    builder
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<CategoriesResponse>) => {
        state.categories = action.payload.data
      })

    // Create makanan
    builder
      .addCase(createMakanan.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createMakanan.fulfilled, (state, action: PayloadAction<SingleMakananResponse>) => {
        state.creating = false
        // Update with actual server response
        const index = state.makanans.findIndex(m => m.id === action.payload.data.id)
        if (index !== -1) {
          // Update existing optimistic item with server data
          state.makanans[index] = action.payload.data
        } else {
          // Find optimistic item by checking if it's a temporary ID (large number)
          const optimisticIndex = state.makanans.findIndex(m => 
            m.id >= 1000000000000 && m.nama === action.payload.data.nama
          )
          if (optimisticIndex !== -1) {
            // Replace optimistic item with server data
            state.makanans[optimisticIndex] = action.payload.data
          } else {
            // Fallback: add new item if no optimistic item found
            state.makanans.unshift(action.payload.data)
            state.pagination.total += 1
          }
        }
      })
      .addCase(createMakanan.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create makanan'
      })

    // Update makanan
    builder
      .addCase(updateMakanan.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateMakanan.fulfilled, (state, action: PayloadAction<SingleMakananResponse>) => {
        state.updating = false
        const index = state.makanans.findIndex(m => m.id === action.payload.data.id)
        if (index !== -1) {
          state.makanans[index] = action.payload.data
        }
      })
      .addCase(updateMakanan.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message || 'Failed to update makanan'
      })

    // Delete makanan
    builder
      .addCase(deleteMakanan.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteMakanan.fulfilled, (state, action: PayloadAction<number>) => {
        state.deleting = false
        state.makanans = state.makanans.filter(m => m.id !== action.payload)
        state.pagination.total -= 1
      })
      .addCase(deleteMakanan.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete makanan'
      })

    // Toggle availability
    builder
      .addCase(toggleAvailability.fulfilled, (state, action: PayloadAction<SingleMakananResponse>) => {
        const index = state.makanans.findIndex(m => m.id === action.payload.data.id)
        if (index !== -1) {
          state.makanans[index] = action.payload.data
        }
      })
      .addCase(toggleAvailability.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle availability'
      })
  },
})

export const { 
  setFilters, 
  clearError, 
  resetFilters,
  addMakananOptimistic,
  updateMakananOptimistic,
  removeMakananOptimistic
} = makananSlice.actions
export default makananSlice.reducer
