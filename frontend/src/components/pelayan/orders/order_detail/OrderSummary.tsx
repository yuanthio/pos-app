import type { Pesanan } from '@/types'

interface OrderSummaryProps {
  currentOrder: Pesanan
}

export default function OrderSummary({ currentOrder }: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Item</span>
            <span className="font-medium text-gray-900">
              {currentOrder.detail_pesanans?.length || 0}
            </span>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Harga</span>
              <span className="text-xl font-bold text-green-600">
                Rp {currentOrder.total_harga?.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
