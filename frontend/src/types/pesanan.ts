import type { Makanan } from './makanan'
import type { Meja } from './meja'

export interface DetailPesanan {
  id: number
  pesanan_id: number
  makanan_id: number
  jumlah: number
  harga_satuan: number
  subtotal: number
  catatan?: string
  created_at: string
  updated_at: string
  makanan?: Makanan
}

export interface Pesanan {
  id: number
  meja_id: number
  user_id: number
  nama_pelanggan?: string
  status: 'menunggu' | 'diproses' | 'selesai' | 'dibayar' | 'dibatalkan'
  total_harga: number
  catatan?: string
  created_at: string
  updated_at: string
  meja?: Meja
  user?: {
    id: number
    name: string
    email: string
  }
  detail_pesanans?: DetailPesanan[]
  // Payment history fields
  total_with_tax_service?: number
  tax_amount?: number
  service_amount?: number
  subtotal_amount?: number
}

export interface AddItemRequest {
  makanan_id: number
  jumlah: number
  catatan?: string
}

export interface CreateOrderResponse {
  success: boolean
  data: Pesanan
  message: string
}

export interface CreateOrderRequest {
  meja_id: number
  nama_pelanggan?: string
  catatan?: string
}

export interface UpdateItemRequest {
  jumlah: number
}

export interface PesananResponse {
  success: boolean
  data: Pesanan[]
}

export interface SinglePesananResponse {
  success: boolean
  data: Pesanan
}

export interface AddItemResponse {
  success: boolean
  data: Pesanan
  message: string
}

export interface UpdateItemResponse {
  success: boolean
  data: Pesanan
  message: string
}

export interface RemoveItemResponse {
  success: boolean
  data: Pesanan
  message: string
}

export interface CancelOrderRequest {
  alasan?: string
}

export interface OrderActionResponse {
  success: boolean
  data: Pesanan
  message: string
}

export interface PesananState {
  orders: Pesanan[]
  currentOrder: Pesanan | null
  loading: boolean
  error: string | null
  lastFetch: number | null // Add timestamp for caching
}

export interface PesananFilters {
  status?: string
  meja_id?: number
  date?: string
}

export interface OrderSummary {
  total_orders: number
  active_orders: number
  completed_orders: number
  total_revenue: number
}
