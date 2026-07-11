import { useLocation } from './lib/Router'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoryPage from './pages/CategoryPage'
import LoginPage from './pages/LoginPage'
import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import CartDrawer from './components/cart/CartDrawer'

export default function App() {
  const params = useLocation()

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
    </ProductProvider>
  )
}
