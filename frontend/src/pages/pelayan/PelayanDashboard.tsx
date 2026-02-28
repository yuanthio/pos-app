import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useAuthUtils } from '@/hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import type { AppDispatch, RootState } from '@/store'
import { fetchMejas, markOrdersAsRead } from '@/store/mejaSlice'
import { fetchOrders } from '@/store/pesananSlice'
import { useEffect, useState } from 'react'
import { DaftarMeja } from '@/components/pelayan/management'
import { OverviewContent } from '@/components/pelayan/overview'
import { OrdersContent } from '@/components/pelayan/orders'
import PelayanHeader from '@/components/pelayan/PelayanHeader'
import PelayanTabs from '@/components/pelayan/PelayanTabs'

export default function PelayanDashboard() {
  const { logout } = useAuthUtils()
  const { tab: urlTab } = useParams<{ tab?: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { statusCount } = useSelector((state: RootState) => state.meja)
  
  // Get pesanan state untuk caching
  const pesananState = useSelector((state: RootState) => state.pesanan)
  const { orders, loading } = pesananState
  
  // Set active tab based on URL parameter, default to 'overview'
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'orders'>(
    urlTab as 'overview' | 'tables' | 'orders' || 'overview'
  )

  // Debug: Log activeTab changes
  useEffect(() => {
    console.log('activeTab changed to:', activeTab)
  }, [activeTab])

  useEffect(() => {
    // Fetch initial data dengan caching
    dispatch(fetchMejas())
    dispatch(fetchOrders())
  }, [dispatch])

  useEffect(() => {
    // Hanya fetch orders saat tab berubah ke orders dan data sudah lama
    if (activeTab === 'orders') {
      const now = Date.now()
      
      // Fetch jika belum ada data atau data sudah lebih dari 15 detik
      if (!pesananState.lastFetch || (now - pesananState.lastFetch) > 15000) {
        dispatch(fetchOrders())
      }
    }
  }, [activeTab, dispatch, pesananState.lastFetch])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const handleNavigateToTab = (tab: 'overview' | 'tables' | 'orders') => {
    console.log('handleNavigateToTab called with:', tab)
    setActiveTab(tab)
    
    // Update URL to reflect the active tab
    navigate(`/pelayan/${tab}`)
    
    // Reset unread orders count when opening orders tab
    if (tab === 'orders') {
      console.log('Calling markOrdersAsRead for orders tab')
      dispatch(markOrdersAsRead())
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PelayanHeader onLogout={handleLogout} />

      {/* Tab Navigation */}
      <PelayanTabs activeTab={activeTab} onTabChange={handleNavigateToTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview">
            <OverviewContent 
              statusCount={statusCount}
              pesanans={orders}
              loading={loading}
              onNavigateToTab={handleNavigateToTab}
            />
          </TabsContent>

          <TabsContent value="tables">
            <DaftarMeja />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersContent pesanans={orders} loading={loading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
