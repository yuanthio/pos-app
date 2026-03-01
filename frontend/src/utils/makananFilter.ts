import type { Makanan, MakananParams } from '@/types'

export interface FilterOptions {
  search?: string
  kategori?: string
  tersedia?: boolean
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export function filterMakanans(
  makanans: Makanan[], 
  filters: FilterOptions
): Makanan[] {
  let filtered = [...makanans]

  // Search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim()
    filtered = filtered.filter(makanan => 
      makanan.nama.toLowerCase().includes(searchTerm) ||
      (makanan.deskripsi && makanan.deskripsi.toLowerCase().includes(searchTerm))
    )
  }

  // Category filter
  if (filters.kategori && filters.kategori !== '') {
    filtered = filtered.filter(makanan => makanan.kategori === filters.kategori)
  }

  // Availability filter
  if (filters.tersedia !== undefined) {
    filtered = filtered.filter(makanan => makanan.tersedia === filters.tersedia)
  }

  // Sorting
  if (filters.sort_by) {
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sort_by as keyof Makanan]
      let bValue: any = b[filters.sort_by as keyof Makanan]

      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      // Handle null/undefined
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Compare based on sort order
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      return filters.sort_order === 'desc' ? -comparison : comparison
    })
  }

  return filtered
}

export function paginateResults(
  items: Makanan[], 
  page: number, 
  perPage: number
): { items: Makanan[]; total: number; totalPages: number } {
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const paginatedItems = items.slice(startIndex, endIndex)
  
  return {
    items: paginatedItems,
    total: items.length,
    totalPages: Math.ceil(items.length / perPage)
  }
}
