import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation, Link } from '../lib/Router'
import { useProducts } from '../context/ProductContext'
import { useAuth } from '../context/AuthContext'
import { getUniqueTypes, getProductType } from '../utils/productTypes'
import Header from '../components/global/Header'
import BottomNavBar from '../components/global/BottomNavBar'
import ProductCard from '../components/product/ProductCard'
import EditProductModal from '../components/product/EditProductModal'
import ConfirmDialog from '../components/global/ConfirmDialog'
import type { Product } from '../types'

const CATEGORIES = ['Bazar', 'Hogar', 'Electrónica', 'Otro'] as const

export default function CategoryPage() {
  const params = useLocation()
  const { displayProducts, deleteProduct } = useProducts()
  const { isAdmin } = useAuth()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const selectedCategory = useMemo(() => {
    const cat = params.get('category')
    return cat && CATEGORIES.includes(cat as any) ? cat : null
  }, [params])

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const allItems = useMemo(
    () => selectedCategory ? displayProducts.filter(p => p.category === selectedCategory) : displayProducts.filter(p => p.category !== 'Otro'),
    [selectedCategory, displayProducts]
  )

  const availableTypes = useMemo(
    () => getUniqueTypes(allItems),
    [allItems]
  )

  const filteredByType = useMemo(
    () => selectedTypes.length === 0
      ? allItems
      : allItems.filter(p => selectedTypes.includes(getProductType(p.name))),
    [allItems, selectedTypes]
  )

  const items = useMemo(() => {
    const min = minPrice === '' ? 0 : Number(minPrice)
    const max = maxPrice === '' ? Infinity : Number(maxPrice)
    return filteredByType.filter(p => {
      if (p.price == null) return true
      return p.price >= min && p.price <= max
    })
  }, [filteredByType, minPrice, maxPrice])

  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [items])

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileFilterOpen])

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setMinPrice('')
    setMaxPrice('')
  }

  const filterContent = (
    <>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${selectedTypes.length > 0 || minPrice !== '' || maxPrice !== ''
        ? 'max-h-8 opacity-100'
        : 'max-h-0 opacity-0 pointer-events-none'
        }`}>
        <button
          onClick={clearFilters}
          className="text-[10px] uppercase tracking-wider font-medium text-neutral-300 hover:text-amber-700 transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
          Limpiar Filtros
        </button>
      </div>

      {availableTypes.length > 0 && (
        <div>
          <h3 className="font-serif text-neutral-900 text-[17px] font-medium tracking-tight mb-4">Tipo de Mueble</h3>
          <ul className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
            {availableTypes.map(type => (
              <li key={type}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="rounded-sm border-neutral-300 text-amber-800 focus:ring-amber-800"
                  />
                  <span className={`text-sm transition-colors ${selectedTypes.includes(type) ? 'text-amber-900 font-medium' : 'text-neutral-500 group-hover:text-neutral-800'}`}>
                    {type}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-serif text-neutral-900 text-[17px] font-medium tracking-tight mb-4">Precio</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Mín</label>
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              placeholder="$0"
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-amber-800 outline-none text-neutral-800"
            />
          </div>
          <span className="text-neutral-300 mt-5">—</span>
          <div className="flex-1">
            <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Máx</label>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="$999"
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-amber-800 outline-none text-neutral-800"
            />
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Header />

      {mobileFilterOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileFilterOpen(false)}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-[60] bg-[#FBF9F6] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${mobileFilterOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '70vh' }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-neutral-200/60 flex-shrink-0">
          <h2 className="font-serif text-lg text-neutral-900 font-medium">Filtros</h2>
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6 space-y-8 flex-1">
          {filterContent}
        </div>
        <div className="flex-shrink-0 border-t border-neutral-200/60 px-6 py-4 pb-8">
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="w-full py-3 rounded-full bg-amber-900 text-white font-medium text-sm uppercase tracking-wider hover:bg-amber-950 transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      <main className="pt-[var(--header-height)] bg-[#FBF9F6] min-h-screen animate-fade-in">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex gap-12 max-lg:max-w-3xl">
          <aside className="w-48 flex-shrink-0 hidden lg:block pt-10">
            <div className="sticky top-32 space-y-8">
              {filterContent}
            </div>
          </aside>

          <section ref={gridRef} className="flex-1 pt-10 pb-20">
            <div className="flex justify-between items-end mb-8 md:mb-12">
              <div>
                <nav className="flex items-center gap-2 text-xs tracking-wide mb-3 md:mb-4">
                  <Link className="text-amber-800 hover:text-amber-900 transition-colors font-medium" to="./">Inicio</Link>
                  <span className="text-neutral-300">/</span>
                  <span className="text-amber-800 font-medium">{selectedCategory}</span>
                </nav>
                <h1 className="text-[40px] md:text-[64px] font-serif text-neutral-900 tracking-tight leading-[1.1] mb-2">
                  {selectedCategory}
                </h1>
                <p className="text-neutral-500 text-[16px] leading-relaxed">
                  Mostrando {items.length} de {allItems.length} piezas
                  {selectedTypes.length > 0 && ` · ${selectedTypes.join(', ')}`}
                </p>
              </div>
            </div>

            <div className="flex lg:hidden items-center justify-between mb-6 -mx-6 px-6 py-4 border-y border-neutral-200/60 bg-[#FBF9F6]">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-amber-800"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Filtros
              </button>
              <span className="text-xs text-neutral-400">{items.length} productos</span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-neutral-500 text-lg">No hay productos que coincidan con los filtros seleccionados.</p>
                <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-amber-800 underline hover:no-underline">Limpiar filtros</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:hidden gap-x-4 gap-y-8">
                  {items.map(product => {
                    const type = getProductType(product.name)
                    const isSold = product.sold === true
                    return (
                      <div key={product.id} className={`relative flex flex-col gap-3 group ${isSold ? 'opacity-60 pointer-events-none' : ''}`}>
                        {isAdmin && (
                          <div className="absolute top-2 right-2 z-10 flex gap-1">
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingProduct(product) }}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 border border-neutral-300 text-neutral-600 shadow-sm hover:bg-amber-800 hover:text-white hover:border-amber-800 transition-all active:scale-90"
                              aria-label="Editar producto"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault(); e.stopPropagation()
                                setDeletingProduct(product)
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 border border-neutral-300 text-neutral-600 shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-90"
                              aria-label="Eliminar producto"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        )}
                        <Link
                          to={isSold ? '#' : `?id=${product.id}`}
                          onClick={isSold ? (e) => e.preventDefault() : undefined}
                          className="block"
                        >
                          <div className={`relative aspect-[3/4] bg-[#FAF7F2] rounded-2xl overflow-hidden border ${isSold ? 'border-neutral-300/50' : 'border-neutral-200/60'}`}>
                            <img
                              src={product.image || '/products/placeholder.svg'}
                              alt={product.alt}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              loading="lazy"
                              onError={e => { if (e.currentTarget.src !== '/products/placeholder.svg') e.currentTarget.src = '/products/placeholder.svg' }}
                            />
                            {isSold && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-red-700 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                                  Vendido
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col px-0.5 pt-3">
                            <span className="text-[10px] uppercase tracking-widest text-neutral-400 mb-0.5">{type}</span>
                            <h3 className="text-[15px] font-medium text-neutral-900 leading-snug line-clamp-1">{product.name}</h3>
                            {product.price != null && (
                              <p className="text-base font-semibold mt-0.5 text-amber-800">
                                ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </p>
                            )}
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
                <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                  {items.map(product => (
                    <ProductCard key={product.id} product={product} className="max-w-[270px] mx-auto" />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      <ConfirmDialog
        open={deletingProduct !== null}
        title="Eliminar producto"
        message={deletingProduct ? `¿Eliminar "${deletingProduct.name}" permanentemente? Esta acción no se puede deshacer.` : ''}
        onConfirm={async () => {
          if (!deletingProduct) return
          const err = await deleteProduct(deletingProduct.id)
          setDeletingProduct(null)
          if (err) alert('Error: ' + err)
        }}
        onCancel={() => setDeletingProduct(null)}
      />

      <BottomNavBar />
    </>
  )
}
