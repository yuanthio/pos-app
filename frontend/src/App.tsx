import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/sonner'
import LoginPage from '@/pages/Login'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import MakananManagement from '@/pages/admin/MakananManagement'
import KasirDashboard from '@/pages/kasir/KasirDashboard'
import PelayanDashboard from '@/pages/pelayan/PelayanDashboard'
import OrderDetail from '@/components/pelayan/orders/order_detail/OrderDetail'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/makanan" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MakananManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-4">Manajemen Pengguna</h1>
                      <p className="text-gray-600">Segera hadir...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/kasir" 
              element={
                <ProtectedRoute allowedRoles={['kasir', 'admin']}>
                  <KasirDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pelayan" 
              element={
                <ProtectedRoute allowedRoles={['pelayan', 'admin']}>
                  <PelayanDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pelayan/:tab" 
              element={
                <ProtectedRoute allowedRoles={['pelayan', 'admin']}>
                  <PelayanDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pelayan/orders/:id" 
              element={
                <ProtectedRoute allowedRoles={['pelayan', 'admin']}>
                  <OrderDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  )
}

export default App
