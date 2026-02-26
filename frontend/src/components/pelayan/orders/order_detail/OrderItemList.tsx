import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, Save, X } from 'lucide-react'
import type { DetailPesanan } from '@/types'

interface OrderItemListProps {
  items: DetailPesanan[]
  canModify: boolean
  onEditQuantity: (item: DetailPesanan | null) => void
  onRemoveItem: (detailId: number) => void
  editingItem: DetailPesanan | null
  onUpdateQuantity: (detailId: number, quantity: number) => void
}

export default function OrderItemList({
  items,
  canModify,
  onEditQuantity,
  onRemoveItem,
  editingItem,
  onUpdateQuantity
}: OrderItemListProps) {
  const [editQuantity, setEditQuantity] = useState<number>(1)

  const handleStartEdit = (item: DetailPesanan) => {
    setEditQuantity(item.jumlah)
    onEditQuantity(item)
  }

  const handleSaveEdit = () => {
    if (editingItem && editQuantity > 0) {
      onUpdateQuantity(editingItem.id, editQuantity)
    }
  }

  const handleCancelEdit = () => {
    setEditQuantity(1)
    onEditQuantity(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
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

  // Debug: Log subtotal types and values
  useEffect(() => {
    console.log('Items subtotal debug:', items.map(item => ({
      id: item.id,
      nama: item.makanan?.nama,
      subtotal: item.subtotal,
      subtotalType: typeof item.subtotal,
      isNaN: isNaN(item.subtotal)
    })))
  }, [items])

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="font-semibold text-gray-900">{item.makanan?.nama}</h3>
                <Badge className={getCategoryColor(item.makanan?.kategori || '')}>
                  {item.makanan?.kategori}
                </Badge>
                {!item.makanan?.tersedia && (
                  <Badge className="bg-red-100 text-red-800">
                    Tidak Tersedia
                  </Badge>
                )}
              </div>
              
              {item.makanan?.deskripsi && (
                <p className="text-gray-600 text-sm mb-3">{item.makanan.deskripsi}</p>
              )}
              
              {item.catatan && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
                  <p className="text-blue-700 text-sm">
                    <span className="font-medium">Catatan:</span> {item.catatan}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">Harga:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.harga_satuan)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">Jumlah:</span>
                    {editingItem?.id === item.id && canModify ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(Number(e.target.value))}
                          className="w-20 h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="h-8 px-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-8 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900">{item.jumlah}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </div>
                  <div className="text-xs text-gray-500">subtotal</div>
                </div>
              </div>
            </div>
            
            {canModify && editingItem?.id !== item.id && (
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleStartEdit(item)}
                  className="h-8 px-2 text-gray-600 hover:text-gray-900"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveItem(item.id)}
                  className="h-8 px-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Total Summary */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Total Harga:</span>
          <span className="text-xl font-bold text-green-600">
            {formatCurrency(items.reduce((total, item) => {
              const subtotal = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal
              return total + (isNaN(subtotal) ? 0 : subtotal)
            }, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}
