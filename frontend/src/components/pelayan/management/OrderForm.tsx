import { Button } from '@/components/ui/button'

interface OrderFormProps {
  customerName: string
  notes: string
  mejaStatus: string
  onCustomerNameChange: (value: string) => void
  onNotesChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function OrderForm({
  customerName,
  notes,
  mejaStatus,
  onCustomerNameChange,
  onNotesChange,
  onSubmit,
  onCancel,
  isSubmitting = false
}: OrderFormProps) {
  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <label className="block text-sm font-medium mb-1">
          Nama Pelanggan *
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomerNameChange(e.target.value)}
          placeholder="Masukkan nama pelanggan"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Hanya tampilkan catatan untuk meja yang statusnya 'dipesan' */}
      {mejaStatus === 'dipesan' && (
        <div>
          <label className="block text-sm font-medium mb-2">Catatan:</label>
          <textarea
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onNotesChange(e.target.value)}
            placeholder="Catatan pesanan..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          onClick={onSubmit}
          disabled={!customerName.trim() || isSubmitting}
          className="flex-1"
          size="sm"
        >
          {isSubmitting ? 'Membuat Pesanan...' : 'Buat Pesanan'}
        </Button>
        <Button 
          onClick={onCancel}
          variant="outline"
          size="sm"
        >
          Batal
        </Button>
      </div>
    </div>
  )
}
