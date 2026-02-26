import { Card, CardContent } from '@/components/ui/card'
import type { MejaStatusCount } from '@/types'

interface MejaStatsProps {
  statusCount: MejaStatusCount
}

export default function MejaStats({ statusCount }: MejaStatsProps) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statusCount.tersedia}</div>
            <div className="text-sm text-gray-600">Tersedia</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{statusCount.terisi}</div>
            <div className="text-sm text-gray-600">Terisi</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCount.dipesan}</div>
            <div className="text-sm text-gray-600">Dipesan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{statusCount.tidak_aktif}</div>
            <div className="text-sm text-gray-600">Tidak Aktif</div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
