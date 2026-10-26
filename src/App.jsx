import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Footer from './components/Footer'
import Header from './components/Header'
import AdminPage from './pages/AdminPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import OrdersPage from './pages/OrdersPage'
import ProductPage from './pages/ProductPage'
import ProductsPage from './pages/ProductsPage'
import RegisterPage from './pages/RegisterPage'
import SuccessPage from './pages/SuccessPage'

function ProtectedRoute({ admin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <main className="mx-auto min-h-72 max-w-7xl p-8 text-center">Checking your account…</main>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}

function StorefrontRoute() {
  const { user, loading } = useAuth()

  if (loading) return <main className="mx-auto min-h-72 max-w-7xl p-8 text-center">Checking your account…</main>
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return <Outlet />
}

function StoreLayout() {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<StorefrontRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/success/:id" element={<SuccessPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute admin />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <StoreLayout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
