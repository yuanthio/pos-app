import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, History, Receipt } from 'lucide-react';
import { OrderList } from './orders';
import { OrderDetail } from './detail_order';
import { PaymentHistory } from './payment_history';
import type { KasirOrder } from '@/types/kasir';

interface KasirTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedOrder: KasirOrder | null;
  onSelectOrder: (order: KasirOrder) => void;
  onViewHistoryDetail: (order: KasirOrder) => void;
  onBackToOrders: () => void;
}

export default function KasirTabs({
  activeTab,
  onTabChange,
  selectedOrder,
  onSelectOrder,
  onViewHistoryDetail,
  onBackToOrders
}: KasirTabsProps) {
  // Prevent loading on tab change by using direct tab change
  const handleTabChange = (value: string) => {
    onTabChange(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 bg-gray-200">
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          Pesanan
        </TabsTrigger>
        <TabsTrigger value="detail" className="flex items-center gap-2">
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
          <p className="text-muted-foreground">Pesanan yang perlu diproses</p>
        </div>
        <OrderList onSelectOrder={onSelectOrder} />
      </TabsContent>

      <TabsContent value="detail" className="space-y-6">
        {selectedOrder ? (
          <OrderDetail order={selectedOrder} onBack={onBackToOrders} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Pilih pesanan untuk melihat detail</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Riwayat Pembayaran</h2>
          <p className="text-muted-foreground">Semua transaksi yang telah selesai</p>
        </div>
        <PaymentHistory onViewDetail={onViewHistoryDetail} />
      </TabsContent>
    </Tabs>
  );
}
