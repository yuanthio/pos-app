import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Utensils, Clock, Plus } from 'lucide-react'

interface QuickActionsProps {
  onNavigateToTab: (tab: 'tables' | 'orders') => void
}

export default function QuickActions({ onNavigateToTab }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks for waiter</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full justify-start" 
          variant="default"
          onClick={() => onNavigateToTab('tables')}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => onNavigateToTab('tables')}
        >
          <Utensils className="mr-2 h-4 w-4" />
          Manage Tables
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => onNavigateToTab('orders')}
        >
          <Clock className="mr-2 h-4 w-4" />
          View Orders
        </Button>
      </CardContent>
    </Card>
  )
}
