import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Grid } from 'lucide-react';

interface OrderListViewToggleProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export default function OrderListViewToggle({ 
  viewMode, 
  onViewModeChange 
}: OrderListViewToggleProps) {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => onViewModeChange('list')}
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
        >
          <List className="h-4 w-4" />
          List
        </Button>
        <Button
          onClick={() => onViewModeChange('grid')}
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
        >
          <Grid className="h-4 w-4" />
          Grid
        </Button>
      </div>
    </div>
  );
}
