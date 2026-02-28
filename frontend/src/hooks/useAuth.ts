import { useAuth } from '@/contexts/AuthContext'

// Custom hook for authentication with additional utilities
export const useAuthUtils = () => {
  const { user, isAuthenticated, isLoading, loginLoading, login, logout } = useAuth()

  // Role checking functions
  const isAdmin = () => user?.role === 'admin'
  const isKasir = () => user?.role === 'kasir'
  const isPelayan = () => user?.role === 'pelayan'

  // Get user display name
  const getDisplayName = () => user?.name || 'Unknown User'

  // Get user role display name
  const getRoleDisplay = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator'
      case 'kasir':
        return 'Kasir'
      case 'pelayan':
        return 'Pelayan'
      default:
        return 'Unknown Role'
    }
  }

  return {
    // Basic auth state
    user,
    isAuthenticated,
    isLoading,
    loginLoading,
    
    // Auth actions
    login,
    logout,
    
    // Role utilities
    isAdmin,
    isKasir,
    isPelayan,
    
    // Display utilities
    getDisplayName,
    getRoleDisplay,
  }
}
