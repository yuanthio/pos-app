import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { Pesanan } from '@/types'

interface OrdersContentProps {
  pesanans: Pesanan[]
}

export default function OrdersContent({ pesanans }: OrdersContentProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Daftar Pesanan</h2>
      {pesanans.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg mb-2">Belum ada pesanan</p>
              <p className="text-sm">Mulai dengan membuat pesanan baru dari halaman Kelola Meja</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pesanans.map((pesanan) => (
            <Card key={pesanan.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {pesanan.nama_pelanggan || 'Guest'}
                    </h3>
                    <p className="text-gray-600">{pesanan.meja?.nomor_meja}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(pesanan.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      Rp {pesanan.total_harga.toLocaleString('id-ID')}
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pesanan.status === 'menunggu' ? 'bg-yellow-100 text-yellow-800' :
                        pesanan.status === 'diproses' ? 'bg-blue-100 text-blue-800' :
                        pesanan.status === 'selesai' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pesanan.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
