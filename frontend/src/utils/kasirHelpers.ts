import type { PaymentFormData } from '@/types/kasir';

export const validatePaymentForm = (formData: PaymentFormData, totalAmount: number): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Payment method validation
  if (!formData.payment_method) {
    errors.payment_method = 'Metode pembayaran harus dipilih';
  }

  // Payment amount validation
  if (!formData.payment_amount || formData.payment_amount.trim() === '') {
    errors.payment_amount = 'Jumlah pembayaran harus diisi';
  } else {
    const amount = parseFloat(formData.payment_amount);
    if (isNaN(amount)) {
      errors.payment_amount = 'Jumlah pembayaran harus berupa angka';
    } else if (amount <= 0) {
      errors.payment_amount = 'Jumlah pembayaran harus lebih dari 0';
    } else if (amount < totalAmount) {
      errors.payment_amount = `Jumlah pembayaran kurang dari total (${formatCurrency(totalAmount)})`;
    }
  }

  // Customer name validation (optional but if filled, should be valid)
  if (formData.customer_name && formData.customer_name.trim().length < 2) {
    errors.customer_name = 'Nama pelanggan minimal 2 karakter';
  }

  return errors;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
};

export const calculatePaymentDetails = (subtotal: number) => {
  const tax = subtotal * 0.1; // 10% tax
  const service = subtotal * 0.05; // 5% service
  const total = subtotal + tax + service;

  return {
    subtotal,
    tax,
    service,
    total,
    tax_rate: 10,
    service_rate: 5,
  };
};

export const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'tunai':
      return 'Tunai';
    case 'transfer':
      return 'Transfer Bank';
    case 'e-wallet':
      return 'E-Wallet';
    default:
      return method;
  }
};

export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'menunggu':
      return 'bg-yellow-100 text-yellow-800';
    case 'diproses':
      return 'bg-blue-100 text-blue-800';
    case 'selesai':
      return 'bg-green-100 text-green-800';
    case 'dibayar':
      return 'bg-purple-100 text-purple-800';
    case 'dibatalkan':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getOrderStatusLabel = (status: string): string => {
  switch (status) {
    case 'menunggu':
      return 'Menunggu';
    case 'diproses':
      return 'Diproses';
    case 'selesai':
      return 'Selesai';
    case 'dibayar':
      return 'Dibayar';
    case 'dibatalkan':
      return 'Dibatalkan';
    default:
      return status;
  }
};

export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (status === 401) {
      return 'Sesi telah berakhir. Silakan login kembali.';
    }
    
    if (status === 403) {
      return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
    }
    
    if (status === 404) {
      return 'Data tidak ditemukan.';
    }
    
    if (status === 422) {
      // Validation errors
      if (data.errors) {
        const firstError = Object.values(data.errors)[0] as string[];
        return firstError?.[0] || 'Data yang dimasukkan tidak valid.';
      }
      return data.message || 'Data yang dimasukkan tidak valid.';
    }
    
    if (status >= 500) {
      return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
    }
    
    return data.message || 'Terjadi kesalahan. Silakan coba lagi.';
  } else if (error.request) {
    // Network error
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  } else {
    // Other error
    return error.message || 'Terjadi kesalahan yang tidak diketahui.';
  }
};

export const downloadReceipt = async (orderId: number): Promise<void> => {
  try {
    const response = await fetch(`/api/kasir/orders/${orderId}/receipt/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mengunduh struk');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Struk_Pesanan_${orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download receipt error:', error);
    throw error;
  }
};
