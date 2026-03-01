import type { KasirOrder } from '@/types/kasir';
import type { Pesanan } from '@/types/pesanan';
import type { DetailPesanan } from '@/types/pesanan';
import type { Meja } from '@/types/meja';

// Cache untuk menyimpan data yang sudah di-fetch
const dataCache = new Map<string, any>();

// Utility untuk cache key generation
const generateCacheKey = (endpoint: string, params?: Record<string, any>) => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${endpoint}${paramString}`;
};

// Cache management
export const cacheUtils = {
  // Get data from cache
  get: (key: string) => dataCache.get(key),
  
  // Set data to cache with TTL (5 minutes)
  set: (key: string, data: any) => {
    dataCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000 // 5 minutes
    });
  },
  
  // Check if cache is valid
  isValid: (key: string) => {
    const cached = dataCache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < cached.ttl;
  },
  
  // Clear cache
  clear: () => dataCache.clear(),
  
  // Clear specific cache
  clearKey: (key: string) => dataCache.delete(key)
};

// Memoization untuk order data processing
export const processOrderData = (() => {
  const cache = new Map<number, KasirOrder>();
  
  return (order: KasirOrder): KasirOrder => {
    if (cache.has(order.id)) {
      return cache.get(order.id)!;
    }
    
    // Process order data (normalisasi, dll)
    const processedOrder: KasirOrder = {
      ...order,
      // Ensure nested data exists
      user: order.user || { id: 0, name: 'Unknown', email: '' },
      meja: order.meja || {
        id: 0,
        nomor_meja: 'Take Away',
        status: 'tersedia',
        kapasitas: 0,
        catatan: '',
        created_at: '',
        updated_at: ''
      },
      detail_pesanans: order.detail_pesanans?.map(item => ({
        ...item,
        makanan: item.makanan || {
          id: item.makanan_id,
          nama: 'Unknown Item',
          deskripsi: '',
          harga: item.harga_satuan,
          kategori: 'makanan' as const,
          tersedia: true,
          stok: 0,
          created_at: '',
          updated_at: ''
        }
      })) || []
    };
    
    cache.set(order.id, processedOrder);
    return processedOrder;
  };
})();

// Batch processing untuk multiple orders
export const batchProcessOrders = (orders: KasirOrder[]): KasirOrder[] => {
  return orders.map(processOrderData);
};

// Optimasi untuk payment history
export const processPaymentHistory = (() => {
  const cache = new Map<number, Pesanan>();
  
  return (order: Pesanan): Pesanan => {
    if (cache.has(order.id)) {
      return cache.get(order.id)!;
    }
    
    // Process payment history data
    const processedOrder: Pesanan = {
      ...order,
      user: order.user || { id: 0, name: 'Unknown', email: '' },
      meja: order.meja || {
        id: 0,
        nomor_meja: 'Take Away',
        status: 'tersedia',
        kapasitas: 0,
        catatan: '',
        created_at: '',
        updated_at: ''
      }
    };
    
    cache.set(order.id, processedOrder);
    return processedOrder;
  };
})();

// Utility untuk lazy loading data
export const lazyLoadRelations = {
  // Load user data if not present
  loadUser: async (userId: number) => {
    const cacheKey = `user_${userId}`;
    
    if (cacheUtils.isValid(cacheKey)) {
      return cacheUtils.get(cacheKey);
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();
      cacheUtils.set(cacheKey, userData);
      return userData;
    } catch (error) {
      console.error('Failed to load user:', error);
      return { id: userId, name: 'Unknown', email: '' };
    }
  },
  
  // Load meja data if not present
  loadMeja: async (mejaId: number) => {
    const cacheKey = `meja_${mejaId}`;
    
    if (cacheUtils.isValid(cacheKey)) {
      return cacheUtils.get(cacheKey);
    }
    
    try {
      const response = await fetch(`/api/meja/${mejaId}`);
      const mejaData = await response.json();
      cacheUtils.set(cacheKey, mejaData);
      return mejaData;
    } catch (error) {
      console.error('Failed to load meja:', error);
      return { id: mejaId, nomor_meja: 'Take Away' };
    }
  },
  
  // Load makanan data if not present
  loadMakanan: async (makananId: number) => {
    const cacheKey = `makanan_${makananId}`;
    
    if (cacheUtils.isValid(cacheKey)) {
      return cacheUtils.get(cacheKey);
    }
    
    try {
      const response = await fetch(`/api/makanan/${makananId}`);
      const makananData = await response.json();
      cacheUtils.set(cacheKey, makananData);
      return makananData;
    } catch (error) {
      console.error('Failed to load makanan:', error);
      return {
        id: makananId,
        nama: 'Unknown Item',
        deskripsi: '',
        harga: 0,
        kategori: 'makanan' as const,
        tersedia: true,
        stok: 0,
        created_at: '',
        updated_at: ''
      };
    }
  }
};

// Debounce utility untuk API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility untuk frequent updates
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
