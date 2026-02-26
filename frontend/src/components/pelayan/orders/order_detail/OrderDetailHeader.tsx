import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Pesanan } from '@/types'

interface OrderDetailHeaderProps {
  currentOrder: Pesanan
  onBack: () => void
}

export default function OrderDetailHeader({
  currentOrder,
  onBack
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
        </div>
      </div>
    </div>
  )
}
