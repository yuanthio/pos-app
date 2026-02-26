import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/pesananHelpers'
import type { Pesanan } from '@/types/pesanan'

interface CompleteOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Pesanan | null
  onConfirm: () => void
  loading: boolean
}

export function CompleteOrderDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
  loading
}: CompleteOrderDialogProps) {
  if (!order) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-green-700">
            Selesaikan Pesanan
          </AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menyelesaikan pesanan ini? Tindakan ini akan:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Info */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Nomor Pesanan:</span>
              <span className="text-sm font-mono">#{order.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pelanggan:</span>
              <span className="text-sm">{order.nama_pelanggan || 'Guest'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Meja:</span>
              <span className="text-sm">{order.meja?.nomor_meja || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {order.status === 'menunggu' ? 'Menunggu' : 'Diproses'}
              </Badge>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4" />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Jumlah Item:</span>
              <span className="text-sm">{order.detail_pesanans?.length || 0} item</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Harga:</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(order.total_harga)}
              </span>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Menyelesaikan...' : 'Ya, Selesaikan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
