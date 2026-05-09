import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import BookDetailPage from './pages/BookDetailPage'
import AuthDrawer from './components/AuthDrawer'
import AddProductPage from './pages/AddProductPage'
import ManageProductsPage from './pages/ManageProductsPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AuthDrawer />
      <div className="flex-1 pt-[80px]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
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
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App

