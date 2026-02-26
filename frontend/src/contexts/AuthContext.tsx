import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authAPI } from '@/lib/api'
import type { User, AuthContextType, LoginResponse } from '@/types'

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Check authentication status
  const checkAuth = async () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')

    console.log('Checking auth...', { storedToken: !!storedToken, storedUser: !!storedUser })

    if (storedToken && storedUser) {
      try {
        // Verify token is still valid by fetching user data
        console.log('Verifying token with API...')
        const response = await authAPI.getUser()
        console.log('API response:', response)
        
        if (response.success) {
          setUser(response.data.user)
          setToken(storedToken)
          console.log('Auth successful')
        } else {
          console.log('Token invalid, clearing storage')
          // Token invalid, clear storage
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
        }
      } catch (error) {
        console.log('Auth check failed:', error)
        // Token invalid or network error, clear storage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
    
    setIsLoading(false)
  }

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response: LoginResponse = await authAPI.login(email, password)
      
      if (response.success) {
        const { user: userData, token: userToken } = response.data
        
        // Store in state
        setUser(userData)
        setToken(userToken)
        
        // Store in localStorage
        localStorage.setItem('auth_token', userToken)
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.'
      return { success: false, message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout()
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error)
    } finally {
      // Clear state and storage
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }

  // Computed values
  const isAuthenticated = !!user && !!token

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
