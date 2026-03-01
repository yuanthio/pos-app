import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Download, Calendar, DollarSign, Eye, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchPaymentHistory } from '@/store/kasirSlice';
import { useNavigate } from 'react-router-dom';
import type { Pesanan } from '@/types/pesanan';
import { formatCurrency, formatDate, downloadReceipt } from '@/utils/kasirHelpers';
import PaymentHistoryViewToggle from './PaymentHistoryViewToggle';
import PaymentHistoryListView from './PaymentHistoryListView';
import PaymentHistoryGridView from './PaymentHistoryGridView';
import PaymentHistoryPagination from './PaymentHistoryPagination';

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
      <PaymentHistoryViewToggle
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* List View */}
      {viewMode === 'list' && (
        <PaymentHistoryListView
          orders={currentItems}
          onViewDetail={handleViewDetail}
          onDownloadReceipt={handleDownloadReceipt}
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <PaymentHistoryGridView
          orders={currentItems}
          onViewDetail={handleViewDetail}
          onDownloadReceipt={handleDownloadReceipt}
        />
      )}
      
      {/* Pagination Controls */}
      <PaymentHistoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={paymentHistory.length}
        onPageChange={handlePageChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
};

export default PaymentHistory;
