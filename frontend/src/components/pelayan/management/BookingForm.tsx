import { Button } from '@/components/ui/button'

interface BookingFormProps {
  bookingName: string
  bookingNotes: string
  isBooking: boolean
  onBookingNameChange: (value: string) => void
  onBookingNotesChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export default function BookingForm({
  bookingName,
  bookingNotes,
  isBooking,
  onBookingNameChange,
  onBookingNotesChange,
  onSubmit,
  onCancel
}: BookingFormProps) {
  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <label className="block text-sm font-medium mb-1">
          Nama Pelanggan *
        </label>
        <input
          type="text"
          value={bookingName}
          onChange={(e) => onBookingNameChange(e.target.value)}
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
          onChange={(e) => onBookingNotesChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Contoh: Jam 19:00, 4 orang, dll."
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={isBooking || !bookingName.trim()}
          className="flex-1"
          size="sm"
        >
          {isBooking ? 'Memboking...' : 'Konfirmasi Booking'}
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
