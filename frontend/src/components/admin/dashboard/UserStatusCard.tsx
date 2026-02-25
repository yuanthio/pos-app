import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UserStatusCardProps {
  activeUsers: number
  inactiveUsers: number
}

export function UserStatusCard({ activeUsers, inactiveUsers }: UserStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Pengguna</CardTitle>
        <CardDescription>Pengguna aktif vs tidak aktif</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-600">Pengguna Aktif</span>
            <span className="text-sm font-bold text-green-600">{activeUsers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-600">Pengguna Tidak Aktif</span>
            <span className="text-sm font-bold text-red-600">{inactiveUsers}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
