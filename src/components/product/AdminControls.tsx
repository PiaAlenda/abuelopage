import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'
import type { Product } from '../../types'

interface AdminControlsProps {
  product: Product
  editingPrice?: boolean
  onEditPrice?: () => void
  onCancelEdit?: () => void
  onSavePrice?: (newPrice: number | null) => Promise<void>
  editingName?: boolean
  onEditName?: () => void
  onCancelEditName?: () => void
  onSaveName?: () => Promise<void>
  editingDesc?: boolean
  onEditDesc?: () => void
  onCancelEditDesc?: () => void
  onSaveDesc?: () => Promise<void>
}

export default function AdminControls({
  product,
  editingPrice = false,
  onEditPrice,
  onCancelEdit,
  onSavePrice,
  editingName = false,
  onEditName,
  onCancelEditName,
  onSaveName,
  editingDesc = false,
  onEditDesc,
  onCancelEditDesc,
  onSaveDesc,
}: AdminControlsProps) {
  const { isAdmin } = useAuth()
  const { updateProduct } = useProducts()
  const [saving, setSaving] = useState(false)

  if (!isAdmin) return null

  const handleToggleSold = async () => {
    setSaving(true)
    const err = await updateProduct(product.id, { sold: !product.sold })
    setSaving(false)
    if (err) alert('Error: ' + err)
  }

  const EditBtn = ({ label, editing, onEdit, onCancel, onSave }: { label: string; editing: boolean; onEdit?: () => void; onCancel?: () => void; onSave?: () => void }) => {
    if (editing) {
      return (
        <>
          <button
            onClick={onSave}
            disabled={saving}
            className="text-[10px] font-semibold bg-amber-800 text-white px-3 py-1.5 rounded-lg hover:bg-amber-900 transition-colors disabled:opacity-50 leading-none"
          >
            OK
          </button>
          <button
            onClick={onCancel}
            className="text-[10px] font-semibold bg-white text-neutral-500 px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-400 transition-colors leading-none"
          >
            Cancelar
          </button>
        </>
      )
    }
    return (
      <button
        onClick={onEdit}
        className="shrink-0 text-[11px] font-semibold tracking-wide bg-white text-neutral-500 px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 hover:border-amber-800 hover:text-amber-800 transition-colors leading-none"
      >
        {label}
      </button>
    )
  }

  return (
    <div className="mt-2 pt-2 border-t border-dashed border-neutral-200">
      <div className="flex flex-wrap items-center gap-1.5">
        {onEditName && (
          <EditBtn
            label="Editar nombre"
            editing={editingName}
            onEdit={onEditName}
            onCancel={onCancelEditName}
            onSave={() => onSaveName?.()}
          />
        )}
        {onEditDesc && (
          <EditBtn
            label="Editar descripción"
            editing={editingDesc}
            onEdit={onEditDesc}
            onCancel={onCancelEditDesc}
            onSave={() => onSaveDesc?.()}
          />
        )}
        {onEditPrice && (
          <EditBtn
            label="Editar precio"
            editing={editingPrice}
            onEdit={onEditPrice}
            onCancel={onCancelEdit}
            onSave={() => onSavePrice?.(null)}
          />
        )}
        <button
          onClick={handleToggleSold}
          disabled={saving}
          className={`ml-auto text-[9px] max-md:text-[8px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded-lg border transition-colors disabled:opacity-50 leading-none ${
            product.sold
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100'
          }`}
        >
          {product.sold ? 'Activar' : 'Vendido'}
        </button>
      </div>
    </div>
  )
}
