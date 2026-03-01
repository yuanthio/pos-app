import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import { fetchMejas, updateTableStatus, clearError } from '@/store/mejaSlice'
import type { Meja } from '@/types'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import MejaStats from './MejaStats'
import MejaFilters from './MejaFilters'
import MejaGrid from './MejaGrid'
import MejaPagination from './MejaPagination'
import UpdateStatusDialog from './UpdateStatusDialog'

const ITEMS_PER_PAGE = 16;

export default function DaftarMeja() {
  const dispatch = useDispatch<AppDispatch>()
  const { mejas, statusCount, totalMeja, loading, error, updateStatusLoading } = useSelector((state: RootState) => state.meja)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [selectedMeja, setSelectedMeja] = useState<Meja | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Pagination logic
  const totalPages = Math.ceil(totalMeja / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const filteredMejas = mejas.filter((meja) => {
    const matchesSearch = meja.nomor_meja.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || meja.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Apply pagination to filtered results
  const paginatedMejas = filteredMejas.slice(startIndex, endIndex)
  const paginatedTotalPages = Math.ceil(filteredMejas.length / ITEMS_PER_PAGE)

  const handleUpdateStatus = (meja: Meja) => {
    setSelectedMeja(meja)
    setNewStatus(meja.status)
    setShowUpdateDialog(true)
  }

  const confirmUpdateStatus = async (data: { status: string; nama_pelanggan?: string; catatan?: string }) => {
    if (!selectedMeja) return

    try {
      await dispatch(updateTableStatus({
        mejaId: selectedMeja.id,
        status: data.status,
        nama_pelanggan: data.nama_pelanggan,
        catatan: data.catatan
      })).unwrap()
      
      toast.success('Status meja berhasil diperbarui')
      setShowUpdateDialog(false)
      setSelectedMeja(null)
      setNewStatus('')
    } catch (error: any) {
      toast.error(error || 'Gagal memperbarui status meja')
    }
  }

  const handleDisableTable = async (meja: Meja) => {
    try {
      const newStatus = meja.status === 'tidak_aktif' ? 'tersedia' : 'tidak_aktif'
      
      await dispatch(updateTableStatus({
        mejaId: meja.id,
        status: newStatus
      })).unwrap()
      
      const action = meja.status === 'tidak_aktif' ? 'diaktifkan' : 'dinonaktifkan'
      toast.success(`Meja ${meja.nomor_meja} berhasil ${action}`)
    } catch (error: any) {
      toast.error(error || 'Gagal mengubah status meja')
    }
  }

  const handleRefresh = () => {
    dispatch(fetchMejas())
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">Daftar Meja</h2>
          <MejaStats statusCount={statusCount} />
        </div>

        <div className="lg:w-64">
          <Card>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Meja:</span>
                <span className="font-semibold">{totalMeja}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tersedia:</span>
                <span className="font-semibold text-green-600">{statusCount.tersedia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Terisi:</span>
                <span className="font-semibold text-red-600">{statusCount.terisi}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Ketersediaan:</span>
                <span className="text-sm font-medium">
                  {totalMeja > 0 ? ((statusCount.tersedia / totalMeja) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <Progress 
                value={totalMeja > 0 ? (statusCount.tersedia / totalMeja) * 100 : 0} 
                className="h-2 flex-1" 
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <MejaFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Tables Grid */}
      <MejaGrid
        mejas={paginatedMejas}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
        onCreateOrder={() => undefined}
        onDisableTable={handleDisableTable}
      />

      {/* Pagination Controls */}
      <MejaPagination
        currentPage={currentPage}
        totalPages={paginatedTotalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={filteredMejas.length}
        onPageChange={handlePageChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      {/* Update Status Dialog */}
      <UpdateStatusDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        selectedMeja={selectedMeja}
        newStatus={newStatus}
        onStatusChange={setNewStatus}
        onConfirm={confirmUpdateStatus}
        loading={updateStatusLoading}
      />
    </div>
  )
}
