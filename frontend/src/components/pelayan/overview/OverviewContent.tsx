import StatsCards from './StatsCards'
import QuickActions from './QuickActions'
import RecentOrders from './RecentOrders'
import type { Pesanan } from '@/types'

interface OverviewContentProps {
  statusCount: {
    tersedia: number
    terisi: number
    dipesan: number
    tidak_aktif: number
  }
  pesanans: Pesanan[]
  onNavigateToTab: (tab: 'tables' | 'orders') => void
}

export default function OverviewContent({ statusCount, pesanans, onNavigateToTab }: OverviewContentProps) {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <StatsCards statusCount={statusCount} pesanans={pesanans} />

      {/* Quick Actions and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions onNavigateToTab={onNavigateToTab} />
        <RecentOrders pesanans={pesanans} />
      </div>
    </div>
  )
}
