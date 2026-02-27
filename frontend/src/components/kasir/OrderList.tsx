import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, CheckCircle, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchKasirOrders } from '@/store/kasirSlice';
import type { KasirOrder } from '@/types/kasir';
import { formatCurrency, getOrderStatusColor, getOrderStatusLabel } from '@/utils/kasirHelpers';

interface OrderListProps {
  onSelectOrder: (order: KasirOrder) => void;
}

const ITEMS_PER_PAGE = 5;

const OrderList: React.FC<OrderListProps> = ({ onSelectOrder }) => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.kasir);
  
  // Local state for optimistic updates
  const [optimisticOrders, setOptimisticOrders] = useState<KasirOrder[]>([]);
  const [processingOrders, setProcessingOrders] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Use optimistic orders if available, otherwise use Redux state
  const displayOrders = optimisticOrders.length > 0 ? optimisticOrders : orders;

  // Pagination logic
  const totalPages = Math.ceil(displayOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = displayOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  useEffect(() => {
    dispatch(fetchKasirOrders());
  }, [dispatch]);

  const handleOptimisticPayment = (order: KasirOrder) => {
    // Add to processing set
    setProcessingOrders(prev => new Set(prev).add(order.id));
    
    // Optimistically update order status
    const updatedOrder = { ...order, status: 'dibayar' as const };
    setOptimisticOrders(prev => 
      prev.map(o => o.id === order.id ? updatedOrder : o)
    );
    
    // Call onSelectOrder with updated order
    onSelectOrder(updatedOrder);
    
    // Show success toast
    toast.success('Pesanan sedang diproses untuk pembayaran...', {
      duration: 2000,
      position: 'bottom-right',
    });
    
    // Remove from processing set after a delay
    setTimeout(() => {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(order.id);
        return newSet;
      });
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    return getOrderStatusColor(status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'diproses':
        return <Clock className="h-4 w-4" />;
      case 'selesai':
        return <CheckCircle className="h-4 w-4" />;
      case 'dibayar':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading && optimisticOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-muted-foreground">Memuat pesanan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && optimisticOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error: {error}</p>
            <Button onClick={() => dispatch(fetchKasirOrders())} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Tidak ada pesanan yang perlu diproses</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {currentItems.map((order: KasirOrder) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">Pesanan #{order.id}</h3>
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {getOrderStatusLabel(order.status)}
                    </div>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Pelanggan:</span> {order.nama_pelanggan || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Meja:</span> {order.meja?.nomor_meja || 'Take Away'}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> {formatCurrency(order.total_harga)}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">Pelayan:</span> {order.user?.name || '-'}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onSelectOrder(order)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Detail
                </Button>
                
                {order.status !== 'dibayar' && (
                  <Button
                    onClick={() => handleOptimisticPayment(order)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processingOrders.has(order.id)}
                  >
                    {processingOrders.has(order.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Memproses...
                      </>
                    ) : (
                      'Bayar'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, displayOrders.length)} dari {displayOrders.length} pesanan
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
