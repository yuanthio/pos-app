import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Utensils } from 'lucide-react'
import type { Pesanan } from '@/types'

interface RecentOrdersProps {
  pesanans: Pesanan[]
  loading?: boolean
}

export default function RecentOrders({ pesanans, loading = false }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Terbaru</CardTitle>
        <CardDescription>Aktivitas pesanan terkini</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="flex items-center space-x-3">
              <Spinner className="text-blue-500" />
              <p className="text-gray-500 text-sm font-medium">Memuat pesanan...</p>
            </div>
          </div>
        ) : pesanans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Utensils className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Belum ada pesanan</p>
            <p className="text-sm">Mulai dengan membuat pesanan baru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pesanans.slice(0, 5).map((pesanan) => (
              <div key={pesanan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{pesanan.nama_pelanggan || 'Tamu'}</p>
                  <p className="text-sm text-gray-500">Meja {pesanan.meja?.nomor_meja}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{pesanan.status}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(pesanan.created_at).toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
