import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthUtils } from '@/hooks/useAuth';
import { LogOut, ShoppingCart, DollarSign, Users, TrendingUp, List, History, Receipt } from 'lucide-react';
import OrderList from '@/components/kasir/OrderList';
import OrderDetail from '@/components/kasir/OrderDetail';
import PaymentHistory from '@/components/kasir/PaymentHistory';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchKasirOrders, fetchPaymentHistory } from '@/store/kasirSlice';
import { formatCurrency } from '@/utils/kasirHelpers';
import type { KasirOrder } from '@/types/kasir';

export default function KasirDashboard() {
  const { getDisplayName, getRoleDisplay, logout } = useAuthUtils();
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
    await logout();
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Hari ini</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.todayRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Dari {stats.paidOrders} transaksi</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Dibayar</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalOrders > 0 ? Math.round((stats.paidOrders / stats.totalOrders) * 100) : 0}% dari total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueCustomers}</div>
              <p className="text-xs text-muted-foreground">Unik hari ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-200">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Pesanan
            </TabsTrigger>
            <TabsTrigger value="detail" className="flex items-center gap-2" disabled={!selectedOrder}>
              <Receipt className="h-4 w-4" />
              Detail
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Riwayat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Daftar Pesanan</h2>
              <p className="text-muted-foreground">Pesanan yang siap untuk dibayar</p>
            </div>
            <OrderList onSelectOrder={handleSelectOrder} />
          </TabsContent>

          <TabsContent value="detail" className="space-y-6">
            {selectedOrder ? (
              <OrderDetail order={selectedOrder} onBack={handleBackToOrders} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Pilih pesanan untuk melihat detail</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Riwayat Pembayaran</h2>
              <p className="text-muted-foreground">Semua transaksi yang telah selesai</p>
            </div>
            <PaymentHistory onViewDetail={handleViewHistoryDetail} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
