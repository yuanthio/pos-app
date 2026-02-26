import type { Pesanan } from '@/types/pesanan'

/**
 * Helper functions for pesanan operations
 */

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'menunggu':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'diproses':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'selesai':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'dibatalkan':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'menunggu':
      return 'Menunggu'
    case 'diproses':
      return 'Diproses'
    case 'selesai':
      return 'Selesai'
    case 'dibatalkan':
      return 'Dibatalkan'
    default:
      return status
  }
}

export const canModifyOrder = (pesanan: Pesanan): boolean => {
  return ['menunggu', 'diproses'].includes(pesanan.status)
}

export const canCompleteOrder = (pesanan: Pesanan): boolean => {
  return ['menunggu', 'diproses'].includes(pesanan.status) && 
         (pesanan.detail_pesanans?.length ?? 0) > 0
}

export const canCancelOrder = (pesanan: Pesanan): boolean => {
  return ['menunggu', 'diproses'].includes(pesanan.status)
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getActionButtons = (pesanan: Pesanan) => {
  const buttons = []

  if (canModifyOrder(pesanan)) {
    buttons.push({
      label: 'Tambah Item',
      action: 'addItem',
      variant: 'default' as const
    })
  }

  if (canCompleteOrder(pesanan)) {
    buttons.push({
      label: 'Selesaikan Pesanan',
      action: 'complete',
      variant: 'success' as const
    })
  }

  if (canCancelOrder(pesanan)) {
    buttons.push({
      label: 'Batalkan Pesanan',
      action: 'cancel',
      variant: 'destructive' as const
    })
  }

  return buttons
}

export const getOrderProgress = (pesanan: Pesanan): number => {
  switch (pesanan.status) {
    case 'menunggu':
      return 25
    case 'diproses':
      return 50
    case 'selesai':
      return 100
    case 'dibatalkan':
      return 0
    default:
      return 0
  }
}

export const getNextStatus = (currentStatus: string): string | null => {
  switch (currentStatus) {
    case 'menunggu':
      return 'diproses'
    case 'diproses':
      return 'selesai'
    default:
      return null
  }
}
