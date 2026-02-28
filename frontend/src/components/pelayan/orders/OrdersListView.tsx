import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getStatusColor, getStatusLabel } from '@/utils/pesananHelpers'
import type { Pesanan } from '@/types'

interface OrdersListViewProps {
  currentItems: Pesanan[]
  onViewDetail: (orderId: number) => void
  onDeleteOrder: (pesanan: Pesanan) => void
}

export default function OrdersListView({ 
  currentItems, 
  onViewDetail, 
  onDeleteOrder 
}: OrdersListViewProps) {
  const navigate = useNavigate()

  const handleViewDetail = (orderId: number) => {
    navigate(`/pelayan/orders/${orderId}`)
  }

  return (
    <div className="grid gap-4">
      {currentItems.map((pesanan) => (
        <Card key={pesanan.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-lg">
                    {pesanan.nama_pelanggan || 'Guest'}
                  </h3>
                  <Badge className={getStatusColor(pesanan.status)}>
                    {getStatusLabel(pesanan.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Meja:</span>
                    <span className="ml-2 font-medium">{pesanan.meja?.nomor_meja}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <span className="ml-2 font-medium">{pesanan.detail_pesanans?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Waktu:</span>
                    <span className="ml-2 font-medium">
                      {new Date(pesanan.created_at).toLocaleString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                </div>

                {pesanan.catatan && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Catatan: {pesanan.catatan}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4 ml-4">
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    Rp {pesanan.total_harga?.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Harga
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetail(pesanan.id)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{pesanan.status === 'dibayar' ? 'Lihat Detail' : 'Detail'}</span>
                  </Button>
                  
                  {pesanan.status !== 'dibayar' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteOrder(pesanan)}
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
