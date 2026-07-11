import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from '../../lib/Router'
import { navLinks } from '../../data/navigation'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const params = useLocation()
  const navigate = useNavigate()
  const currentCategory = params.get('category')
  const isHome = !params.has('id') && !currentCategory && !params.has('login')
  const { totalItems, openCart } = useCart()
  const { isAuthenticated, logout } = useAuth()
  const { displayProducts } = useProducts()

  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = normalize(query)
    return displayProducts.filter(p =>
      normalize(p.name).startsWith(q)
    ).slice(0, 10)
  }, [query])

  const handleSelect = useCallback(() => {
    setQuery('')
    setShowResults(false)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const isOverThreshold = window.scrollY > 12
      if (isOverThreshold !== scrolled) {
        setScrolled(isOverThreshold)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md transition-all duration-300 h-16 ${scrolled
        ? 'shadow-sm border-b border-amber-900/10'
        : 'border-b border-transparent'
        }`}
    >
      <div className="max-w-[1280px] mx-auto w-full h-full px-6 md:px-10 flex items-center justify-center md:justify-between">

        <nav className="hidden md:flex items-center gap-6 h-full" aria-label="Navegación del garage">
          {navLinks.map((link) => {
            const active = isHome && link.label === 'Inicio' || link.label === currentCategory
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`relative flex items-center h-full text-[13.5px] font-medium tracking-wider uppercase transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2 px-1 ${active
                  ? 'text-amber-900 font-bold'
                  : 'text-neutral-600 hover:text-amber-900'
                  }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-800 rounded-t-full animate-fade-in" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 md:ml-auto">

          <div ref={searchRef} className="relative flex-1 md:flex-1 lg:flex-none">
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 100) }}
              className="hidden md:block lg:hidden flex items-center justify-center p-2 text-neutral-500 hover:text-amber-900 transition-colors"
              aria-label="Buscar productos"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            <div className={`${searchOpen ? 'fixed inset-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md flex items-start justify-center pt-4 px-4' : 'max-md:block lg:block hidden'}`}>
              <button
                onClick={() => setSearchOpen(false)}
                className="lg:hidden absolute top-4 right-4 text-neutral-500 hover:text-amber-900 transition-colors"
                aria-label="Cerrar búsqueda"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
              <div className="relative w-full max-w-md md:max-w-none md:w-auto">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  ref={inputRef}
                  className="bg-neutral-100 border border-neutral-300/80 rounded-full px-4 py-2 sm:py-1.5 pl-9 focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none w-full sm:w-60 md:w-full lg:w-96 xl:w-[400px] min-w-0 text-[14px] sm:text-[13px] lg:text-[14px] transition-all duration-300 text-neutral-800 placeholder-neutral-500"
                  placeholder="Buscar productos..."
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setShowResults(true) }}
                  onFocus={() => { if (query.trim()) setShowResults(true) }}
                />
              </div>
              {showResults && query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200/80 overflow-hidden z-50 max-h-[70vh] overflow-y-auto custom-scrollbar sm:min-w-[400px] lg:min-w-[480px]">
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-neutral-500">
                    No se encontraron resultados para "<span className="font-medium text-neutral-700">{query}</span>"
                  </div>
                ) : (
                  <ul className="py-2">
                    {filtered.map(p => (
                      <li key={p.id}>
                        <Link
                          to={`?id=${p.id}`}
                          onClick={handleSelect}
                          className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 lg:py-3 hover:bg-amber-50/60 transition-colors group"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden bg-[#FAF7F2] flex-shrink-0">
                            <img
                              className="w-full h-full object-cover"
                              src={p.image}
                              alt={p.alt}
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-[15px] lg:text-base font-medium text-neutral-800 truncate group-hover:text-amber-900 transition-colors">
                              {p.name}
                            </p>
                            <p className="text-[12px] sm:text-[13px] lg:text-[13px] text-neutral-500 truncate leading-snug">
                              {p.alt}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => { logout(); navigate('./') }}
              className="p-2 rounded-full hover:bg-neutral-200/60 text-neutral-600 hover:text-red-600 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-800 outline-none active:scale-95 flex-shrink-0"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-[22px]">logout</span>
            </button>
          ) : (
            <Link
              to="?login=true"
              className="p-2 rounded-full hover:bg-neutral-200/60 text-neutral-600 hover:text-amber-900 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-800 outline-none active:scale-95 flex-shrink-0"
              aria-label="Iniciar sesión"
            >
              <span className="material-symbols-outlined text-[22px]">person</span>
            </Link>
          )}

          <button
            className="relative p-2 rounded-full hover:bg-neutral-200/60 text-neutral-600 hover:text-amber-900 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-800 outline-none active:scale-95 flex-shrink-0 max-md:hidden"
            onClick={openCart}
            aria-label="Ver muebles seleccionados"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-amber-700 text-white text-[10px] font-bold rounded-full ring-2 ring-[#FAF7F2] px-1">
                {totalItems}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  )
}
