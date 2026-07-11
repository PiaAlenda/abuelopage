import { Link } from '../../lib/Router'
import { categories } from '../../data/categories'

const featuredCategories = categories.slice(0, 4)

export default function FeaturedCategories() {
  return (
    <section className="py-8 lg:py-14 bg-[#FAF7F2]" id="categories">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">

        <div className="mb-4 lg:mb-8">
          <span className="text-amber-800 text-[10px] lg:text-[11px] leading-[18px] tracking-[0.25em] font-bold uppercase block mb-1">
            Lotes Disponibles
          </span>
          <h2 className="text-[20px] lg:text-[32px] font-serif leading-tight text-[#1A1A1A] tracking-tight">
            Explora nuestras <span className="italic font-normal text-amber-800">categorías.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`?category=${cat.name}`}
              className="group block outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2 rounded-xl lg:rounded-2xl bg-white border border-neutral-200/50 shadow-sm hover:shadow-md transition-all p-1.5 lg:p-2"
            >
              <div className="aspect-video rounded-lg lg:rounded-xl overflow-hidden mb-1.5 lg:mb-2 relative bg-neutral-200">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  src={cat.image}
                  alt={cat.alt}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-neutral-950/5 group-hover:bg-neutral-950/0 transition-colors duration-500 mix-blend-multiply" />
              </div>

              <div className="px-0.5 lg:px-1">
                <h3 className="text-[13px] lg:text-[16px] font-serif text-[#1A1A1A] mb-0.5 transition-colors group-hover:text-amber-800 truncate">
                  {cat.name}
                </h3>
                <p className="text-[11px] lg:text-[12.5px] leading-[1.3] lg:leading-[1.4] text-neutral-600 font-sans font-light line-clamp-2">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
