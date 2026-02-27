import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Meja } from '@/types'
import { Users, Clock, CheckCircle, XCircle, Plus, Power } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import { createOrder, bookTable } from '@/store/mejaSlice'
import { toast } from 'sonner'

interface MejaCardProps {
  meja: Meja
  onCreateOrder?: (meja: Meja) => void
  onUpdateStatus?: (meja: Meja) => void
  onRealUpdate?: () => void // Callback for real data refresh
  onDisableTable?: (meja: Meja) => void // Callback untuk nonaktifkan meja
}

export default function MejaCard({ meja, onCreateOrder, onUpdateStatus, onRealUpdate, onDisableTable }: MejaCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [bookingName, setBookingName] = useState('')
  const [notes, setNotes] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'tersedia':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'terisi':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'dipesan':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'tidak_aktif':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'tersedia':
        return <CheckCircle className="h-4 w-4" />
      case 'terisi':
        return <Users className="h-4 w-4" />
      case 'dipesan':
        return <Clock className="h-4 w-4" />
      case 'tidak_aktif':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'tersedia':
        return 'Tersedia'
      case 'terisi':
        return 'Terisi'
      case 'dipesan':
        return 'Sedang Dipesan'
      case 'tidak_aktif':
        return 'Tidak Aktif'
      default:
        return status
    }
  }

  const handleCreateOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Nama pelanggan harus diisi')
      return
    }

    setIsCreatingOrder(true)
    
    try {
      // Close form immediately for better UX
      setShowOrderForm(false)
      setCustomerName('')
      setNotes('')
      
      // Call API - Redux will handle optimistic updates
      await dispatch(createOrder({
        meja_id: meja.id,
        nama_pelanggan: customerName,
        catatan: notes || undefined
      })).unwrap()

      toast.success('Pesanan berhasil dibuat')
      onCreateOrder?.(meja) // Pass original meja
      onRealUpdate?.() // Call real update only on success
    } catch (error: any) {
      console.error('Create order failed:', error)
      toast.error(error || 'Gagal membuat pesanan')
      
      // Re-open form on error
      setShowOrderForm(true)
      setCustomerName(customerName)
      setNotes(notes)
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const handleBookTable = async () => {
    if (!bookingName.trim()) {
      toast.error('Nama pelanggan harus diisi')
      return
    }

    setIsBooking(true)
    try {
      await dispatch(bookTable({
        mejaId: meja.id,
        namaPelanggan: bookingName,
        catatan: bookingNotes || undefined
      })).unwrap()
      
      toast.success('Meja berhasil di-booking!')
      setShowBookingForm(false)
      setBookingName('')
      setBookingNotes('')
    } catch (error: any) {
      toast.error(error || 'Gagal booking meja')
    } finally {
      setIsBooking(false)
    }
  }

  const isAvailable = meja.status === 'tersedia'
  const isBooked = meja.status === 'dipesan'
  const isOccupied = meja.status === 'terisi'
  const isInactive = meja.status === 'tidak_aktif'
  const canUpdateStatus = isBooked && onUpdateStatus
  const canDisableTable = !isBooked && !isOccupied && onDisableTable // Tidak bisa nonaktifkan jika dipesan atau terisi
  const canActivateTable = isInactive && onDisableTable // Hanya bisa aktifkan jika status tidak aktif

  // Handler untuk nonaktifkan meja
  const handleDisableTable = () => {
    if (onDisableTable) {
      onDisableTable(meja)
    }
  }

  // Handler untuk aktifkan meja
  const handleActivateTable = () => {
    if (onDisableTable) {
      onDisableTable(meja) // Reuse same callback but with different status
    }
  }

  // Handler untuk buat pesanan dari booking (otomatis tanpa form)
  const handleCreateOrderFromBooking = async () => {
    setIsCreatingOrder(true)
    
    try {
      // Call API directly with booking data - no form needed
      await dispatch(createOrder({
        meja_id: meja.id,
        // Backend will extract customer info from meja.catatan
      })).unwrap()

      toast.success(`Pesanan berhasil dibuat untuk ${bookingInfo.nama || 'pelanggan'}`)
      onCreateOrder?.(meja)
      onRealUpdate?.()
    } catch (error: any) {
      console.error('Create order from booking failed:', error)
      toast.error(error || 'Gagal membuat pesanan dari booking')
    } finally {
      setIsCreatingOrder(false)
    }
  }

  // Parse booking info for display
  const getBookingInfo = () => {
    if (meja.status === 'dipesan' && meja.catatan && meja.catatan.includes('Booking untuk:')) {
      const bookingText = meja.catatan.replace('Booking untuk: ', '')
      const parts = bookingText.split(' - ', 2)
      return {
        nama: parts[0] || '',
        catatan: parts[1] || ''
      }
    }
    return { nama: meja.nama_pelanggan || '', catatan: meja.catatan || '' }
  }

  const bookingInfo = getBookingInfo()

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{meja.nomor_meja}</h3>
          <Badge className={getStatusColor(meja.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(meja.status)}
              {getStatusLabel(meja.status)}
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>Kapasitas: {meja.kapasitas} orang</span>
        </div>

        {meja.status === 'dipesan' && (bookingInfo.nama || bookingInfo.catatan) && (
          <div className="space-y-1">
            {bookingInfo.nama && (
              <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded border border-blue-200">
                <span className="font-semibold text-blue-700">👤 Nama pelanggan:</span> {bookingInfo.nama}
              </div>
            )}
            {bookingInfo.catatan && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                <span className="font-semibold text-gray-700">📝 Catatan:</span> {bookingInfo.catatan}
              </div>
            )}
          </div>
        )}

        {meja.catatan && meja.status !== 'dipesan' && meja.status !== 'terisi' && (
          <div className="text-sm text-gray-500 italic">
            Catatan: {meja.catatan}
          </div>
        )}

        {meja.nama_pelanggan && meja.status === 'terisi' && (
          <div className="text-sm text-gray-600 bg-green-50 p-2 rounded border border-green-200">
            <span className="font-semibold text-green-700">👤 Pelanggan:</span> {meja.nama_pelanggan}
          </div>
        )}

        {isBooked && !showOrderForm && (
          <div className="space-y-2">
            <Button 
              onClick={handleCreateOrderFromBooking}
              disabled={isCreatingOrder}
              className="w-full"
              size="sm"
            >
              {isCreatingOrder ? 'Membuat Pesanan...' : 'Buat Pesanan'}
            </Button>
            {canUpdateStatus && (
              <Button
                onClick={() => onUpdateStatus(meja)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Update Status
              </Button>
            )}
          </div>
        )}

        {isAvailable && !showOrderForm && !showBookingForm && (
          <div className="space-y-2">
            <Button 
              onClick={() => setShowBookingForm(true)}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Booking Meja
            </Button>
            <Button 
              onClick={() => setShowOrderForm(true)}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Pesanan Langsung
            </Button>
          </div>
        )}

        {/* Info untuk meja yang tidak bisa dinonaktifkan */}
        {(isBooked || isOccupied) && (
          <div className="text-xs text-gray-500 italic text-center bg-gray-50 p-2 rounded">
            {isBooked && "🟡 Meja sedang di-booking, tidak bisa dinonaktifkan"}
            {isOccupied && "🔴 Meja sedang terisi, tidak bisa dinonaktifkan"}
          </div>
        )}

        {/* Tombol Aktifkan Meja - untuk meja yang statusnya tidak aktif */}
        {isInactive && (
          <div className="space-y-2">
            <Button 
              onClick={handleActivateTable}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Power className="h-4 w-4 mr-2" />
              Aktifkan Meja
            </Button>
          </div>
        )}

        {/* Tombol Nonaktifkan Meja - paling bawah dengan warna merah */}
        {!isInactive && canDisableTable && (
          <div className="space-y-2">
            <Button 
              onClick={handleDisableTable}
              variant="destructive" // Warna merah
              className="w-full"
              size="sm"
            >
              <Power className="h-4 w-4 mr-2" />
              Nonaktifkan Meja
            </Button>
          </div>
        )}

        {showOrderForm && (
          <div className="space-y-3 border-t pt-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Pelanggan *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama pelanggan"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Hanya tampilkan catatan untuk meja yang statusnya 'dipesan' */}
            {meja.status === 'dipesan' && (
              <div>
                <label className="block text-sm font-medium mb-2">Catatan:</label>
                <textarea
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  placeholder="Catatan pesanan..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateOrder}
                disabled={isCreatingOrder || !customerName.trim()}
                className="flex-1"
                size="sm"
              >
                {isCreatingOrder ? 'Membuat Pesanan...' : 'Buat Pesanan'}
              </Button>
              <Button 
                onClick={() => {
                  setShowOrderForm(false)
                  setCustomerName('')
                  setNotes('')
                }}
                variant="outline"
                size="sm"
              >
                Batal
              </Button>
            </div>
          </div>
        )}

        {showBookingForm && (
          <div className="space-y-3 border-t pt-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Pelanggan *
              </label>
              <input
                type="text"
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama pelanggan"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Catatan Booking (opsional)
              </label>
              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Contoh: Jam 19:00, 4 orang, dll."
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleBookTable}
                disabled={isBooking || !bookingName.trim()}
                className="flex-1"
                size="sm"
              >
                {isBooking ? 'Memboking...' : 'Konfirmasi Booking'}
              </Button>
              <Button
                onClick={() => {
                  setShowBookingForm(false)
                  setBookingName('')
                  setBookingNotes('')
                }}
                variant="outline"
                size="sm"
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
