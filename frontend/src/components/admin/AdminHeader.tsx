import { Button } from '@/components/ui/button'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface AdminHeaderProps {
  userName: string
  userRole: string
  onLogout: () => void
}

export function AdminHeader({ userName, userRole, onLogout }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

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

  // Check if menu item is active
  const isMenuItemActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === href || location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
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
              {menuItems.map((item) => {
                const isActive = isMenuItemActive(item.href)
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={`text-sm font-medium transition-colors relative ${
                      isActive 
                        ? 'text-purple-600' 
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-600 rounded-full"></div>
                    )}
                  </button>
                )
              })}
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
              {menuItems.map((item) => {
                const isActive = isMenuItemActive(item.href)
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      navigate(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{item.description}</span>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
