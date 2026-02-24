import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  AdminHeader, 
  StatsCards, 
  UsersByRoleCard, 
  UserStatusCard, 
  RecentUsersCard 
} from '@/components/admin/dashboard'
import { useAuthUtils } from '@/hooks/useAuth'
import { adminAPI } from '@/lib/api'
import type { DashboardResponse } from '@/types'

export default function AdminDashboard() {
  const { getDisplayName, getRoleDisplay, logout } = useAuthUtils()
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getDashboard()
      if (response.success) {
        setDashboardData(response)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      setError('Error loading dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No dashboard data available</p>
      </div>
    )
  }

  const { stats, recent_users, users_by_role } = dashboardData.data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader 
        userName={getDisplayName()}
        userRole={getRoleDisplay()}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UsersByRoleCard usersByRole={users_by_role} />
          <UserStatusCard 
            activeUsers={stats.active_users} 
            inactiveUsers={stats.inactive_users} 
          />
        </div>

        {/* Recent Users */}
        <RecentUsersCard recentUsers={recent_users} />
      </main>
    </div>
  )
}
