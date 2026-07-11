import { products } from '../../data/products'

export default function NewArrivals() {
  return (
    <section className="py-24">
      <div className="max-w-[1280px] mx-auto px-[16px] md:px-[40px]">
        <div className="text-center mb-16">
          <h2 className="text-[24px] md:text-[32px] leading-[32px] md:leading-[40px] tracking-[0em] md:tracking-[-0.01em] font-semibold mb-4">
            Nuevos Ingresos
          </h2>
          <div className="w-20 h-1 bg-primary-container mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[24px] gap-y-12">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col">
              <div className="relative aspect-square bg-surface-container-low rounded-lg overflow-hidden mb-4 shadow-sm">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={product.image}
                  alt={product.alt}
                />
                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-primary-container hover:text-white transition-all active:scale-90">
                  <span className="material-symbols-outlined text-sm">favorite</span>
                </button>
              </div>
              <h4 className="text-[16px] leading-[24px] font-bold text-on-surface">{product.name}</h4>
              <p className="text-[16px] leading-[24px] text-secondary mt-1">
                ${product.price?.toFixed(2) ?? '0.00'}
              </p>
              <button className="mt-4 w-full border border-outline-variant text-on-surface py-2 rounded-lg text-[14px] leading-[20px] tracking-[0.05em] font-semibold hover:bg-surface-container-high hover:border-primary transition-all active:scale-95">
                Consultar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
