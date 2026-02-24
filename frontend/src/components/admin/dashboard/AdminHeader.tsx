import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface AdminHeaderProps {
  userName: string
  userRole: string
  onLogout: () => void
}

export function AdminHeader({ userName, userRole, onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {userName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 bg-purple-100 px-3 py-1 rounded-full">
              {userRole}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
