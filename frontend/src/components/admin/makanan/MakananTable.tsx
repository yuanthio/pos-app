import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Makanan } from '@/types'

interface MakananTableProps {
  makanans: Makanan[]
  displayPagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  loading: boolean
  onEdit: (makanan: Makanan) => void
  onDelete: (id: number, nama: string) => void
  onToggleAvailability: (id: number) => void
}

export function MakananTable({ 
  makanans, 
  displayPagination,
  loading,
  onEdit,
  onDelete,
  onToggleAvailability
}: MakananTableProps) {
  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(harga)
  }

  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case 'makanan':
        return 'bg-orange-100 text-orange-800'
      case 'minuman':
        return 'bg-blue-100 text-blue-800'
      case 'snack':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (makanans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Tidak ada makanan yang ditemukan</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            <TableHead>Gambar</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {makanans.map((makanan: Makanan, index: number) => (
            <TableRow key={makanan.id}>
              <TableCell className="text-center">
                {(displayPagination.current_page - 1) * displayPagination.per_page + index + 1}
              </TableCell>
              <TableCell>
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  {makanan.gambar ? (
                    <img
                      src={makanan.gambar}
                      alt={makanan.nama}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No img</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{makanan.nama}</TableCell>
              <TableCell className="text-gray-600 max-w-xs truncate">
                {makanan.deskripsi || '-'}
              </TableCell>
              <TableCell className="font-medium">{formatHarga(makanan.harga)}</TableCell>
              <TableCell>
                <Badge className={getCategoryColor(makanan.kategori)}>
                  {makanan.kategori}
                </Badge>
              </TableCell>
              <TableCell>{makanan.stok}</TableCell>
              <TableCell>
                <Badge variant={makanan.tersedia ? "default" : "destructive"}>
                  {makanan.tersedia ? 'Tersedia' : 'Tidak Tersedia'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleAvailability(makanan.id)}
                    className="p-2"
                  >
                    {makanan.tersedia ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(makanan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(makanan.id, makanan.nama)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
