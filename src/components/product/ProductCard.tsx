import { useState } from 'react'
import { Link } from '../../lib/Router'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'
import type { Product } from '../../types'
import EditProductModal from './EditProductModal'
import ConfirmDialog from '../global/ConfirmDialog'

interface ProductCardProps {
  product: Product
  className?: string
  compact?: boolean
}

export default function ProductCard({ product, className = '', compact = false }: ProductCardProps) {
  const { addItem, removeItem, isInCart, openCart } = useCart()
  const { isAdmin } = useAuth()
  const { deleteProduct } = useProducts()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
    setShowEditModal(true)
  }

  return (
    <>
      <div className={`group/card relative flex flex-col rounded-3xl border shadow-sm transition-all duration-300 ${compact ? 'p-2' : 'p-3'} ${className} ${isSold ? 'bg-neutral-200/60 border-neutral-300/50' : 'bg-white border-neutral-200/60 hover:shadow-md'}`}>
        {isAdmin && (
          <div className="absolute top-4 right-4 z-10 flex gap-1.5">
            <button
              onClick={openModal}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-neutral-300 text-neutral-600 shadow-sm hover:bg-amber-800 hover:text-white hover:border-amber-800 transition-all active:scale-90"
              aria-label="Editar producto"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true) }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-neutral-300 text-neutral-600 shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-90"
              aria-label="Eliminar producto"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        )}

        <Link
          to={isSold ? '#' : `?id=${product.id}`}
          className={`block outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-4 rounded-2xl overflow-hidden ${isSold ? 'pointer-events-none' : ''}`}
          onClick={isSold ? (e) => e.preventDefault() : undefined}
        >
          <div className={`relative ${compact ? 'aspect-[4/3]' : 'aspect-square'} bg-[#FAF7F2] rounded-2xl overflow-hidden ${isSold ? 'opacity-60' : ''}`}>
            <img
              className="w-full h-full object-cover group-hover/card:scale-[1.03] transition-transform duration-500"
              src={product.image || '/products/placeholder.svg'}
              alt={product.alt}
              loading="lazy"
              onError={e => { if (e.currentTarget.src !== '/products/placeholder.svg') e.currentTarget.src = '/products/placeholder.svg' }}
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

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Eliminar producto"
        message={`¿Eliminar "${product.name}" permanentemente? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          setShowDeleteConfirm(false)
          const err = await deleteProduct(product.id)
          if (err) alert('Error: ' + err)
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {showEditModal && (
        <EditProductModal
          product={product}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  )
}