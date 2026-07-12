import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from '../../lib/Router'
import { useProducts } from '../../context/ProductContext'
import ProductCard from '../product/ProductCard'

const CATEGORIES = ['Bazar', 'Hogar', 'Electrónica']

function CarouselSection({ category }: { category: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isAtStart, setIsAtStart] = useState(true)
  const [isAtEnd, setIsAtEnd] = useState(false)
  const { displayProducts } = useProducts()

  const items = displayProducts
    .filter(p => p.category === category)
    .slice(0, 10)

  const updateEdgeState = useCallback(() => {
    const el = ref.current
    if (!el) return
    setIsAtStart(el.scrollLeft < 5)
    setIsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', updateEdgeState, { passive: true })
    updateEdgeState()
    return () => el.removeEventListener('scroll', updateEdgeState)
  }, [updateEdgeState])

  const scroll = (direction: 'left' | 'right') => {
    const el = ref.current
    if (!el) return

    const firstChild = el.firstElementChild?.firstElementChild as HTMLElement
    const scrollAmount = firstChild ? firstChild.clientWidth + 20 : el.clientWidth * 0.75

    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  if (items.length === 0) return null

  return (
    <div className="mb-4 lg:mb-20 last:mb-0">
      <div className="flex justify-between items-end mb-2 lg:mb-6">
        <Link to={`?category=${category}`} className="group">
          <h3 className="text-[18px] lg:text-[30px] font-serif text-neutral-900 tracking-tight group-hover:text-amber-800 transition-colors">
            <span className="italic font-normal text-amber-800">{category}</span>
          </h3>
        </Link>

        {/* Controles del Carrusel */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={isAtStart}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${isAtStart
              ? 'opacity-20 border-neutral-300 cursor-not-allowed text-neutral-400 bg-neutral-50'
              : 'border-neutral-300 text-neutral-700 hover:border-amber-800 hover:text-amber-800 active:scale-90 bg-white shadow-sm'
              }`}
            aria-label={`Anterior lote de ${category}`}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={isAtEnd}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${isAtEnd
              ? 'opacity-20 border-neutral-300 cursor-not-allowed text-neutral-400 bg-neutral-50'
              : 'border-neutral-300 text-neutral-700 hover:border-amber-800 hover:text-amber-800 active:scale-90 bg-white shadow-sm'
              }`}
            aria-label={`Siguiente lote de ${category}`}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="overflow-x-auto scrollbar-none scroll-smooth pb-4"
        >
          <div className="flex gap-5">
            {items.map((product) => (
              <div
                key={product.id}
                className="w-[48vw] sm:w-[calc(50vw-2.5rem)] lg:w-[270px] flex-shrink-0"
              >
                <ProductCard product={product} className="h-full min-w-0" />
              </div>
            ))}
          </div>
        </div>

        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#FAF7F2] to-transparent transition-opacity duration-500 max-md:hidden ${isAtStart ? 'opacity-0' : 'opacity-100'}`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#FAF7F2] to-transparent transition-opacity duration-500 max-md:hidden ${isAtEnd ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>
    </div>
  )
}

export default function CategoryCarousel() {
  return (
    <section className="pt-6 pb-0 lg:py-20 bg-[#FAF7F2]" id="products">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">

        {/* Encabezado General */}
        <div className="mb-3 lg:mb-16">
          <span className="text-amber-800 text-[10px] lg:text-[11px] leading-[18px] tracking-[0.25em] font-bold uppercase block mb-1 lg:mb-2">
            Catálogo Curado
          </span>
          <h2 className="text-[22px] lg:text-[44px] font-serif leading-tight text-neutral-950 tracking-tight">
            Conoce nuestros <span className="italic font-normal text-amber-800">productos.</span>
          </h2>
        </div>

        {/* Listado */}
        {CATEGORIES.map((cat) => (
          <CarouselSection key={cat} category={cat} />
        ))}
      </div>
    </section>
  )
}