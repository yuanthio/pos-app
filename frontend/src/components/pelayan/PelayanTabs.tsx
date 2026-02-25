import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TabValue = 'overview' | 'tables' | 'orders'

interface PelayanTabsProps {
  activeTab: TabValue
  onTabChange: (value: TabValue) => void
}

export default function PelayanTabs({ activeTab, onTabChange }: PelayanTabsProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabValue)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tables">Kelola Meja</TabsTrigger>
            <TabsTrigger value="orders">Pesanan</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
