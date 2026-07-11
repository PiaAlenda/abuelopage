import { useState, useEffect, useCallback } from 'react'
import { heroImages } from '../../data/hero'

const slides = heroImages.slice(0, 4)

export default function HeroSection() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  useEffect(() => {
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [next])

  return (
    <section className="relative w-full bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-[1280px] mx-auto w-full px-4 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start pt-0 pb-2 lg:pt-16 lg:pb-10">

        {/* COLUMNA IZQUIERDA: BADGE + TÍTULO + TEXTO + BOTONES */}
        <div className="lg:col-span-5 flex flex-col justify-center z-20 order-2 lg:order-1 select-none">

          {/* Badge — solo desktop */}
          <div className="hidden lg:inline-flex items-center gap-2 bg-amber-100/70 border border-amber-200/60 text-amber-950 px-3 py-1.5 rounded-lg w-fit mb-6 transition-all">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase font-sans">
              Venta de productos
            </span>
          </div>

          {/* Headline */}
          <h1 className="hidden lg:block text-[44px] md:text-[52px] font-serif leading-[1.12] text-[#1A1A1A] mb-5 tracking-tight">
            Todo para tu hogar. <br />
            <span className="italic font-normal text-amber-800">
              Encontrá lo que necesitas.
            </span>
          </h1>

          {/* Texto */}
          <p className="hidden lg:block text-[15px] leading-[1.65] text-neutral-600 max-w-[420px] mb-8 font-sans">
            Descubre muebles, decoración y artículos para el hogar cuidadosamente seleccionados, listos para darle una nueva vida a tus espacios.
            <span className="block mt-3 font-semibold text-amber-900/90 text-[13.5px] flex items-center gap-1.5">
              Solo contamos con una unidad disponible de cada pieza.
            </span>
          </p>

          {/* CTAs — siempre visibles */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <a
              href="#products"
              className="inline-flex items-center justify-center bg-amber-900 text-white px-7 py-3.5 rounded-full text-[12px] sm:text-[13px] font-bold tracking-wider uppercase transition-all duration-200 hover:bg-amber-950 hover:shadow-xl hover:shadow-amber-950/10 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-offset-2"
            >
              Productos Disponibles
            </a>
          </div>
        </div>

        {/* COLUMNA DERECHA: IMAGEN */}
        <div className="lg:col-span-7 relative w-full order-1 lg:order-2">
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl lg:rounded-[0px_0px_0px_80px] shadow-sm bg-[#E4E0EC]">

            {/* Slides */}
            {slides.map((img, index) => (
              <div
                key={img.id}
                className={`absolute inset-0 transition-all duration-1000 ease-out ${index === current
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-105 z-0'
                  }`}
                aria-hidden={index !== current}
              >
                <img
                  className="w-full h-full object-cover"
                  src={img.src}
                  alt={img.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}

            {/* Controles del slider */}
            <div className="absolute bottom-4 right-4 z-20 flex gap-2 bg-black/10 backdrop-blur-md px-3 py-2 rounded-full">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 outline-none focus-visible:ring-1 focus-visible:ring-white ${index === current
                    ? 'bg-white w-5'
                    : 'bg-white/40 hover:bg-white/70 w-1.5'
                    }`}
                  aria-label={`Ir al artículo ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}