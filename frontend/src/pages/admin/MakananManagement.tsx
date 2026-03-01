import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { MakananList } from '@/components/admin/makanan'
import { fetchMakanans, fetchCategories, setFilters, clearError } from '@/store/makananSlice'
import type { AppDispatch, RootState } from '@/store'
import type { MakananParams, Makanan } from '@/types'
import { useAuthUtils } from '@/hooks/useAuth'

export default function MakananManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const { makanans, pagination, loading, error, filters, categories } = useSelector((state: RootState) => state.makanan)
  const { getDisplayName, getRoleDisplay, logout } = useAuthUtils()

  useEffect(() => {
    // Only fetch data on initial load, not on filter changes
    if (makanans.length === 0) {
      // Fetch all data without pagination for client-side filtering
      dispatch(fetchMakanans({ page: 1, per_page: 1000 })) // Fetch all data
    }
    dispatch(fetchCategories())
  }, [dispatch]) // Remove filters dependency

  const handleFilterChange = (newFilters: Partial<MakananParams>) => {
    dispatch(setFilters(newFilters))
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const handleRefresh = () => {
    dispatch(fetchMakanans({ page: 1, per_page: 1000 })) // Fetch all data
    toast.success('Data berhasil diperbarui!')
  }

  const handleEdit = (makanan: Makanan) => {
    // Edit functionality will be handled by MakananList component
    console.log('Edit makanan:', makanan)
  }

  const handleDelete = (id: number) => {
    // Delete functionality will be handled by MakananList component
    console.log('Delete makanan:', id)
  }

  const handleToggleAvailability = (id: number) => {
    // Toggle availability will be handled by MakananList component
    console.log('Toggle availability:', id)
  }

  const handleClearError = () => {
    dispatch(clearError())
    toast.dismiss() // Dismiss all active toasts
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        userName={getDisplayName()}
        userRole={getRoleDisplay()}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Master Makanan</h1>
          <p className="mt-2 text-gray-600">Kelola menu makanan, minuman, dan snack</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Kesalahan</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      onClick={handleClearError}
                      className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                    >
                      Tutup
                    </button>
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <MakananList
          makanans={makanans}
          pagination={pagination}
          loading={loading}
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onRefresh={handleRefresh}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleAvailability={handleToggleAvailability}
        />
      </main>
    </div>
  )
}
