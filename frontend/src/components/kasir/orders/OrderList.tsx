import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Clock,
  CheckCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
  List,
  Grid,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchKasirOrders } from "@/store/kasirSlice";
import type { KasirOrder } from "@/types/kasir";
import {
  formatCurrency,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/utils/kasirHelpers";
import OrderListViewToggle from "./OrderListViewToggle";
import OrderListView from "./OrderListView";
import OrderGridView from "./OrderGridView";
import OrderListPagination from "./OrderListPagination";

interface OrderListProps {
  onSelectOrder: (order: KasirOrder) => void;
}

const ITEMS_PER_PAGE = 5;

const OrderList: React.FC<OrderListProps> = ({ onSelectOrder }) => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.kasir);

  // Local state for optimistic updates
  const [optimisticOrders, setOptimisticOrders] = useState<KasirOrder[]>([]);
  const [processingOrders, setProcessingOrders] = useState<Set<number>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  useEffect(() => {
    dispatch(fetchKasirOrders());
  }, [dispatch]);

  const handleOptimisticPayment = (order: KasirOrder) => {
    // Add to processing set
    setProcessingOrders((prev) => new Set(prev).add(order.id));

    // Optimistically update order status
    const updatedOrder = { ...order, status: "dibayar" as const };
    setOptimisticOrders((prev) =>
      prev.map((o) => (o.id === order.id ? updatedOrder : o)),
    );

    // Call onSelectOrder with updated order
    onSelectOrder(updatedOrder);

    // Show success toast
    toast.success("Pesanan sedang diproses untuk pembayaran...", {
      duration: 2000,
      position: "bottom-right",
    });

    // Remove from processing set after a delay
    setTimeout(() => {
      setProcessingOrders((prev) => {
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
      case "diproses":
        return <Clock className="h-4 w-4" />;
      case "selesai":
        return <CheckCircle className="h-4 w-4" />;
      case "dibayar":
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
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
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
            <Button
              onClick={() => dispatch(fetchKasirOrders())}
              variant="outline"
            >
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
            <p className="text-muted-foreground">
              Tidak ada pesanan yang perlu diproses
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <OrderListViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* List View */}
      {viewMode === "list" && (
        <OrderListView
          orders={currentItems}
          onSelectOrder={onSelectOrder}
          onOptimisticPayment={handleOptimisticPayment}
          processingOrders={processingOrders}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <OrderGridView
          orders={currentItems}
          onSelectOrder={onSelectOrder}
          onOptimisticPayment={handleOptimisticPayment}
          processingOrders={processingOrders}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      )}

      {/* Pagination Controls */}
      <OrderListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={displayOrders.length}
        onPageChange={handlePageChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
};

export default OrderList;
