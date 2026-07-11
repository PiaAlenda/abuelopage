import { useState, useEffect, useRef, useCallback, type MouseEvent } from 'react'
import { useLocation, Link } from '../lib/Router'
import { useProducts } from '../context/ProductContext'
import { useAuth } from '../context/AuthContext'
import Header from '../components/global/Header'
import BottomNavBar from '../components/global/BottomNavBar'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

const relatedProducts = (product: Product, all: Product[], count = 10): Product[] =>
  all
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, count)

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/542644123833"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-amber-900 text-white py-3 px-6 rounded-full hover:bg-amber-950 transition-all transform active:scale-[0.98] group text-sm"
    >
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
      <span className="font-semibold tracking-wide">Consultar por WhatsApp</span>
    </a>
  )
}

export default function ProductDetailPage() {
  const params = useLocation()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState<string>('')
  const { addItem, removeItem, isInCart, openCart } = useCart()
  const { isAdmin } = useAuth()
  const { allProducts, displayProducts, updateProduct } = useProducts()
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 })
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const touchStartX = useRef(0)

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoom({ show: true, x, y, bgX: (e.clientX - rect.left) / rect.width, bgY: (e.clientY - rect.top) / rect.height })
  }, [])

  const handleMouseLeave = useCallback(() => setZoom((z) => ({ ...z, show: false })), [])

  const relatedRef = useRef<HTMLDivElement>(null)
  const [relatedAtStart, setRelatedAtStart] = useState(true)
  const [relatedAtEnd, setRelatedAtEnd] = useState(false)

  const updateRelatedEdge = useCallback(() => {
    const el = relatedRef.current
    if (!el) return
    setRelatedAtStart(el.scrollLeft < 5)
    setRelatedAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5)
  }, [])

  const scrollRelated = (direction: 'left' | 'right') => {
    const el = relatedRef.current
    if (!el) return
    const firstChild = el.firstElementChild?.firstElementChild as HTMLElement
    const scrollAmount = firstChild ? firstChild.clientWidth + 20 : el.clientWidth * 0.75
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((i) => i !== null ? Math.min(i + 1, galleryImages.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex])

  useEffect(() => {
    const id = params.get('id')
    if (!id) return
    const found = allProducts.find((p) => p.id === Number(id))
    if (found) {
      setProduct(found)
      setActiveImage(found.image)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [params, allProducts])

  useEffect(() => {
    const el = relatedRef.current
    if (!el) return
    el.addEventListener('scroll', updateRelatedEdge, { passive: true })
    updateRelatedEdge()
    return () => el.removeEventListener('scroll', updateRelatedEdge)
  }, [updateRelatedEdge, product])

  const handleSave = async () => {
    if (!product) return
    setSaving(true)
    const err = await updateProduct(product.id, {
      name: editName,
      alt: editDesc,
      price: editPrice === '' ? null : Number(editPrice),
    })
    setSaving(false)
    if (err) alert('Error: ' + err)
    else setShowEditModal(false)
  }

  const openModal = () => {
    if (!product) return
    setEditName(product.name)
    setEditDesc(product.alt)
    setEditPrice(product.price?.toString() ?? '')
    setShowEditModal(true)
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="pt-[var(--header-height)] pb-0 md:pb-0 min-h-screen flex items-center justify-center">
          <p className="text-neutral-500 text-lg">Producto no encontrado</p>
        </main>
        <BottomNavBar />
      </>
    )
  }

  const isSold = product.sold === true
  const isConsultar = !isSold && product.price == null

  const related = relatedProducts(product, displayProducts)
  const galleryImages: string[] = product.images ?? [product.image]

  return (
    <>
      <Header />
      <main className="pt-[var(--header-height)] bg-[#FBF9F6] animate-fade-in">

        <section className="max-w-[1280px] mx-auto px-6 max-lg:max-w-3xl lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start py-10">

          <button onClick={() => window.history.back()} className="lg:col-span-12 flex items-center gap-1 text-xs text-neutral-500 hover:text-amber-800 transition-colors -mb-4 order-1 max-lg:hidden">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Volver atrás
          </button>

          <div className="max-lg:hidden lg:col-span-5 lg:col-start-8 lg:row-start-2 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-2">
              <nav className="flex items-center gap-2 text-neutral-500 text-xs tracking-wide">
                <Link className="hover:text-amber-800 transition-colors" to="./">Inicio</Link>
                <span>/</span>
                <Link className="hover:text-amber-800 transition-colors" to={`?category=${product.category}`}>{product.category}</Link>
                <span>/</span>
                <span className="text-neutral-800">{product.name.split(' ').slice(0, 2).join(' ')}</span>
              </nav>
              <div className="flex items-start gap-3">
                <h1 className="text-[24px] md:text-[32px] font-serif text-amber-950 tracking-tight leading-tight flex-1">
                  {product.name}
                </h1>
                {isAdmin && (
                  <button
                    onClick={openModal}
                    className="mt-1 shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-300 text-neutral-600 shadow-sm hover:bg-amber-800 hover:text-white hover:border-amber-800 transition-all active:scale-90"
                    aria-label="Editar producto"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                )}
              </div>
            </div>
            {isSold && (
              <span className="inline-block bg-red-700 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                Vendido
              </span>
            )}
            {isConsultar && (
              <span className="inline-block bg-amber-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                Consultar
              </span>
            )}
            <p className="text-[14px] leading-relaxed text-neutral-600">
              {product.alt}
            </p>
            <p className="text-2xl font-serif font-semibold text-amber-800">
              {product.price != null ? `${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : ''}
            </p>
            <div className="grid grid-cols-2 gap-6 py-4 border-t border-b border-neutral-200">
              <div>
                <h3 className="text-[10px] tracking-[0.15em] font-bold uppercase text-neutral-400 mb-1">Materiales</h3>
                <p className="text-xs text-neutral-700">Materiales seleccionados para durabilidad y estilo.</p>
              </div>
              <div>
                <h3 className="text-[10px] tracking-[0.15em] font-bold uppercase text-neutral-400 mb-1">Condición</h3>
                <p className="text-xs text-neutral-700">Excelente estado. Pieza única.</p>
              </div>
            </div>
            <div className="space-y-3">
              {!isAdmin && !isSold && !isConsultar && (isInCart(product.id) ? (
                <button
                  key="remove-btn"
                  onClick={() => removeItem(product.id)}
                  className="animate-soft-reveal flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 border-2 border-red-300 py-3 px-6 rounded-full hover:bg-red-100 hover:border-red-400 transition-all active:scale-[0.98] group text-sm font-semibold"
                >
                  <span key="remove-icon" className="material-symbols-outlined text-[20px]">close</span>
                  <span key="remove-txt" className="animate-slide-up">Eliminar del carrito</span>
                </button>
              ) : (
                <button
                  key="add-btn"
                  onClick={() => { addItem(product); openCart() }}
                  className="animate-soft-reveal flex items-center justify-center gap-2 w-full bg-white text-amber-900 border-2 border-amber-900 py-3 px-6 rounded-full hover:bg-amber-900 hover:text-white transition-all active:scale-[0.98] group text-sm font-semibold"
                >
                  <span key="add-icon" className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                  <span key="add-txt" className="animate-slide-up">Añadir al carrito</span>
                </button>
              ))}
              <WhatsAppButton />
            </div>
          </div>

          <div className="lg:hidden space-y-2 order-2">
            <nav className="flex items-center gap-2 text-neutral-500 text-xs tracking-wide">
              <Link className="hover:text-amber-800 transition-colors" to="./">Inicio</Link>
              <span>/</span>
              <Link className="hover:text-amber-800 transition-colors" to={`?category=${product.category}`}>{product.category}</Link>
              <span>/</span>
              <span className="text-neutral-800">{product.name.split(' ').slice(0, 2).join(' ')}</span>
            </nav>
            <div className="flex items-start gap-3">
              <h1 className="text-[24px] md:text-[32px] font-serif text-amber-950 tracking-tight leading-tight flex-1">
                {product.name}
              </h1>
              {isAdmin && (
                <button
                  onClick={openModal}
                  className="mt-1 shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-300 text-neutral-600 shadow-sm hover:bg-amber-800 hover:text-white hover:border-amber-800 transition-all active:scale-90"
                  aria-label="Editar producto"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              )}
            </div>
          </div>

          <p className="lg:hidden text-[14px] leading-relaxed text-neutral-600 order-3">
            {product.alt}
          </p>

          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2 flex flex-col gap-4 order-4">
            <div className="relative flex gap-4">
              <div className="hidden lg:flex flex-col gap-2 shrink-0">
                {galleryImages.map((imgUrl: string, index: number) => {
                  const isActive = activeImage === imgUrl
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveImage(imgUrl)}
                      onMouseEnter={() => setActiveImage(imgUrl)}
                      className={`relative w-16 h-16 flex-shrink-0 aspect-square bg-white rounded-xl overflow-hidden border transition-all ${isActive
                        ? 'border-amber-900 ring-2 ring-amber-800/20 opacity-100 shadow-sm'
                        : 'border-neutral-200 opacity-70 hover:opacity-100'
                        }`}
                      aria-label={`Ver imagen de detalle ${index + 1}`}
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={imgUrl}
                        alt={`${product.alt} miniatura ${index + 1}`}
                      />
                    </button>
                  )
                })}
              </div>
              <div
                ref={imageContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => setLightboxIndex(galleryImages.indexOf(activeImage))}
                className="relative w-full aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm cursor-crosshair"
              >
                <img
                  className="w-full h-full object-contain select-none"
                  src={activeImage || product.image}
                  alt={product.alt}
                />
                {zoom.show && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `calc(${zoom.x}% - 70px)`,
                      top: `calc(${zoom.y}% - 70px)`,
                      width: '140px',
                      height: '140px',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                    }}
                  />
                )}
              </div>
              {zoom.show && (
                <div className="hidden lg:block absolute left-[calc(100%+16px)] top-0 w-[400px] h-[400px] bg-white overflow-hidden z-20">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url('${activeImage || product.image}')`,
                      backgroundSize: '250%',
                      backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                </div>
              )}
            </div>
            <div className="lg:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((imgUrl: string, index: number) => {
                const isActive = activeImage === imgUrl
                return (
                  <button
                    key={index}
                    onClick={() => setActiveImage(imgUrl)}
                    onMouseEnter={() => setActiveImage(imgUrl)}
                    className={`relative w-24 h-24 flex-shrink-0 aspect-square bg-white rounded-xl overflow-hidden border transition-all ${isActive
                      ? 'border-amber-900 ring-2 ring-amber-800/20 opacity-100 shadow-sm'
                      : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    aria-label={`Ver imagen de detalle ${index + 1}`}
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={imgUrl}
                      alt={`${product.alt} miniatura ${index + 1}`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="lg:hidden space-y-3 order-5">
            {isSold && (
              <span className="inline-block bg-red-700 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                Vendido
              </span>
            )}
            <p className="text-2xl font-serif font-semibold text-amber-800">
              {product.price != null ? `${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : !isSold ? 'Consultar' : ''}
            </p>
            <div className="grid grid-cols-2 gap-6 py-4 border-t border-b border-neutral-200">
              <div>
                <h3 className="text-[10px] tracking-[0.15em] font-bold uppercase text-neutral-400 mb-1">Materiales</h3>
                <p className="text-xs text-neutral-700">Materiales seleccionados para durabilidad y estilo.</p>
              </div>
              <div>
                <h3 className="text-[10px] tracking-[0.15em] font-bold uppercase text-neutral-400 mb-1">Condición</h3>
                <p className="text-xs text-neutral-700">Excelente estado. Pieza única.</p>
              </div>
            </div>
            {!isAdmin && !isSold && !isConsultar && (isInCart(product.id) ? (
              <button
                key="remove-btn-mob"
                onClick={() => removeItem(product.id)}
                className="animate-soft-reveal flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 border-2 border-red-300 py-3 px-6 rounded-full hover:bg-red-100 hover:border-red-400 transition-all active:scale-[0.98] group text-sm font-semibold"
              >
                <span key="remove-icon-mob" className="material-symbols-outlined text-[20px]">close</span>
                <span key="remove-txt-mob" className="animate-slide-up">Eliminar del carrito</span>
              </button>
            ) : (
              <button
                key="add-btn-mob"
                onClick={() => { addItem(product); openCart() }}
                className="animate-soft-reveal flex items-center justify-center gap-2 w-full bg-white text-amber-900 border-2 border-amber-900 py-3 px-6 rounded-full hover:bg-amber-900 hover:text-white transition-all active:scale-[0.98] group text-sm font-semibold"
              >
                <span key="add-icon-mob" className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                <span key="add-txt-mob" className="animate-slide-up">Añadir al carrito</span>
              </button>
            ))}
            <WhatsAppButton />
          </div>
        </section>

        {related.length > 0 && (
          <section className="max-w-[1280px] mx-auto px-6 md:px-10 mt-6 md:mt-16 pb-0 md:pb-20">
            <div className="flex justify-between items-end mb-3 md:mb-6">
              <h2 className="text-[22px] md:text-[26px] font-serif text-neutral-900 tracking-tight">
                Productos relacionados
              </h2>
              <Link className="text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 transition-colors max-lg:hidden" to={`?category=${product.category}`}>
                Ver colección completa →
              </Link>
            </div>
            <div className="relative">
              <div ref={relatedRef} className="overflow-x-auto scrollbar-none scroll-smooth pb-4 touch-pan-x">
                <div className="flex gap-5">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      to={`?id=${item.id}`}
                      className="w-[48vw] sm:w-[calc(50vw-2.5rem)] lg:w-[270px] flex-shrink-0 group"
                    >
                      <div className="bg-white p-2 rounded-2xl border border-neutral-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="aspect-square bg-[#FAF7F2] rounded-xl overflow-hidden mb-3 relative">
                          {item.sold === true && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <span className="bg-red-700 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                                Vendido
                              </span>
                            </div>
                          )}
                          <img
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${item.sold ? 'opacity-60' : ''}`}
                            src={item.image}
                            alt={item.alt}
                            loading="lazy"
                          />
                        </div>
                        <div className="px-1 pb-1">
                          <h3 className="font-sans font-medium text-neutral-800 text-[15px] line-clamp-1 group-hover:text-amber-900 transition-colors">{item.name}</h3>
                          {item.price != null ? <p className="text-amber-800 font-serif font-semibold text-sm mt-0.5">${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p> : !item.sold ? <p className="text-amber-600 font-sans font-semibold text-sm mt-0.5">Consultar</p> : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <Link className="text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 transition-colors lg:hidden block mt-1" to={`?category=${product.category}`}>
                Ver colección completa →
              </Link>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#FBF9F6] to-transparent max-lg:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#FBF9F6] to-transparent max-lg:hidden" />
              <button
                onClick={() => scrollRelated('left')}
                disabled={relatedAtStart}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full items-center justify-center border border-neutral-300 text-neutral-700 hover:border-amber-800 hover:text-amber-800 active:scale-90 bg-white shadow-md transition-all z-10 disabled:opacity-0 disabled:pointer-events-none"
                aria-label="Anteriores"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={() => scrollRelated('right')}
                disabled={relatedAtEnd}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full items-center justify-center border border-neutral-300 text-neutral-700 hover:border-amber-800 hover:text-amber-800 active:scale-90 bg-white shadow-md transition-all z-10 disabled:opacity-0 disabled:pointer-events-none"
                aria-label="Siguientes"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </section>
        )}

      </main>
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            const diff = e.changedTouches[0].clientX - touchStartX.current
            if (Math.abs(diff) > 50) {
              if (diff > 0 && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1)
              else if (diff < 0 && lightboxIndex < galleryImages.length - 1) setLightboxIndex(lightboxIndex + 1)
            }
          }}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
          {galleryImages.length > 1 && lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
              className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
            >
              <span className="material-symbols-outlined text-[48px]">chevron_left</span>
            </button>
          )}
          {galleryImages.length > 1 && lightboxIndex < galleryImages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
              className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
            >
              <span className="material-symbols-outlined text-[48px]">chevron_right</span>
            </button>
          )}
          <img
            className="max-w-[90vw] max-h-[85vh] object-contain select-none"
            src={galleryImages[lightboxIndex]}
            alt={product.alt}
          />
          {galleryImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
              {galleryImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                  className={`w-2 h-2 rounded-full transition-all ${i === lightboxIndex ? 'bg-white scale-110' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showEditModal && product && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-soft-reveal">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold text-neutral-800">Editar producto</h3>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#FBF9F6] border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Descripción</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#FBF9F6] border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Precio</label>
                <input
                  type="number"
                  min={0}
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#FBF9F6] border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Estado</span>
                <button
                  onClick={async () => {
                    if (!product) return
                    setSaving(true)
                    const err = await updateProduct(product.id, { sold: !product.sold })
                    setSaving(false)
                    if (err) alert('Error: ' + err)
                    else setShowEditModal(false)
                  }}
                  disabled={saving}
                  className={`text-[11px] font-semibold uppercase tracking-wider px-4 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                    product.sold
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  {product.sold ? 'Activar' : 'Vendido'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 text-sm font-semibold bg-white text-neutral-500 py-2.5 rounded-lg border border-neutral-300 hover:border-neutral-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 text-sm font-semibold bg-amber-800 text-white py-2.5 rounded-lg hover:bg-amber-900 transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </>
  )
}
