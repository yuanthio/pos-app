import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UserStatusCardProps {
  activeUsers: number
  inactiveUsers: number
}

export function UserStatusCard({ activeUsers, inactiveUsers }: UserStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Status</CardTitle>
        <CardDescription>Active vs inactive users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-600">Active Users</span>
            <span className="text-sm font-bold text-green-600">{activeUsers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-600">Inactive Users</span>
            <span className="text-sm font-bold text-red-600">{inactiveUsers}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
