import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import BookDetailPage from './pages/BookDetailPage'
import AuthDrawer from './components/AuthDrawer'
import CartDrawer from './components/CartDrawer'
import AddProductPage from './pages/AddProductPage'
import ManageProductsPage from './pages/ManageProductsPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    // CartProvider ต้องอยู่ใน AuthProvider (ใน main.jsx) เพราะ CartContext ใช้ useAuth ภายใน
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <AuthDrawer />
        <CartDrawer />
        <div className="flex-1 pt-[80px]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
          />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
          />
          <Route path="/admin/add-product" element={
            <ProtectedRoute role="admin">
              <AddProductPage />
            </ProtectedRoute>
          }
          />
          <Route path="/admin/manage-products" element={
            <ProtectedRoute role="admin">
              <ManageProductsPage />
            </ProtectedRoute>
          }
          />
          <Route path="/admin/orders" element={
            <ProtectedRoute role="admin">
              <AdminOrdersPage />
            </ProtectedRoute>
          }
          />
        </Routes>
        </div>
        <Footer />
      </div>
    </CartProvider>
  )
}

export default App

