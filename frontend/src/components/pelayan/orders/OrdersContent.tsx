import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Clock, Eye, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import type { Pesanan } from '@/types'
import type { AppDispatch } from '@/store'
import { deleteOrder } from '@/store/pesananSlice'

interface OrdersContentProps {
  pesanans: Pesanan[]
}

export default function OrdersContent({ pesanans }: OrdersContentProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Pesanan | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'menunggu':
        return 'bg-yellow-100 text-yellow-800'
      case 'diproses':
        return 'bg-blue-100 text-blue-800'
      case 'selesai':
        return 'bg-green-100 text-green-800'
      case 'dibatalkan':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'menunggu':
        return 'Menunggu'
      case 'diproses':
        return 'Diproses'
      case 'selesai':
        return 'Selesai'
      case 'dibatalkan':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  const handleViewDetail = (orderId: number) => {
    navigate(`/pelayan/orders/${orderId}`)
  }

  const handleDeleteOrder = (order: Pesanan) => {
    setOrderToDelete(order)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return

    const toastId = toast.loading('Menghapus pesanan...')
    
    try {
      // Optimistic update - remove from UI immediately
      dispatch({ type: 'pesanan/removeOrder', payload: orderToDelete.id })
      dispatch({ type: 'meja/removePesananFromMejaSlice', payload: orderToDelete.id })
      
      // Close dialog immediately
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
      
      // Call API in background
      await dispatch(deleteOrder(orderToDelete.id)).unwrap()
      
      // Success toast
      toast.success('Pesanan berhasil dihapus!', { id: toastId })
    } catch (error: unknown) {
      // Error toast (rollback handled by Redux)
      toast.error('Gagal menghapus pesanan', { id: toastId })
      console.error('Failed to delete order:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daftar Pesanan</h2>
        <div className="text-sm text-gray-600">
          Total: {pesanans.length} pesanan
        </div>
      </div>

      {pesanans.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg mb-2">Belum ada pesanan</p>
              <p className="text-sm">Mulai dengan membuat pesanan baru dari halaman Kelola Meja</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pesanans.map((pesanan) => (
            <Card key={pesanan.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {pesanan.nama_pelanggan || 'Guest'}
                      </h3>
                      <Badge className={getStatusColor(pesanan.status)}>
                        {getStatusLabel(pesanan.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Meja:</span>
                        <span className="ml-2 font-medium">{pesanan.meja?.nomor_meja}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Items:</span>
                        <span className="ml-2 font-medium">{pesanan.detail_pesanans?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Waktu:</span>
                        <span className="ml-2 font-medium">
                          {new Date(pesanan.created_at).toLocaleString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>

                    {pesanan.catatan && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        Catatan: {pesanan.catatan}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 ml-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        Rp {pesanan.total_harga?.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total Harga
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewDetail(pesanan.id)}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOrder(pesanan)}
                        className="flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={confirmDeleteOrder}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
