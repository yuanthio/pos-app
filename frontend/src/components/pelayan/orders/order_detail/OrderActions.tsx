import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Plus,
  AlertCircle
} from 'lucide-react'
import { canCompleteOrder, canCancelOrder, canModifyOrder } from '@/utils/pesananHelpers'
import { CompleteOrderDialog } from './CompleteOrderDialog'
import { CancelOrderDialog } from './CancelOrderDialog'
import type { Pesanan } from '@/types/pesanan'
import { useAppDispatch } from '@/hooks/redux'
import { completeOrder, cancelOrder } from '@/store/pesananSlice'
import { toast } from 'sonner'

interface OrderActionsProps {
  order: Pesanan | null
  onAddItem?: () => void
}

export function OrderActions({ order, onAddItem }: OrderActionsProps) {
  const dispatch = useAppDispatch()
  
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  if (!order) return null

  const handleCompleteOrder = async () => {
    // Close dialog immediately
    setCompleteDialogOpen(false)
    
    try {
      await dispatch(completeOrder(order.id)).unwrap()
      toast.success('Pesanan berhasil diselesaikan!')
    } catch (error: any) {
      toast.error(error || 'Gagal menyelesaikan pesanan')
    }
  }

  const handleCancelOrder = async (alasan?: string) => {
    // Close dialog immediately
    setCancelDialogOpen(false)
    
    try {
      await dispatch(cancelOrder({ orderId: order.id, alasan })).unwrap()
      toast.success('Pesanan berhasil dibatalkan!')
    } catch (error: any) {
      toast.error(error || 'Gagal membatalkan pesanan')
    }
  }

  const canComplete = canCompleteOrder(order)
  const canCancel = canCancelOrder(order)
  const canModify = canModifyOrder(order)

  return (
    <>
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status Pesanan</span>
          <Badge 
            variant="secondary" 
            className={
              order.status === 'menunggu' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'diproses' ? 'bg-blue-100 text-blue-800' :
              order.status === 'selesai' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }
          >
            {order.status === 'menunggu' ? 'Menunggu' :
             order.status === 'diproses' ? 'Diproses' :
             order.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
          </Badge>
        </div>

        <div className="border-t border-gray-200 my-4" />

        {/* Action Buttons */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Aksi Pesanan</h4>
          
          <div className="grid grid-cols-1 gap-2">
            {/* Add Item Button */}
            {canModify && onAddItem && (
              <Button
                onClick={onAddItem}
                variant="outline"
                className="w-full justify-start"
                disabled={false}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Item
              </Button>
            )}

            {/* Complete Order Button */}
            {canComplete && (
              <Button
                onClick={() => setCompleteDialogOpen(true)}
                className="w-full justify-start bg-green-600 hover:bg-green-700"
                disabled={false}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Selesaikan Pesanan
              </Button>
            )}

            {/* Cancel Order Button */}
            {canCancel && (
              <Button
                onClick={() => setCancelDialogOpen(true)}
                variant="destructive"
                className="w-full justify-start"
                disabled={false}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Batalkan Pesanan
              </Button>
            )}
          </div>

          {/* No Actions Available */}
          {!canModify && !canComplete && !canCancel && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Tidak ada aksi yang tersedia untuk pesanan ini
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Complete Order Dialog */}
      <CompleteOrderDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        order={order}
        onConfirm={handleCompleteOrder}
        loading={false}
      />

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        order={order}
        onConfirm={handleCancelOrder}
        loading={false}
      />
    </>
  )
}
