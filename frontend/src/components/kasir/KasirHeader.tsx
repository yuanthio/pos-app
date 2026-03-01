import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuthUtils } from '@/hooks/useAuth';

interface KasirHeaderProps {
  onLogout: () => void;
}

export default function KasirHeader({ onLogout }: KasirHeaderProps) {
  const { getDisplayName, getRoleDisplay } = useAuthUtils();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Kasir Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {getDisplayName()}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
              {getRoleDisplay()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
