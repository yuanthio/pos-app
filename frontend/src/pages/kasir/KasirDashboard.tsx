import { useState, useEffect } from 'react';
import KasirHeader from '@/components/kasir/KasirHeader';
import KasirStats from '@/components/kasir/KasirStats';
import KasirTabs from '@/components/kasir/KasirTabs';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchKasirOrders, fetchPaymentHistory } from '@/store/kasirSlice';
import type { KasirOrder } from '@/types/kasir';

export default function KasirDashboard() {
  const [selectedOrder, setSelectedOrder] = useState<KasirOrder | null>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const dispatch = useAppDispatch();
  const { orders, paymentHistory } = useAppSelector((state) => state.kasir);

  // Calculate dynamic stats
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today's orders (all orders created today)
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    // Today's paid orders (from paymentHistory)
    const todayPaidOrders = paymentHistory.filter(order => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    // Today's revenue (from paid orders)
    const todayRevenue = todayPaidOrders.reduce((total, order) => total + (order.total_harga || 0), 0);

    // Unique customers today (from both orders and payment history)
    const allTodayOrders = [...todayOrders, ...todayPaidOrders];
    const uniqueCustomers = new Set(
      allTodayOrders.map(order => order.nama_pelanggan || 'Guest')
    ).size;

    return {
      totalOrders: todayOrders.length,
      todayRevenue,
      paidOrders: todayPaidOrders.length,
      uniqueCustomers
    };
  };

  const stats = calculateStats();

  // Fetch data on component mount only
  useEffect(() => {
    // Initial fetch only if no data exists
    if (orders.length === 0) {
      dispatch(fetchKasirOrders());
    }
    if (paymentHistory.length === 0) {
      dispatch(fetchPaymentHistory());
    }
  }, [dispatch, orders.length, paymentHistory.length]);

  const handleLogout = async () => {
  // Simple logout - redirect to login
  window.location.href = '/login';
};

  const handleSelectOrder = (order: KasirOrder) => {
    setSelectedOrder(order);
    setActiveTab('detail');
  };

  const handleViewHistoryDetail = (order: KasirOrder) => {
    setSelectedOrder(order);
    setActiveTab('detail');
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setActiveTab('orders');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <KasirHeader onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <KasirStats
          totalOrders={stats.totalOrders}
          todayRevenue={stats.todayRevenue}
          paidOrders={stats.paidOrders}
          uniqueCustomers={stats.uniqueCustomers}
        />

        {/* Tabs */}
        <KasirTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedOrder={selectedOrder}
          onSelectOrder={handleSelectOrder}
          onViewHistoryDetail={handleViewHistoryDetail}
          onBackToOrders={handleBackToOrders}
        />
      </main>
    </div>
  );
}
