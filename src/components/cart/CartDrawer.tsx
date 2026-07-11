import { useCart } from '../../context/CartContext'

const WHATSAPP_NUMBER = '542644123833'

function formatPrice(price?: number | null): string {
  if (price == null) return 'Consultar'
  return `$${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, totalPrice, removeItem } = useCart()

  const whatsappUrl = () => {
    if (items.length === 0) return '#'
    const lines = items.map((item, i) => {
      const priceStr = item.product.price != null
        ? `$${item.product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
        : 'Consultar'
      return `${i + 1}. ${item.product.name} x${item.quantity} - ${priceStr}`
    })
    const prefix = items.length === 1 ? 'este producto' : 'estos productos'
    let text = `¡Hola! Quiero comprar ${prefix}:\n${lines.join('\n')}`
    if (totalPrice > 0) {
      text += `\n\nTotal: $${totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
    }
    text += items.length === 1 ? '\n\n¿Está disponible?' : '\n\n¿Están disponibles?'
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${isOpen ? 'bg-black/30 pointer-events-auto' : 'bg-black/0 pointer-events-none'
          }`}
        onClick={closeCart}
      />
      <div
        className={`fixed inset-0 bg-[#FAF7F2] z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } md:right-0 md:left-auto md:top-0 md:bottom-0 md:w-[90vw] md:max-w-[420px]`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/60">
          <h2 className="text-base font-serif text-neutral-900">Carrito</h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-800 transition-colors"
            aria-label="Cerrar carrito"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-2 md:py-4 space-y-2 md:space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
              <span className="material-symbols-outlined text-[40px] md:text-[48px]">shopping_cart</span>
              <p className="text-sm font-medium">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-2.5 bg-white rounded-xl p-2.5 border border-neutral-200/50">
                <img
                  src={item.product.image}
                  alt={item.product.alt}
                  className="w-14 h-14 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-neutral-800 line-clamp-2">{item.product.name}</h3>
                    <p className="text-xs md:text-sm font-serif font-semibold text-amber-800">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">1 unidad</span>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      aria-label="Eliminar producto"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-neutral-200/60 px-3 md:px-6 py-3 md:py-5 space-y-2.5 md:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm font-medium text-neutral-600">Total</span>
              <span className="text-sm md:text-lg font-serif font-bold text-amber-900">
                ${totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-amber-900 text-white py-2.5 md:py-3.5 rounded-full text-xs md:text-sm font-semibold"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Comprar por WhatsApp
            </a>
          </div>
        )}
      </div>
    </>
  )
}
