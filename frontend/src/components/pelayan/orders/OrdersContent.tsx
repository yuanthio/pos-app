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
import { Clock, Eye, Trash2, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { getStatusColor, getStatusLabel } from '@/utils/pesananHelpers'
import type { Pesanan } from '@/types'
import type { AppDispatch } from '@/store'
import { deleteOrder } from '@/store/pesananSlice'

interface OrdersContentProps {
  pesanans: Pesanan[]
}

const ITEMS_PER_PAGE = 5;

export default function OrdersContent({ pesanans }: OrdersContentProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Pesanan | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Pagination logic
  const totalPages = Math.ceil(pesanans.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = pesanans.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
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
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total: {pesanans.length} pesanan
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
            >
              <Grid className="h-4 w-4" />
              Grid
            </Button>
          </div>
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
        <>
          {/* List View */}
          {viewMode === 'list' && (
            <div className="grid gap-4">
              {currentItems.map((pesanan) => (
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
                        <span>{pesanan.status === 'dibayar' ? 'Lihat Detail' : 'Detail'}</span>
                      </Button>
                      
                      {pesanan.status !== 'dibayar' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteOrder(pesanan)}
                          className="flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentItems.map((pesanan) => (
                <Card key={pesanan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm truncate">
                          {pesanan.nama_pelanggan || 'Guest'}
                        </h3>
                        <Badge className={getStatusColor(pesanan.status)} variant="secondary">
                          {getStatusLabel(pesanan.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Meja:</span>
                          <span>{pesanan.meja?.nomor_meja || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Total:</span>
                          <span className="font-semibold text-green-600">
                            Rp {pesanan.total_harga?.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {pesanan.detail_pesanans?.length || 0} item
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetail(pesanan.id)}
                          className="flex-1"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {pesanan.status === 'dibayar' ? 'Lihat' : 'Detail'}
                        </Button>
                        
                        {pesanan.status !== 'dibayar' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteOrder(pesanan)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, pesanans.length)} dari {pesanans.length} pesanan
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
