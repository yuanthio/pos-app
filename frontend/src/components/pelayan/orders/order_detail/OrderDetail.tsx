import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import type { DetailPesanan, Makanan } from '@/types'
import type { RootState, AppDispatch } from '@/store'
import { fetchOrderDetail, addItemToOrder, updateItemQuantity, removeItemFromOrder } from '@/store/pesananSlice'
import { fetchMenuItems } from '@/store/menuSlice'
import AddItemModal from './AddItemModal'
import OrderDetailHeader from './OrderDetailHeader'
import OrderSummaryCard from './OrderSummaryCard'
import OrderItemsSection from './OrderItemsSection'
import { OrderActions } from './OrderActions'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  
  const { currentOrder, loading, error } = useSelector((state: RootState) => state.pesanan)
  const { items: menuItems, pagination } = useSelector((state: RootState) => state.menu)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DetailPesanan | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

  useEffect(() => {
    if (id) {
      void dispatch(fetchOrderDetail(Number(id)))
      // Hanya fetch menu items jika belum ada di state
      if (menuItems.length === 0) {
        void dispatch(fetchMenuItems())
      }
    }
  }, [dispatch, id, menuItems.length])

  // Show error toast when error occurs but we have currentOrder
  useEffect(() => {
    if (error && currentOrder) {
      toast.error('Terjadi kesalahan: ' + error)
    }
  }, [error, currentOrder])

  const handleAddItem = async (item: { makanan_id: number; jumlah: number; catatan?: string }) => {
    if (!currentOrder) return
    
    // Find food item for optimistic update
    const foodItem = menuItems.find(m => m.id === item.makanan_id)
    if (!foodItem) return
    
    // Create optimistic item
    const optimisticItem: DetailPesanan = {
      id: Date.now(), // Temporary ID
      pesanan_id: currentOrder.id,
      makanan_id: item.makanan_id,
      makanan: foodItem,
      jumlah: item.jumlah,
      harga_satuan: foodItem.harga,
      subtotal: foodItem.harga * item.jumlah,
      catatan: item.catatan || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Show optimistic toast
    const toastId = toast.loading('Menambahkan item ke pesanan...')
    
    try {
      // Dispatch optimistic update (instant UI update)
      dispatch({ type: 'pesanan/addItemOptimistic', payload: { orderId: currentOrder.id, item: optimisticItem } })
      
      // Close modal immediately for better UX
      setIsAddModalOpen(false)
      
      // Call API in background
      await dispatch(addItemToOrder({ orderId: currentOrder.id, item })).unwrap()
      
      // Success toast
      toast.success('Item berhasil ditambahkan ke pesanan!', { id: toastId })
    } catch (error: unknown) {
      // Error toast (rollback handled by Redux)
      toast.error('Gagal menambahkan item ke pesanan', { id: toastId })
      console.error('Failed to add item:', error)
    }
  }

  const handleUpdateQuantity = async (detailId: number, quantity: number) => {
    if (!currentOrder) return
    
    // Find item for optimistic update
    const existingItem = currentOrder.detail_pesanans?.find((d: DetailPesanan) => d.id === detailId)
    if (!existingItem) return
    
    const newSubtotal = existingItem.harga_satuan * quantity
    
    // Show optimistic toast
    const toastId = toast.loading('Memperbarui jumlah item...')
    
    try {
      // Dispatch optimistic update (instant UI update)
      dispatch({ 
        type: 'pesanan/updateItemOptimistic', 
        payload: { 
          orderId: currentOrder.id, 
          detailId, 
          quantity, 
          subtotal: newSubtotal 
        } 
      })
      
      // Close editing mode immediately for better UX
      setEditingItem(null)
      
      // Call API in background
      await dispatch(updateItemQuantity({ orderId: currentOrder.id, detailId, quantity })).unwrap()
      
      // Success toast
      toast.success('Jumlah item berhasil diperbarui!', { id: toastId })
    } catch (error: unknown) {
      // Error toast (rollback handled by Redux)
      toast.error('Gagal memperbarui jumlah item', { id: toastId })
      console.error('Failed to update quantity:', error)
    }
  }

  const handleRemoveItem = (detailId: number) => {
    if (!currentOrder) return
    
    // Set item to delete and open dialog
    setItemToDelete(detailId)
    setDeleteDialogOpen(true)
  }

  const confirmRemoveItem = async () => {
    if (!itemToDelete || !currentOrder) return
    
    // Show optimistic toast
    const toastId = toast.loading('Menghapus item dari pesanan...')
    
    try {
      // Dispatch optimistic update (instant UI update)
      dispatch({ type: 'pesanan/removeItemOptimistic', payload: { orderId: currentOrder.id, detailId: itemToDelete } })
      
      // Close dialog immediately
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      
      // Call API in background
      await dispatch(removeItemFromOrder({ orderId: currentOrder.id, detailId: itemToDelete })).unwrap()
      
      // Success toast
      toast.success('Item berhasil dihapus dari pesanan!', { id: toastId })
    } catch (error: unknown) {
      // Error toast (rollback handled by Redux)
      toast.error('Gagal menghapus item dari pesanan', { id: toastId })
      console.error('Failed to remove item:', error)
    }
  }

  const handlePageChange = (page: number) => {
    void dispatch(fetchMenuItems({ page }))
  }

  const canModifyOrder = !!(currentOrder && ['menunggu', 'diproses'].includes(currentOrder.status))

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="text-gray-600 text-lg">Memuat detail pesanan...</div>
        </div>
      </div>
    )
  }

  // Show error state (only if no currentOrder)
  if (error && !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  // Show not found state (only if not loading and no error and no currentOrder)
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Pesanan tidak ditemukan</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <OrderDetailHeader
        currentOrder={currentOrder!}
        onBack={() => {
          console.log('Navigating back to /pelayan/orders')
          navigate('/pelayan/orders')
        }}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Info & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary Card */}
            <OrderSummaryCard currentOrder={currentOrder!} />

            {/* Order Items Section */}
            <OrderItemsSection
              currentOrder={currentOrder!}
              canModifyOrder={canModifyOrder}
              onAddItem={() => setIsAddModalOpen(true)}
              editingItem={editingItem}
              onEditQuantity={setEditingItem}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Order Actions */}
            <OrderActions 
              order={currentOrder!}
              onAddItem={() => setIsAddModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
        availableItems={menuItems.filter((m: Makanan) => m.tersedia)}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Item</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item ini dari pesanan? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveItem}
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
