import { Button } from '@/components/ui/button'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface AdminHeaderProps {
  userName: string
  userRole: string
  onLogout: () => void
}

export function AdminHeader({ userName, userRole, onLogout }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      description: 'Overview dan statistik'
    },
    {
      label: 'Master Makanan',
      href: '/admin/makanan',
      description: 'Kelola menu makanan'
    },
    {
      label: 'Manajemen User',
      href: '/admin/users',
      description: 'Kelola pengguna'
    }
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Welcome, {userName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

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
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href)
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-sm text-gray-500">{item.description}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
