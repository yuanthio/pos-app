export interface Meja {
  id: number
  nomor_meja: string
  status: 'tersedia' | 'terisi' | 'dipesan' | 'tidak_aktif'
  kapasitas: number
  catatan: string | null
  created_at: string
  updated_at: string
}

export interface MejaStatusCount {
  tersedia: number
  terisi: number
  dipesan: number
  tidak_aktif: number
}

export interface MejaResponse {
  success: boolean
  data: {
    mejas: Meja[]
    status_count: MejaStatusCount
    total_meja: number
  }
}

export interface CreateOrderRequest {
  meja_id: number
  nama_pelanggan?: string
  catatan?: string
}

export interface Pesanan {
  id: number
  meja_id: number
  user_id: number
  nama_pelanggan: string | null
  status: 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan'
  total_harga: number
  catatan: string | null
  created_at: string
  updated_at: string
  meja?: Meja
  user?: {
    id: number
    name: string
    email: string
  }
  detailPesanans?: any[]
}

export interface PesananResponse {
  success: boolean
  data: Pesanan[]
}

export interface CreateOrderResponse {
  success: boolean
  data: Pesanan
  message: string
}
