import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useAuthUtils } from '@/hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import { fetchMejas, fetchPesanans } from '@/store/mejaSlice'
import { useEffect, useState } from 'react'
import { DaftarMeja } from '@/components/pelayan/management'
import { OverviewContent } from '@/components/pelayan/overview'
import { OrdersContent } from '@/components/pelayan/orders'
import PelayanHeader from '@/components/pelayan/PelayanHeader'
import PelayanTabs from '@/components/pelayan/PelayanTabs'

export default function PelayanDashboard() {
  const { logout } = useAuthUtils()
  const dispatch = useDispatch<AppDispatch>()
  const { statusCount, pesanans } = useSelector((state: RootState) => state.meja)
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'orders'>('overview')

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchMejas())
    dispatch(fetchPesanans())
  }, [dispatch])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const handleNavigateToTab = (tab: 'tables' | 'orders') => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PelayanHeader onLogout={handleLogout} />

      {/* Tab Navigation */}
      <PelayanTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview">
            <OverviewContent 
              statusCount={statusCount}
              pesanans={pesanans}
              onNavigateToTab={handleNavigateToTab}
            />
          </TabsContent>

          <TabsContent value="tables">
            <DaftarMeja />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersContent pesanans={pesanans} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
