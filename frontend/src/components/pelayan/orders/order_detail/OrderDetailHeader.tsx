import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus } from 'lucide-react'
import type { Pesanan } from '@/types'

interface OrderDetailHeaderProps {
  currentOrder: Pesanan
  canModifyOrder: boolean
  onBack: () => void
  onAddItem: () => void
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'menunggu':
      return 'bg-yellow-100 text-yellow-800'
    case 'diproses':
      return 'bg-blue-100 text-blue-800'
    case 'selesai':
      return 'bg-green-100 text-green-800'
    case 'dibayar':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'menunggu':
      return 'Menunggu'
    case 'diproses':
      return 'Diproses'
    case 'selesai':
      return 'Selesai'
    case 'dibayar':
      return 'Dibayar'
    default:
      return status
  }
}

export default function OrderDetailHeader({
  currentOrder,
  canModifyOrder,
  onBack,
  onAddItem
}: OrderDetailHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Detail Pesanan</h1>
              <p className="text-sm text-gray-500">#{currentOrder.id}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(currentOrder.status)}>
              {getStatusLabel(currentOrder.status)}
            </Badge>
            {canModifyOrder && (
              <Button onClick={onAddItem} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Item
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
