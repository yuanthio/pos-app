import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Meja } from '@/types'

interface UpdateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMeja: Meja | null
  newStatus: string
  onStatusChange: (status: string) => void
  onConfirm: () => void
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
                <SelectItem value="terisi">Terisi</SelectItem>
                <SelectItem value="dipesan">Dipesan</SelectItem>
                <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onConfirm}
            disabled={loading || newStatus === selectedMeja?.status}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
