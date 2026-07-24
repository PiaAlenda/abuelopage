import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useProducts } from '../../context/ProductContext'
import type { Product } from '../../types'

interface EditProductModalProps {
  product: Product
  onClose: () => void
  onDeleted?: () => void
}

const MAX_IMAGE_DIMENSION = 1920
const WEBP_QUALITY = 0.8

function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          blob => {
            if (blob) resolve(blob)
            else reject(new Error('Error al convertir a WebP'))
          },
          'image/webp',
          WEBP_QUALITY
        )
      }
      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

export default function EditProductModal({ product, onClose, onDeleted: _onDeleted }: EditProductModalProps) {
  const { updateProduct } = useProducts()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.alt)
  const [price, setPrice] = useState(product.price?.toString() ?? '')
  const [sold, setSold] = useState(product.sold ?? false)
  const [editImages, setEditImages] = useState<string[]>(
    product.images && product.images.length > 0 ? [...product.images] : [product.image]
  )
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)
    const previews = newFiles.map(f => URL.createObjectURL(f))

    setNewImageFiles(prev => [...prev, ...newFiles])
    setNewImagePreviews(prev => [...prev, ...previews])
    e.target.value = ''
  }

  const removeEditImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)

    const uploadedUrls: string[] = []
    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i]
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
      const webpBlob = await convertToWebP(file)

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, webpBlob, { contentType: 'image/webp' })

      if (uploadError) {
        setSaving(false)
        alert('Error al subir imagen: ' + uploadError.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    const finalImages = [...editImages, ...uploadedUrls]
    const err = await updateProduct(product.id, {
      name: name.trim(),
      alt: description.trim(),
      price: price === '' ? null : Number(price),
      image: finalImages[0],
      images: finalImages,
      sold,
    })

    setSaving(false)
    if (err) alert('Error: ' + err)
    else {
      newImagePreviews.forEach(u => URL.revokeObjectURL(u))
      onClose()
    }
  }

  const handleClose = () => {
    newImagePreviews.forEach(u => URL.revokeObjectURL(u))
    onClose()
  }

  return (
    <>
    <div
      className="fixed inset-0 z-[60] bg-black/50 sm:p-4 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        ref={contentRef}
        className="bg-white w-full h-full flex flex-col animate-soft-reveal sm:rounded-2xl sm:max-w-md sm:mx-auto sm:my-auto sm:h-auto sm:max-h-[calc(100dvh-2rem)]"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-0 shrink-0">
          <h3 className="text-lg font-serif font-semibold text-neutral-800">Editar producto</h3>
          <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 space-y-4 overscroll-contain">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#FBF9F6] border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#FBF9F6] border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Precio</label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#FBF9F6] border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Imágenes</label>
            <div className="w-full bg-[#FBF9F6] border-2 border-dashed border-neutral-300 rounded-lg px-3 py-3 text-sm text-neutral-500 transition-colors">
              {editImages.length > 0 || newImagePreviews.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-1.5">
                    {editImages.map((url, index) => (
                      <div key={`edit-${index}`} className="relative group aspect-square bg-white rounded-lg overflow-hidden border border-neutral-200">
                        <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeEditImage(index)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/50 text-white text-[12px] opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                    {newImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group aspect-square bg-white rounded-lg overflow-hidden border border-neutral-200 ring-2 ring-amber-400/50">
                        <img src={preview} alt={`Nueva ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/50 text-white text-[12px] opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-400">{editImages.length + newImageFiles.length} imagen(es)</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors"
                    >
                      + Añadir imágenes
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-1 cursor-pointer hover:border-amber-800/40 hover:bg-[#F8F4EE] transition-colors"
                >
                  <span className="material-symbols-outlined text-[32px] text-neutral-300">add_photo_alternate</span>
                  <span>Seleccionar imágenes</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Estado</span>
            <button
              onClick={() => setSold(!sold)}
              disabled={saving}
              className={`text-[11px] font-semibold uppercase tracking-wider px-4 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                sold
                  ? 'bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {sold ? 'Vendido' : 'Activo'}
            </button>
          </div>

          </div>

        <div className="shrink-0 bg-white pb-4 pt-2 px-5">
          <div className="flex justify-center gap-3 border-t border-neutral-100 pt-3">
            <button
              onClick={handleClose}
              disabled={saving}
              className="px-10 text-[11px] font-semibold bg-white text-neutral-500 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-400 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 text-[11px] font-semibold bg-amber-800 text-white py-1.5 rounded-lg hover:bg-amber-900 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}