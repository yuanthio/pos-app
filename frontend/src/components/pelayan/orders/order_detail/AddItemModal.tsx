import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Search, Plus } from 'lucide-react'
import type { Makanan } from '@/types'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAddItem: (item: { makanan_id: number; jumlah: number; catatan?: string }) => void
  availableItems: Makanan[]
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  onPageChange?: (page: number) => void
}

export default function AddItemModal({
  isOpen,
  onClose,
  onAddItem,
  availableItems,
  pagination,
  onPageChange
}: AddItemModalProps) {
  const [selectedItem, setSelectedItem] = useState<Makanan | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [catatan, setCatatan] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: 'Semua' },
    { value: 'makanan', label: 'Makanan' },
    { value: 'minuman', label: 'Minuman' },
    { value: 'snack', label: 'Snack' },
  ]

  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.kategori === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Debug: Log available items and filtered items
  useEffect(() => {
    console.log('Available items in modal:', availableItems.length)
    console.log('Available items by category:', availableItems.reduce((acc, item) => {
      acc[item.kategori] = (acc[item.kategori] || 0) + 1
      return acc
    }, {} as Record<string, number>))
    console.log('Filtered items:', filteredItems.length)
  }, [availableItems, filteredItems])

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleAddItem = () => {
    if (selectedItem && quantity > 0) {
      onAddItem({
        makanan_id: selectedItem.id,
        jumlah: quantity,
        catatan: catatan || undefined
      })
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedItem(null)
    setQuantity(1)
    setCatatan('')
    setSearchTerm('')
    setSelectedCategory('all')
    onClose()
  }

  const handleSelectItem = (item: Makanan) => {
    setSelectedItem(item)
    setQuantity(1)
    setCatatan('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Tambah Item ke Pesanan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari makanan atau minuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-gray-300"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 h-10">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedItem?.id === item.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectItem(item)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{item.nama}</h3>
                    <Badge className={getCategoryColor(item.kategori)}>
                      {item.kategori}
                    </Badge>
                  </div>
                  
                  {item.deskripsi && (
                    <p className="text-gray-600 text-sm line-clamp-2">{item.deskripsi}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">
                      {formatCurrency(item.harga)}
                    </span>
                    <span className="text-xs text-gray-500">Stok: {item.stok}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500">Tidak ada item yang ditemukan</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => onPageChange && pagination.current_page > 1 && onPageChange(pagination.current_page - 1)}
                      className={pagination.current_page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => onPageChange && onPageChange(page)}
                        isActive={page === pagination.current_page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => onPageChange && pagination.current_page < pagination.last_page && onPageChange(pagination.current_page + 1)}
                      className={pagination.current_page >= pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Selected Item Details */}
          {selectedItem && (
            <div className="border-t pt-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Detail Item yang Dipilih</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Item</p>
                    <p className="font-medium text-gray-900">{selectedItem.nama}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(selectedItem.harga)}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah
                      </label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedItem.stok || 999}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full h-10"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Stok tersedia: {selectedItem.stok}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan (opsional)
                      </label>
                      <Textarea
                        id="catatan"
                        placeholder="Contoh: Extra pedas, tidak pakai sambal, dll."
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        className="w-full"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Subtotal:</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(selectedItem.harga * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-6">
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button
            onClick={handleAddItem}
            disabled={!selectedItem || quantity <= 0 || quantity > (selectedItem?.stok || 0)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah ke Pesanan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
