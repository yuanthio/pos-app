import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Makanan, MakananParams, MakananResponse, SingleMakananResponse, CategoriesResponse } from '@/types'
import { menuAPI } from '@/lib/api'

interface MenuState {
  items: Makanan[]
  categories: Array<{ value: string; label: string }>
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  loading: boolean
  error: string | null
}

const initialState: MenuState = {
  items: [],
  categories: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  },
  loading: false,
  error: null,
}

// Async thunks
export const fetchMenuItems = createAsyncThunk<
  { items: Makanan[]; pagination: MenuState['pagination'] },
  MakananParams | undefined,
  { rejectValue: string }
>(
  'menu/fetchItems',
  async (params, { rejectWithValue }) => {
    try {
      const response = await menuAPI.getAll(params)
      return {
        items: response.data.makanans,
        pagination: response.data.pagination
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Gagal mengambil data menu'
      )
    }
  }
)

export const fetchMenuItem = createAsyncThunk<
  Makanan,
  number,
  { rejectValue: string }
>(
  'menu/fetchItem',
  async (id, { rejectWithValue }) => {
    try {
      const response = await menuAPI.get(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Gagal mengambil detail menu'
      )
    }
  }
)

export const fetchMenuCategories = createAsyncThunk<
  Array<{ value: string; label: string }>,
  void,
  { rejectValue: string }
>(
  'menu/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await menuAPI.getCategories()
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Gagal mengambil kategori menu'
      )
    }
  }
)

// Slice
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearItems: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    // fetchMenuItems
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Gagal mengambil data menu'
      })

    // fetchMenuItem
    builder
      .addCase(fetchMenuItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuItem.fulfilled, (state, action) => {
        state.loading = false
        // Update item in the list if it exists
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        } else {
          state.items.push(action.payload)
        }
      })
      .addCase(fetchMenuItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Gagal mengambil detail menu'
      })

    // fetchMenuCategories
    builder
      .addCase(fetchMenuCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
      })
      .addCase(fetchMenuCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Gagal mengambil kategori menu'
      })
  },
})

export const { clearError, clearItems } = menuSlice.actions
export default menuSlice.reducer
