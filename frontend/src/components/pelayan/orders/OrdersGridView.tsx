import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Trash2, Users, Clock, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getStatusColor, getStatusLabel } from '@/utils/pesananHelpers'
import type { Pesanan } from '@/types'

interface OrdersGridViewProps {
  currentItems: Pesanan[]
  onViewDetail: (orderId: number) => void
  onDeleteOrder: (pesanan: Pesanan) => void
}

export default function OrdersGridView({ 
  currentItems, 
  onViewDetail, 
  onDeleteOrder 
}: OrdersGridViewProps) {
  const navigate = useNavigate()

  const handleViewDetail = (orderId: number) => {
    navigate(`/pelayan/orders/${orderId}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentItems.map((pesanan) => (
        <Card key={pesanan.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg truncate">
                {pesanan.nama_pelanggan || 'Guest'}
              </h3>
              <Badge className={getStatusColor(pesanan.status)} variant="secondary">
                {getStatusLabel(pesanan.status)}
              </Badge>
            </div>

            {/* Info Grid */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Meja:</span>
                <span className="font-medium">{pesanan.meja?.nomor_meja || '-'}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Waktu:</span>
                <span className="font-medium text-xs">
                  {new Date(pesanan.created_at).toLocaleString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{pesanan.detail_pesanans?.length || 0}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-green-600">
                  Rp {pesanan.total_harga?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Notes */}
            {pesanan.catatan && (
              <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600 italic">
                Catatan: {pesanan.catatan}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => handleViewDetail(pesanan.id)}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>{pesanan.status === 'dibayar' ? 'Lihat' : 'Detail'}</span>
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
