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
  loading?: boolean
}

export default function StatsCards({ statusCount, pesanans, loading = false }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {loading ? (
        // Loading Skeletons
        <>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </>
      ) : (
        // Actual Content
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meja Aktif</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCount.terisi}</div>
              <p className="text-xs text-muted-foreground">Sedang digunakan</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meja Tersedia</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCount.tersedia}</div>
              <p className="text-xs text-muted-foreground">Siap untuk pesanan</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Menunggu</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pesanans.filter(p => p.status === 'menunggu').length}
              </div>
              <p className="text-xs text-muted-foreground">Menunggu persiapan</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pesanans.length}</div>
              <p className="text-xs text-muted-foreground">Semua pesanan</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
