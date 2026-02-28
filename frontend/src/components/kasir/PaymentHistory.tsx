import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Download, Calendar, DollarSign, Eye, ChevronLeft, ChevronRight, Grid, List, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchPaymentHistory } from '@/store/kasirSlice';
import { useNavigate } from 'react-router-dom';
import type { Pesanan } from '@/types/pesanan';
import { formatCurrency, formatDate, downloadReceipt } from '@/utils/kasirHelpers';

interface PaymentHistoryProps {
  onViewDetail?: (order: Pesanan) => void;
}

const ITEMS_PER_PAGE = 5;

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ onViewDetail }) => {
  const dispatch = useAppDispatch();
  const { paymentHistory, loading, error } = useAppSelector((state) => state.kasir);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  // Pagination logic
  const totalPages = Math.ceil(paymentHistory.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = paymentHistory.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleViewDetail = (order: Pesanan) => {
    if (onViewDetail) {
      onViewDetail(order);
    } else {
      navigate(`/kasir/orders/${order.id}`);
    }
  };

  const handleDownloadReceipt = async (orderId: number) => {
    try {
      await downloadReceipt(orderId);
    } catch (error) {
      console.error('Download receipt failed:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-muted-foreground">Memuat riwayat pembayaran...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error: {error}</p>
            <Button onClick={() => dispatch(fetchPaymentHistory())} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentHistory.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada riwayat pembayaran</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Riwayat Pembayaran</h3>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
          >
            <List className="h-4 w-4" />
            List
          </Button>
          <Button
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
          >
            <Grid className="h-4 w-4" />
            Grid
          </Button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {currentItems.map((order: Pesanan) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">Pesanan #{order.id}</h3>
                  <Badge className="bg-purple-100 text-purple-800">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Dibayar
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
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Pelayan:</span> {order.user?.name || '-'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleViewDetail(order)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Detail
                </Button>
                
                <Button
                  onClick={() => handleDownloadReceipt(order.id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Struk
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((order: Pesanan) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Pesanan #{order.id}</h3>
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      <DollarSign className="h-3 w-3" />
                      Dibayar
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Pelanggan:</span> {order.nama_pelanggan || 'Guest'}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-green-600">
                        {formatCurrency(order.total_harga)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => handleViewDetail(order)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3" />
                      Detail
                    </Button>
                    
                    <Button
                      onClick={() => handleDownloadReceipt(order.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="h-3 w-3" />
                      Struk
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, paymentHistory.length)} dari {paymentHistory.length} data
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

export default PaymentHistory;
