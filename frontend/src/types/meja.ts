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
