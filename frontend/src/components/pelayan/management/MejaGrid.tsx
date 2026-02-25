import { Card, CardContent } from '@/components/ui/card'
import type { Meja } from '@/types'
import { Search } from 'lucide-react'
import MejaCard from './MejaCard'

interface MejaGridProps {
  mejas: Meja[]
  loading: boolean
  onUpdateStatus: (meja: Meja) => void
  onCreateOrder: () => void
}

export default function MejaGrid({ mejas, loading, onUpdateStatus, onCreateOrder }: MejaGridProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data meja...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (mejas.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600 text-lg mb-2">Tidak ada meja ditemukan</p>
            <p className="text-sm text-gray-500">
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mejas.map((meja) => (
        <MejaCard
          key={meja.id}
          meja={meja}
          onUpdateStatus={onUpdateStatus}
          onCreateOrder={onCreateOrder}
        />
      ))}
    </div>
  )
}
