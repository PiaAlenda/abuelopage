import { useState } from 'react'
import { Link } from '../../lib/Router'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  className?: string
  compact?: boolean
}

export default function ProductCard({ product, className = '', compact = false }: ProductCardProps) {
  const { addItem, removeItem, isInCart, openCart } = useCart()
  const { isAdmin } = useAuth()
  const { updateProduct } = useProducts()
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState(product.name)
  const [editDesc, setEditDesc] = useState(product.alt)
  const [editPrice, setEditPrice] = useState(product.price?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  const inCart = isInCart(product.id)
  const isSold = product.sold === true
  const isConsultar = !isSold && product.price == null

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inCart) {
      removeItem(product.id)
    } else {
      addItem(product)
      openCart()
    }
  }

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditName(product.name)
    setEditDesc(product.alt)
    setEditPrice(product.price?.toString() ?? '')
    setShowEditModal(true)
  }

  const handleSave = async () => {
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

  return (
    <>
      <div className={`group/card relative flex flex-col rounded-3xl border shadow-sm transition-all duration-300 ${compact ? 'p-2' : 'p-3'} ${className} ${isSold ? 'bg-neutral-200/60 border-neutral-300/50' : 'bg-white border-neutral-200/60 hover:shadow-md'}`}>
        {isAdmin && (
          <button
            onClick={openModal}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-neutral-300 text-neutral-600 shadow-sm hover:bg-amber-800 hover:text-white hover:border-amber-800 transition-all active:scale-90"
            aria-label="Editar producto"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        )}

        <Link
          to={isSold ? '#' : `?id=${product.id}`}
          className={`block outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-4 rounded-2xl overflow-hidden ${isSold ? 'pointer-events-none' : ''}`}
          onClick={isSold ? (e) => e.preventDefault() : undefined}
        >
          <div className={`relative ${compact ? 'aspect-[4/3]' : 'aspect-square'} bg-[#FAF7F2] rounded-2xl overflow-hidden ${isSold ? 'opacity-60' : ''}`}>
            <img
              className="w-full h-full object-cover group-hover/card:scale-[1.03] transition-transform duration-500"
              src={product.image}
              alt={product.alt}
              loading="lazy"
            />
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-red-700 text-white text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
                  Vendido
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className={`flex flex-col flex-grow pt-3 pb-1 px-1 justify-between ${isSold ? 'opacity-60' : ''}`}>
          <div className="space-y-1">
            <Link to={isSold ? '#' : `?id=${product.id}`} className={`group/link outline-none ${isSold ? 'pointer-events-none' : ''}`} onClick={isSold ? (e) => e.preventDefault() : undefined}>
              <h4 className={`font-sans font-medium text-neutral-800 line-clamp-1 ${compact ? 'text-[13px] leading-tight' : 'text-[15px]'} ${isSold ? '' : 'hover:text-amber-900 transition-colors'}`}>
                {product.name}
              </h4>
            </Link>
            {product.price != null ? (
              <p className={`font-serif font-semibold ${compact ? 'text-sm' : 'text-lg'} text-amber-800`}>
                ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            ) : !isSold ? (
              <p className={`font-sans font-semibold ${compact ? 'text-sm' : 'text-base'} text-amber-600`}>
                Consultar
              </p>
            ) : null}
          </div>

          {!isAdmin && !isSold && !isConsultar && compact && (
            <div className="flex items-center justify-center gap-1.5 pt-2 mt-auto border-t border-neutral-100/60">
              <Link
                to={`?id=${product.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-300 text-neutral-600 bg-white hover:border-amber-800 hover:text-amber-800 hover:bg-neutral-50 transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
                aria-label={`Ver detalles de ${product.name}`}
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
              </Link>
              <button
                onClick={handleCartClick}
                className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all active:scale-90 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-800 animate-soft-reveal ${
                  inCart
                    ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-400'
                    : 'border-amber-900 bg-amber-900 text-white hover:bg-amber-950 hover:border-amber-950'
                }`}
                aria-label={inCart ? `Eliminar ${product.name} del carrito` : `Añadir ${product.name} al carrito`}
              >
                <span key={inCart ? 'close' : 'cart'} className="material-symbols-outlined text-[16px]">{inCart ? 'close' : 'shopping_cart'}</span>
              </button>
            </div>
          )}
          {!isAdmin && !isSold && !isConsultar && !compact && (
            <div className="flex items-center justify-center gap-1.5 pt-3 mt-auto border-t border-neutral-100/60">
              <Link
                to={`?id=${product.id}`}
                className="w-9 h-9 flex items-center justify-center rounded-md border border-neutral-300 text-neutral-600 bg-white hover:border-amber-800 hover:text-amber-800 hover:bg-neutral-50 transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
                aria-label={`Ver detalles de ${product.name}`}
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
              </Link>
              <button
                onClick={handleCartClick}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border transition-all active:scale-[0.98] shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-800 text-sm font-semibold max-md:w-9 max-md:h-9 max-md:flex-none max-md:px-0 max-md:py-0 max-md:justify-center animate-soft-reveal ${
                  inCart
                    ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-400'
                    : 'border-amber-900 bg-amber-900 text-white hover:bg-amber-950 hover:border-amber-950'
                }`}
                aria-label={inCart ? `Eliminar ${product.name} del carrito` : `Añadir ${product.name} al carrito`}
              >
                <span key={inCart ? 'close' : 'cart'} className="material-symbols-outlined text-[18px]">{inCart ? 'close' : 'shopping_cart'}</span>
                <span key={inCart ? 'remove-txt' : 'add-txt'} className="max-md:hidden animate-slide-up">{inCart ? 'Ya lo tienes' : 'Añadir al carrito'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
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
    </>
  )
}
