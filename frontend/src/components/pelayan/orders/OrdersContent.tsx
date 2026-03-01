import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Grid, List, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import type { Pesanan } from '@/types'
import type { AppDispatch } from '@/store'
import { deleteOrderFromMejaSlice } from '@/store/mejaSlice'
import OrdersListView from './OrdersListView'
import OrdersGridView from './OrdersGridView'
import OrdersPagination from './OrdersPagination'
import DeleteOrderDialog from './DeleteOrderDialog'

interface OrdersContentProps {
  pesanans: Pesanan[]
  loading?: boolean
}

const ITEMS_PER_PAGE = 5;

export default function OrdersContent({ pesanans, loading = false }: OrdersContentProps) {
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
      await dispatch(deleteOrderFromMejaSlice(orderToDelete.id)).unwrap()
      
      // Close dialog immediately
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
      
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
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Memuat data pesanan...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
            <OrdersListView 
              currentItems={currentItems}
              onViewDetail={(orderId: number) => {
                // Navigate to order detail
                window.location.href = `/pelayan/orders/${orderId}`
              }}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <OrdersGridView 
              currentItems={currentItems}
              onViewDetail={(orderId: number) => {
                // Navigate to order detail
                window.location.href = `/pelayan/orders/${orderId}`
              }}
              onDeleteOrder={handleDeleteOrder}
            />
          )}
        </>
      )}
      
      {/* Pagination Controls */}
      <OrdersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={pesanans.length}
        onPageChange={handlePageChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteOrderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        orderToDelete={orderToDelete}
        onConfirm={confirmDeleteOrder}
      />
    </div>
  )
}
