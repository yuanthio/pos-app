import { Clock } from 'lucide-react'
import type { Pesanan } from '@/types'

interface OrderSummaryCardProps {
  currentOrder: Pesanan
}

export default function OrderSummaryCard({ currentOrder }: OrderSummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Informasi Pesanan</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {new Date(currentOrder.created_at).toLocaleString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short'
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Pelanggan</p>
            <p className="font-medium text-gray-900">{currentOrder.nama_pelanggan || 'Guest'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Meja</p>
            <p className="font-medium text-gray-900">{currentOrder.meja?.nomor_meja}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium text-gray-900 capitalize">{currentOrder.status}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Total Item</p>
            <p className="font-medium text-gray-900">{currentOrder.detail_pesanans?.length || 0}</p>
          </div>
        </div>

        {currentOrder.catatan && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-1">Catatan</p>
            <p className="text-gray-700">{currentOrder.catatan}</p>
          </div>
        )}
      </div>
    </div>
  )
}
