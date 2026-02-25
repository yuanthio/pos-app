import { Button } from '@/components/ui/button'
import { useAuthUtils } from '@/hooks/useAuth'
import { LogOut } from 'lucide-react'

interface PelayanHeaderProps {
  onLogout: () => void
}

export default function PelayanHeader({ onLogout }: PelayanHeaderProps) {
  const { getDisplayName, getRoleDisplay } = useAuthUtils()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Pelayan Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {getDisplayName()}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 bg-green-100 px-3 py-1 rounded-full">
              {getRoleDisplay()}
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
