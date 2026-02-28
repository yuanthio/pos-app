// Authentication related types

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'kasir' | 'pelayan'
  phone: string
  is_active: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
    token_type: string
  }
}

export interface UserResponse {
  success: boolean
  data: {
    user: User
  }
}

export interface ApiResponse {
  success: boolean
  message: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  loginLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}
