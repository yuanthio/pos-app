import { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw,
  Filter
} from 'lucide-react'
import { MakananForm } from './MakananForm'
import { deleteMakanan, toggleAvailability } from '@/store/makananSlice'
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
  makanans,
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
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; nama: string }>({
    open: false,
    id: 0,
    nama: ''
  })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onFilterChange({ search: value, page: 1 })
  }

  const handleCategoryFilter = (kategori: string) => {
    onFilterChange({ kategori: kategori === 'all' ? '' : kategori, page: 1 })
  }

  const handleAvailabilityFilter = (tersedia: boolean | undefined) => {
    onFilterChange({ tersedia, page: 1 })
  }

  const handleSort = (sortBy: string) => {
    const sortOrder = filters.sort_by === sortBy && filters.sort_order === 'asc' ? 'desc' : 'asc'
    onFilterChange({ sort_by: sortBy, sort_order: sortOrder })
  }

  const handleEdit = (makanan: Makanan) => {
    setEditingMakanan(makanan)
    setShowForm(true)
  }

  const handleDelete = async (id: number, nama: string) => {
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
    try {
      await dispatch(toggleAvailability(id)).unwrap()
      toast.success('Status ketersediaan berhasil diubah!')
    } catch (error) {
      console.error('Error toggling availability:', error)
      toast.error('Gagal mengubah status ketersediaan')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingMakanan(null)
  }

  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(harga)
  }

  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case 'makanan':
        return 'bg-blue-100 text-blue-800'
      case 'minuman':
        return 'bg-green-100 text-green-800'
      case 'snack':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Makanan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari makanan..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.kategori || 'all'}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={filters.tersedia === undefined ? 'all' : filters.tersedia ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value
                handleAvailabilityFilter(value === 'all' ? undefined : value === 'true')
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Semua Status</option>
              <option value="true">Tersedia</option>
              <option value="false">Tidak Tersedia</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sort_by || 'created_at'}
              onChange={(e) => handleSort(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="created_at">Tanggal Dibuat</option>
              <option value="nama">Nama</option>
              <option value="harga">Harga</option>
              <option value="kategori">Kategori</option>
              <option value="stok">Stok</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Makanan ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : makanans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada makanan yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {makanans.map((makanan) => (
                    <TableRow key={makanan.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {makanan.gambar ? (
                            <img
                              src={makanan.gambar}
                              alt={makanan.nama}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-xs text-gray-500">No img</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{makanan.nama}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {makanan.deskripsi || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{formatHarga(makanan.harga)}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(makanan.kategori)}>
                          {makanan.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell>{makanan.stok}</TableCell>
                      <TableCell>
                        <Badge variant={makanan.tersedia ? 'default' : 'secondary'}>
                          {makanan.tersedia ? 'Tersedia' : 'Tidak Tersedia'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAvailability(makanan.id)}
                            className="p-2"
                          >
                            {makanan.tersedia ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(makanan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(makanan.id, makanan.nama)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus makanan "{deleteDialog.nama}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, id: 0, nama: '' })}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} hingga{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari{' '}
            {pagination.total} hasil
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Halaman {pagination.current_page} dari {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showForm && (
        <MakananForm
          open={showForm}
          onClose={handleFormClose}
          editingMakanan={editingMakanan}
          categories={categories}
          onSuccess={onRefresh} // Pass refresh callback
        />
      )}
    </div>
  )
}
