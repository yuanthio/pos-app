import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/utils/pesananHelpers'
import type { Pesanan } from '@/types/pesanan'

interface CancelOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Pesanan | null
  onConfirm: (alasan?: string) => void
  loading: boolean
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
  loading
}: CancelOrderDialogProps) {
  const [alasan, setAlasan] = useState('')

  const handleConfirm = () => {
    onConfirm(alasan.trim() || undefined)
    setAlasan('')
  }

  const handleCancel = () => {
    setAlasan('')
    onOpenChange(false)
  }

  if (!order) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-700">
            Batalkan Pesanan
          </AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.
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
              <span className="text-sm font-bold text-red-600">
                {formatCurrency(order.total_harga)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4" />

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="alasan" className="text-sm font-medium">
              Alasan Pembatalan <span className="text-gray-500">(opsional)</span>
            </Label>
            <Textarea
              id="alasan"
              placeholder="Masukkan alasan pembatalan pesanan..."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="min-h-20 resize-none"
              maxLength={255}
            />
            <p className="text-xs text-gray-500 text-right">
              {alasan.length}/255 karakter
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={handleCancel}>
            Kembali
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Membatalkan...' : 'Ya, Batalkan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
