import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Pesanan, DetailPesanan } from '@/types'
import OrderItemList from './OrderItemList'

interface OrderItemsSectionProps {
  currentOrder: Pesanan
  canModifyOrder: boolean
  onAddItem: () => void
  editingItem: DetailPesanan | null
  onEditQuantity: (item: DetailPesanan | null) => void
  onUpdateQuantity: (detailId: number, quantity: number) => void
  onRemoveItem: (detailId: number) => void
}

export default function OrderItemsSection({
  currentOrder,
  canModifyOrder,
  onAddItem,
  editingItem,
  onEditQuantity,
  onUpdateQuantity,
  onRemoveItem
}: OrderItemsSectionProps) {
  const hasItems = currentOrder.detail_pesanans && currentOrder.detail_pesanans.length > 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Item Pesanan</h2>
        </div>

        {hasItems ? (
          <OrderItemList
            items={currentOrder.detail_pesanans!}
            canModify={canModifyOrder}
            editingItem={editingItem}
            onEditQuantity={onEditQuantity}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <p className="text-lg font-medium">Belum ada item pesanan</p>
              <p className="text-sm">Tambahkan item untuk memulai pesanan</p>
            </div>
            {canModifyOrder && (
              <Button onClick={onAddItem} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Item Pertama
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
