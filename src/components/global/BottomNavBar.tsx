import { useLocation, Link } from '../../lib/Router'
import { bottomNavItems } from '../../data/navigation'
import { useCart } from '../../context/CartContext'

const iconMap: Record<string, string> = {
  Inicio: 'home',
  Categorías: 'grid_view',
  Carrito: 'shopping_bag',
  Perfil: 'person',
}

export default function BottomNavBar() {
  const params = useLocation()
  const isHome = !params.has('id') && !params.has('category')
  const { openCart, totalItems } = useCart()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center px-2 py-2">
        {bottomNavItems.map((item) => {
          const active = isHome && item.label === 'Inicio'
          const isCart = item.label === 'Carrito'
          return isCart ? (
            <button
              key={item.label}
              onClick={openCart}
              className="flex flex-col items-center justify-center text-neutral-400 gap-0 bg-transparent border-none cursor-pointer"
            >
              <span
                className="material-symbols-outlined relative text-[20px]"
              >
                {iconMap[item.label]}
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] flex items-center justify-center bg-amber-700 text-white text-[8px] font-bold rounded-full px-0.5">
                    {totalItems}
                  </span>
                )}
              </span>
              <span className="text-[10px] leading-[14px] tracking-[0.08em] font-medium">
                {item.label}
              </span>
            </button>
          ) : (
            <Link
              key={item.label}
              to={item.href}
              className={
                active
                  ? 'flex flex-col items-center justify-center text-amber-800 gap-0 transition-all duration-150'
                  : 'flex flex-col items-center justify-center text-neutral-400 gap-0'
              }
            >
              <span
                className="material-symbols-outlined relative text-[20px]"
                style={
                  active
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {iconMap[item.label]}
              </span>
              <span className="text-[10px] leading-[14px] tracking-[0.08em] font-medium">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
