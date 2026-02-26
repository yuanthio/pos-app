import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

type TabValue = 'overview' | 'tables' | 'orders'

interface PelayanTabsProps {
  activeTab: TabValue
  onTabChange: (value: TabValue) => void
}

export default function PelayanTabs({ activeTab, onTabChange }: PelayanTabsProps) {
  const unreadOrdersCount = useSelector((state: RootState) => state.meja.unreadOrdersCount)

  return (
    <div className="bg-gray-50 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs className='py-3' value={activeTab} onValueChange={(value) => onTabChange(value as TabValue)}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tables">Kelola Meja</TabsTrigger>
            <TabsTrigger value="orders" className="relative">
              Pesanan
              {unreadOrdersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {unreadOrdersCount > 99 ? '99+' : unreadOrdersCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
