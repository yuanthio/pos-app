import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { LoginResponse, UserResponse, ApiResponse, DashboardResponse, UsersResponse, MakananResponse, SingleMakananResponse, CategoriesResponse, CreateMakanan, UpdateMakanan, MakananApiResponse, MakananParams } from '@/types'

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Only redirect on 401 if not on login page and not a login request
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login'
      const isLoginRequest = error.config?.url === '/login'
      
      if (!isLoginPage && !isLoginRequest) {
        // Token expired or invalid on protected routes
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        window.location.href = '/login'
      }
    }
    
    // Log detailed error for debugging
    if (error.response?.status === 422) {
      console.error('Validation Error:', error.response.data)
    }
    
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/login', { email, password })
    return response.data
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/logout')
    return response.data
  },

  getUser: async (): Promise<UserResponse> => {
    const response = await api.get('/user')
    return response.data
  },
}

export const adminAPI = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },

  getUsers: async (params?: {
    page?: number
    per_page?: number
    role?: string
    is_active?: boolean
    search?: string
  }): Promise<UsersResponse> => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },
}

export const makananAPI = {
  getAll: async (params?: MakananParams): Promise<MakananResponse> => {
    const response = await api.get('/makanans', { params })
    return response.data
  },

  get: async (id: number): Promise<SingleMakananResponse> => {
    const response = await api.get(`/makanans/${id}`)
    return response.data
  },

  create: async (data: CreateMakanan): Promise<SingleMakananResponse> => {
    const formData = new FormData()
    
    Object.keys(data).forEach(key => {
      const value = data[key as keyof CreateMakanan]
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          // Convert boolean to string for Laravel
          formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
        }
      }
    })

    const response = await api.post('/makanans', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  update: async (id: number, data: UpdateMakanan): Promise<SingleMakananResponse> => {
    const formData = new FormData()
    
    Object.keys(data).forEach(key => {
      const value = data[key as keyof UpdateMakanan]
      // Skip gambar if it's undefined (no new file uploaded)
      if (key === 'gambar' && value === undefined) {
        return
      }
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          // Convert boolean to string for Laravel
          formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
        }
      }
    })

    const response = await api.post(`/makanans/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        _method: 'PUT' // Laravel form method spoofing
      }
    })
    return response.data
  },

  delete: async (id: number): Promise<MakananApiResponse> => {
    const response = await api.delete(`/makanans/${id}`)
    return response.data
  },

  toggleAvailability: async (id: number): Promise<SingleMakananResponse> => {
    const response = await api.patch(`/makanans/${id}/toggle-availability`)
    return response.data
  },

  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get('/makanans/categories')
    return response.data
  },
}

export const menuAPI = {
  getAll: async (params?: MakananParams): Promise<MakananResponse> => {
    const response = await api.get('/menu', { params })
    return response.data
  },

  get: async (id: number): Promise<SingleMakananResponse> => {
    const response = await api.get(`/menu/${id}`)
    return response.data
  },

  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get('/menu/categories')
    return response.data
  },
}

export default api
