import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Utensils, Clock } from 'lucide-react'

interface QuickActionsProps {
  onNavigateToTab: (tab: 'tables' | 'orders') => void
}

export default function QuickActions({ onNavigateToTab }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
        <CardDescription>Tugas umum untuk pelayan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => onNavigateToTab('tables')}
        >
          <Utensils className="mr-2 h-4 w-4" />
          Kelola Meja
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => onNavigateToTab('orders')}
        >
          <Clock className="mr-2 h-4 w-4" />
          Lihat Pesanan
        </Button>
      </CardContent>
    </Card>
  )
}
