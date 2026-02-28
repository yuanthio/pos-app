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
import type { Pesanan } from '@/types'

interface DeleteOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderToDelete: Pesanan | null
  onConfirm: () => void
}

export default function DeleteOrderDialog({
  open,
  onOpenChange,
  orderToDelete,
  onConfirm
}: DeleteOrderDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Hapus Pesanan</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus pesanan untuk {orderToDelete?.nama_pelanggan || 'Guest'} di meja {orderToDelete?.meja?.nomor_meja}? 
            Tindakan ini tidak dapat dibatalkan dan meja akan kembali tersedia.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
