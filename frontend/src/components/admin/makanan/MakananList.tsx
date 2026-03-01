import { useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MakananForm } from './MakananForm'
import { MakananFilters } from './MakananFilters'
import { MakananTable } from './MakananTable'
import { MakananDeleteDialog } from './MakananDeleteDialog'
import { MakananPagination } from './MakananPagination'
import { deleteMakanan, toggleAvailability, updateMakananOptimistic } from '@/store/makananSlice'
import { filterMakanans, paginateResults } from '@/utils/makananFilter'
import type { AppDispatch } from '@/store'
import type { Makanan, MakananParams } from '@/types'

interface MakananListProps {
  makanans: Makanan[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  loading: boolean
  filters: MakananParams
  categories: Array<{ value: string; label: string }>
  onFilterChange: (filters: Partial<MakananParams>) => void
  onPageChange: (page: number) => void
  onRefresh: () => void
}

export function MakananList({ 
  makanans: allMakanans,
  pagination,
  loading,
  filters, 
  categories,
  onFilterChange, 
  onPageChange, 
  onRefresh,
}: MakananListProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [showForm, setShowForm] = useState(false)
  const [editingMakanan, setEditingMakanan] = useState<Makanan | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; nama: string }>({
    open: false,
    id: 0,
    nama: ''
  })

  // Client-side filtering with useMemo for instant results
  const { filteredMakanans, displayPagination } = useMemo(() => {
    // Apply filters
    const filtered = filterMakanans(allMakanans, {
      search: filters.search,
      kategori: filters.kategori,
      tersedia: filters.tersedia,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order
    })

    // Apply pagination
    const paginated = paginateResults(filtered, filters.page || 1, filters.per_page || 10)

    return {
      filteredMakanans: paginated.items,
      displayPagination: {
        current_page: filters.page || 1,
        last_page: paginated.totalPages,
        per_page: filters.per_page || 10,
        total: paginated.total
      }
    }
  }, [allMakanans, filters])

  const handleEdit = (makanan: Makanan) => {
    setEditingMakanan(makanan)
    setShowForm(true)
  }

  const handleDelete = (id: number, nama: string) => {
    setDeleteDialog({ open: true, id, nama })
  }

  const confirmDelete = async () => {
    try {
      await dispatch(deleteMakanan(deleteDialog.id)).unwrap()
      toast.success('Makanan berhasil dihapus!')
      setDeleteDialog({ open: false, id: 0, nama: '' })
    } catch (error) {
      console.error('Error deleting makanan:', error)
      toast.error('Gagal menghapus makanan')
    }
  }

  const handleToggleAvailability = async (id: number) => {
    // Find the makanan to toggle
    const makanan = allMakanans.find(m => m.id === id)
    if (!makanan) return

    // Optimistic update - toggle status instantly
    const optimisticMakanan: Makanan = {
      ...makanan,
      tersedia: !makanan.tersedia,
      updated_at: new Date().toISOString()
    }
    
    dispatch(updateMakananOptimistic(optimisticMakanan))

    try {
      await dispatch(toggleAvailability(id)).unwrap()
      toast.success('Status ketersediaan berhasil diubah!')
    } catch (error) {
      console.error('Error toggling availability:', error)
      toast.error('Gagal mengubah status ketersediaan')
      // Error will be handled by Redux state revert
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingMakanan(null)
  }

  const handleAdd = () => {
    setEditingMakanan(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <MakananFilters
        filters={filters}
        categories={categories}
        onFilterChange={onFilterChange}
        onRefresh={onRefresh}
        onAdd={handleAdd}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Makanan ({displayPagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <MakananTable
            makanans={filteredMakanans}
            displayPagination={displayPagination}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleAvailability={handleToggleAvailability}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      <MakananPagination
        current_page={displayPagination.current_page}
        last_page={displayPagination.last_page}
        per_page={displayPagination.per_page}
        total={displayPagination.total}
        onPageChange={onPageChange}
      />

      {/* Delete Dialog */}
      <MakananDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        itemName={deleteDialog.nama}
      />

      {/* Form */}
      {showForm && (
        <MakananForm
          open={showForm}
          onClose={handleFormClose}
          editingMakanan={editingMakanan}
          categories={categories}
        />
      )}
    </div>
  )
}
