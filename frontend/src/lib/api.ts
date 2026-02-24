import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { LoginResponse, UserResponse, ApiResponse, DashboardResponse, UsersResponse } from '@/types'

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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
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

export default api
