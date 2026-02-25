export interface Makanan {
  id: number
  nama: string
  deskripsi: string
  harga: number
  kategori: 'makanan' | 'minuman' | 'snack'
  gambar?: string
  tersedia: boolean
  stok: number
  created_at: string
  updated_at: string
}

export interface CreateMakanan {
  nama: string
  deskripsi?: string
  harga: number
  kategori: 'makanan' | 'minuman' | 'snack'
  gambar?: File
  tersedia?: boolean
  stok: number
}

export interface UpdateMakanan {
  nama?: string
  deskripsi?: string
  harga?: number
  kategori?: 'makanan' | 'minuman' | 'snack'
  gambar?: File
  tersedia?: boolean
  stok?: number
}

export interface MakananParams {
  page?: number
  per_page?: number
  kategori?: string
  tersedia?: boolean
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface MakananResponse {
  success: boolean
  data: {
    makanans: Makanan[]
    pagination: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }
}

export interface SingleMakananResponse {
  success: boolean
  data: Makanan
}

export interface CategoriesResponse {
  success: boolean
  data: Array<{
    value: string
    label: string
  }>
}

export interface MakananApiResponse {
  success: boolean
  message: string
}
