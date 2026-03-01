import { useState } from 'react'
import { Search, Filter, Plus, RefreshCw, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { MakananParams } from '@/types'

interface MakananFiltersProps {
  filters: MakananParams
  categories: Array<{ value: string; label: string }>
  onFilterChange: (filters: Partial<MakananParams>) => void
  onRefresh: () => void
  onAdd: () => void
}

export function MakananFilters({ 
  filters, 
  categories, 
  onFilterChange, 
  onRefresh,
  onAdd
}: MakananFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

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

  const handleSort = (sort_by: string) => {
    onFilterChange({ sort_by, page: 1 })
  }

  const handleSortOrder = (sort_order: 'asc' | 'desc') => {
    onFilterChange({ sort_order, page: 1 })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.kategori) count++
    if (filters.tersedia !== undefined) count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Filter & Pencarian</h3>
          </div>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFiltersCount()} filter aktif
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Makanan
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama makanan..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 bg-background border-input"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={filters.kategori || 'all'}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger className="h-10 bg-background border-input">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <span>Semua Kategori</span>
                  </div>
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Availability Filter */}
            <Select
              value={filters.tersedia === undefined ? 'all' : filters.tersedia ? 'tersedia' : 'tidak'}
              onValueChange={(value) => {
                if (value === 'all') handleAvailabilityFilter(undefined)
                else handleAvailabilityFilter(value === 'tersedia')
              }}
            >
              <SelectTrigger className="h-10 bg-background border-input">
                <SelectValue placeholder="Status Ketersediaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <span>Semua Status</span>
                  </div>
                </SelectItem>
                <SelectItem value="tersedia">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Tersedia</span>
                  </div>
                </SelectItem>
                <SelectItem value="tidak">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Tidak Tersedia</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <div className="flex gap-2">
              <Select
                value={filters.sort_by || 'nama'}
                onValueChange={handleSort}
              >
                <SelectTrigger className="flex-1 h-10 bg-background border-input">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Urutkan" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nama">Nama</SelectItem>
                  <SelectItem value="harga">Harga</SelectItem>
                  <SelectItem value="stok">Stok</SelectItem>
                  <SelectItem value="created_at">Tanggal</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sort_order || 'asc'}
                onValueChange={handleSortOrder}
              >
                <SelectTrigger className="w-20 h-10 bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">A-Z</SelectItem>
                  <SelectItem value="desc">Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter aktif:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.search && (
                    <Badge variant="outline" className="text-xs">
                      Search: "{filters.search}"
                    </Badge>
                  )}
                  {filters.kategori && (
                    <Badge variant="outline" className="text-xs">
                      Kategori: {filters.kategori}
                    </Badge>
                  )}
                  {filters.tersedia !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      Status: {filters.tersedia ? 'Tersedia' : 'Tidak Tersedia'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
