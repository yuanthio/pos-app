import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { 
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
        setError('Gagal memuat data dashboard')
      }
    } catch (err) {
      setError('Error memuat data dashboard')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const stats = dashboardData?.data?.stats
  const recent_users = dashboardData?.data?.recent_users
  const users_by_role = dashboardData?.data?.users_by_role

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
        {error && (
          <div className="mb-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Coba Lagi</Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Additional Stats */}
        {stats && users_by_role && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <UsersByRoleCard usersByRole={users_by_role} />
            <UserStatusCard 
              activeUsers={stats.active_users} 
              inactiveUsers={stats.inactive_users} 
            />
          </div>
        )}

        {/* Recent Users */}
        {recent_users && <RecentUsersCard recentUsers={recent_users} />}

        {loading && !dashboardData && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </main>
    </div>
  )
}
