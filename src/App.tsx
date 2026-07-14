import { useState } from 'react'
import { useLocation } from './lib/Router'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoryPage from './pages/CategoryPage'
import LoginPage from './pages/LoginPage'
import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import { useAuth } from './context/AuthContext'
import CartDrawer from './components/cart/CartDrawer'
import FloatingActionButton from './components/product/FloatingActionButton'
import CreateProductModal from './components/product/CreateProductModal'

export default function App() {
  const params = useLocation()
  const { isAdmin } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const content = () => {
    if (params.has('login')) {
      return (
        <CartProvider>
          <LoginPage />
        </CartProvider>
      )
    }
    if (params.has('id')) {
      return (
        <CartProvider>
          <CartDrawer />
          <div className="pb-16 md:pb-0"><ProductDetailPage /></div>
        </CartProvider>
      )
    }
    if (params.has('category')) {
      return (
        <CartProvider>
          <CartDrawer />
          <div className="pb-16 md:pb-0"><CategoryPage /></div>
        </CartProvider>
      )
    }
    return (
      <CartProvider>
        <CartDrawer />
        <div className="pb-16 md:pb-0"><HomePage /></div>
      </CartProvider>
    )
  }

  return (
    <ProductProvider>
      {content()}
      {isAdmin && (
        <>
          <FloatingActionButton onClick={() => setShowCreateModal(true)} />
          {showCreateModal && (
            <CreateProductModal
              onClose={() => setShowCreateModal(false)}
              onCreated={() => setShowCreateModal(false)}
            />
          )}
        </>
      )}
    </ProductProvider>
  )
}
