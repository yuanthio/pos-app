import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Utensils, Clock, Plus, Users } from 'lucide-react'

interface StatsCardsProps {
  statusCount: {
    tersedia: number
    terisi: number
    dipesan: number
    tidak_aktif: number
  }
  pesanans: Array<{
    status: string
  }>
}

export default function StatsCards({ statusCount, pesanans }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCount.terisi}</div>
          <p className="text-xs text-muted-foreground">Currently occupied</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCount.tersedia}</div>
          <p className="text-xs text-muted-foreground">Ready for orders</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {pesanans.filter(p => p.status === 'menunggu').length}
          </div>
          <p className="text-xs text-muted-foreground">Awaiting preparation</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pesanans.length}</div>
          <p className="text-xs text-muted-foreground">All orders</p>
        </CardContent>
      </Card>
    </div>
  )
}
