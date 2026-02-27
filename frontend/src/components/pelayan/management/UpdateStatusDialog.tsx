import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import type { Meja } from '@/types'

interface UpdateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMeja: Meja | null
  newStatus: string
  onStatusChange: (status: string) => void
  onConfirm: (data: { status: string; nama_pelanggan?: string; catatan?: string }) => void
  loading: boolean
}

export default function UpdateStatusDialog({
  open,
  onOpenChange,
  selectedMeja,
  newStatus,
  onStatusChange,
  onConfirm,
  loading
}: UpdateStatusDialogProps) {
  const [namaPelanggan, setNamaPelanggan] = useState(selectedMeja?.nama_pelanggan || '')
  const [catatan, setCatatan] = useState(selectedMeja?.catatan || '')
  
  // Track original values for comparison
  const [originalNamaPelanggan, setOriginalNamaPelanggan] = useState('')
  const [originalCatatan, setOriginalCatatan] = useState('')

  // Reset form when dialog opens or status changes
  useEffect(() => {
    if (open && selectedMeja) {
      console.log('Dialog opened - selectedMeja:', selectedMeja)
      
      // Parse nama from catatan if nama_pelanggan is empty
      let parsedNama = selectedMeja.nama_pelanggan || ''
      let parsedCatatan = selectedMeja.catatan || ''
      
      // Fallback parsing if backend doesn't provide nama_pelanggan
      if (!parsedNama && selectedMeja.catatan && selectedMeja.catatan.includes('Booking untuk:')) {
        const bookingText = selectedMeja.catatan.replace('Booking untuk: ', '')
        const parts = bookingText.split(' - ', 2)
        parsedNama = parts[0] || ''
        parsedCatatan = parts[1] || ''
        console.log('Fallback parsing - nama:', parsedNama, 'catatan:', parsedCatatan)
      }
      
      // For existing 'dipesan' status, extract clean catatan
      if (selectedMeja.status === 'dipesan' && selectedMeja.catatan && selectedMeja.catatan.includes('Booking untuk:')) {
        const bookingText = selectedMeja.catatan.replace('Booking untuk: ', '')
        const parts = bookingText.split(' - ', 2)
        // Keep original nama if available, otherwise use parsed
        if (!parsedNama) {
          parsedNama = parts[0] || ''
        }
        // Use clean catatan (without prefix)
        parsedCatatan = parts[1] || ''
        console.log('Clean parsing for dipesan - nama:', parsedNama, 'catatan:', parsedCatatan)
      }
      
      setNamaPelanggan(parsedNama)
      setCatatan(parsedCatatan)
      
      // Set original values for comparison
      setOriginalNamaPelanggan(parsedNama)
      setOriginalCatatan(parsedCatatan)
    }
  }, [open, selectedMeja])

  // Auto-fill nama when status changes to 'dipesan'
  useEffect(() => {
    console.log('Status changed to:', newStatus, 'selectedMeja:', selectedMeja)
    if (newStatus === 'dipesan' && selectedMeja) {
      let parsedNama = selectedMeja.nama_pelanggan || ''
      let parsedCatatan = ''
      
      // Fallback parsing if backend doesn't provide nama_pelanggan
      if (!parsedNama && selectedMeja.catatan && selectedMeja.catatan.includes('Booking untuk:')) {
        const bookingText = selectedMeja.catatan.replace('Booking untuk: ', '')
        const parts = bookingText.split(' - ', 2)
        parsedNama = parts[0] || ''
        parsedCatatan = parts[1] || ''
        console.log('Fallback parsing on status change - nama:', parsedNama, 'catatan:', parsedCatatan)
      }
      
      if (parsedNama) {
        console.log('Auto-filling nama:', parsedNama)
        setNamaPelanggan(parsedNama)
        setCatatan(parsedCatatan)
        
        // Update original values when status changes to 'dipesan'
        setOriginalNamaPelanggan(parsedNama)
        setOriginalCatatan(parsedCatatan)
      }
    } else if (newStatus === 'tersedia') {
      // Clear values when status changes to 'tersedia'
      setNamaPelanggan('')
      setCatatan('')
      setOriginalNamaPelanggan('')
      setOriginalCatatan('')
    }
  }, [newStatus, selectedMeja])

  // Check if there are changes to enable confirm button
  const hasChanges = () => {
    // If status changed, always allow confirm
    if (newStatus !== selectedMeja?.status) {
      return true
    }
    
    // If status is 'dipesan' and didn't change, allow if nama OR catatan changed
    if (newStatus === 'dipesan') {
      return namaPelanggan.trim() !== originalNamaPelanggan.trim() || 
             catatan.trim() !== originalCatatan.trim()
    }
    
    // For other statuses, allow if there are any changes
    return true
  }

  const handleConfirm = () => {
    // Validation: nama_pelanggan required for 'dipesan' status
    if (newStatus === 'dipesan' && !namaPelanggan.trim()) {
      return // Don't submit if nama is empty
    }
    
    onConfirm({
      status: newStatus,
      nama_pelanggan: newStatus === 'dipesan' ? namaPelanggan : undefined,
      catatan: newStatus === 'dipesan' ? catatan : undefined
    })
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'tersedia':
        return 'bg-green-100 text-green-800'
      case 'terisi':
        return 'bg-red-100 text-red-800'
      case 'dipesan':
        return 'bg-yellow-100 text-yellow-800'
      case 'tidak_aktif':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Update Status Meja</DialogTitle>
          <DialogDescription>
            Ubah status meja {selectedMeja?.nomor_meja}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Meja: {selectedMeja?.nomor_meja}</p>
            <p className="text-sm text-gray-600 mb-4">Status saat ini: 
              <Badge className={`ml-2 ${getStatusColor(selectedMeja?.status || '')}`}>
                {selectedMeja?.status}
              </Badge>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Status Baru:</label>
            <Select value={newStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tersedia">Tersedia</SelectItem>
                <SelectItem value="dipesan">Dipesan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newStatus === 'dipesan' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Pelanggan <span className="text-red-500">*</span>
                </label>
                <Input
                  value={namaPelanggan}
                  onChange={(e) => setNamaPelanggan(e.target.value)}
                  placeholder="Masukkan nama pelanggan untuk booking"
                  className={newStatus === 'dipesan' && !namaPelanggan.trim() ? 'border-red-500' : ''}
                />
                {newStatus === 'dipesan' && !namaPelanggan.trim() && (
                  <p className="text-red-500 text-xs mt-1">Nama pelanggan wajib diisi</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Catatan Booking (Opsional):</label>
                <Textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Jam 19:00, 4 orang, dll. (Opsional)"
                  rows={2}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            {!hasChanges() && newStatus === selectedMeja?.status && newStatus === 'dipesan' && (
              <span>📝 Edit nama pelanggan atau catatan untuk mengaktifkan tombol konfirmasi</span>
            )}
            {newStatus === 'dipesan' && !namaPelanggan.trim() && (
              <span>⚠️ Nama pelanggan wajib diisi</span>
            )}
          </div>
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleConfirm}
              disabled={loading || !hasChanges() || (newStatus === 'dipesan' && !namaPelanggan.trim())}
              className="flex-1"
            >
              {loading ? 'Memperbarui...' : 'Konfirmasi'}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
            >
              Batal
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
