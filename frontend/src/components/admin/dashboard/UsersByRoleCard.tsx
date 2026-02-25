import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UsersByRoleCardProps {
  usersByRole: {
    admin: number
    kasir: number
    pelayan: number
  }
}

export function UsersByRoleCard({ usersByRole }: UsersByRoleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengguna Berdasarkan Peran</CardTitle>
        <CardDescription>Distribusi pengguna berdasarkan peran</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Admin</span>
            <span className="text-sm text-gray-600">{usersByRole.admin}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Kasir</span>
            <span className="text-sm text-gray-600">{usersByRole.kasir}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pelayan</span>
            <span className="text-sm text-gray-600">{usersByRole.pelayan}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
