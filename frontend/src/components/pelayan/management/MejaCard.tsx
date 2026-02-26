import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Meja } from '@/types'
import { Users, Clock, CheckCircle, XCircle, Plus, Calendar } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import { createOrder, bookTable } from '@/store/mejaSlice'
import { toast } from 'sonner'

interface MejaCardProps {
  meja: Meja
  onCreateOrder?: (meja: Meja) => void
  onUpdateStatus?: (meja: Meja) => void
}

export default function MejaCard({ meja, onCreateOrder, onUpdateStatus }: MejaCardProps) {
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
      await dispatch(createOrder({
        meja_id: meja.id,
        nama_pelanggan: customerName,
        catatan: notes || undefined
      })).unwrap()
      
      toast.success('Pesanan berhasil dibuat')
      setShowOrderForm(false)
      setCustomerName('')
      setNotes('')
      onCreateOrder?.(meja)
    } catch (error: any) {
      toast.error(error || 'Gagal membuat pesanan')
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

        {meja.catatan && (
          <div className="text-sm text-gray-500 italic">
            Catatan: {meja.catatan}
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

        {showOrderForm && (
          <div className="space-y-3 border-t pt-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Pelanggan *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama pelanggan"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Catatan (opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Catatan pesanan..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateOrder}
                disabled={isCreatingOrder || !customerName.trim()}
                className="flex-1"
                size="sm"
              >
                {isCreatingOrder ? 'Membuat...' : 'Konfirmasi'}
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

        {!isAvailable && onUpdateStatus && (
          <Button
            onClick={() => onUpdateStatus(meja)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Update Status
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
