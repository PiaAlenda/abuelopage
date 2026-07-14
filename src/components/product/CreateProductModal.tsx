import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useProducts } from '../../context/ProductContext'

interface CreateProductModalProps {
  onClose: () => void
  onCreated: () => void
}

interface ImageItem {
  id: string
  file: File
  preview: string
}

const CATEGORIES = ['Bazar', 'Hogar', 'Electrónica', 'Otro']
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

export default function CreateProductModal({ onClose, onCreated }: CreateProductModalProps) {
  const { createProduct } = useProducts()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragIndex = useRef<number | null>(null)
  const dropIndex = useRef<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [sold, setSold] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: ImageItem[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }))

    setImages(prev => [...prev, ...newItems])
    e.target.value = ''
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const item = prev.find(i => i.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter(i => i.id !== id)
    })
  }

  const handleDragStart = (index: number) => {
    dragIndex.current = index
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    dropIndex.current = index
  }

  const handleDrop = () => {
    if (dragIndex.current === null || dropIndex.current === null) return
    if (dragIndex.current === dropIndex.current) return

    setImages(prev => {
      const next = [...prev]
      const [dragged] = next.splice(dragIndex.current!, 1)
      next.splice(dropIndex.current!, 0, dragged)
      return next
    })

    dragIndex.current = null
    dropIndex.current = null
  }

  const handleDragEnd = () => {
    dragIndex.current = null
    dropIndex.current = null
  }

  const handleSave = async () => {
    setError('')

    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (images.length === 0) {
      setError('Debes seleccionar al menos una imagen')
      return
    }

    setSaving(true)

    const urls: string[] = []

    for (let i = 0; i < images.length; i++) {
      setUploadProgress({ current: i + 1, total: images.length })

      const img = images[i]
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
      const webpBlob = await convertToWebP(img.file)

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, webpBlob, { contentType: 'image/webp' })

      if (uploadError) {
        setSaving(false)
        setError(`Error al subir la imagen ${i + 1}: ${uploadError.message}`)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      urls.push(publicUrl)
    }

    setUploadProgress({ current: 0, total: 0 })

    const { error: createError } = await createProduct({
      name: name.trim(),
      alt: description.trim(),
      price: price === '' ? null : Number(price),
      category,
      image: urls[0],
      images: urls,
      sold,
    })

    setSaving(false)

    if (createError) {
      setError('Error al crear el producto: ' + createError)
      return
    }

    images.forEach(img => URL.revokeObjectURL(img.preview))
    onCreated()
  }

  const savingLabel = uploadProgress.total > 0
    ? `Subiendo ${uploadProgress.current}/${uploadProgress.total}...`
    : 'Creando...'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={contentRef}
        className="bg-white shadow-xl w-full h-full flex flex-col animate-soft-reveal sm:w-auto sm:h-auto sm:rounded-2xl sm:max-w-md sm:max-h-[calc(100dvh-2rem)]"
      >
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-0 shrink-0">
          <h3 className="text-lg font-serif font-semibold text-neutral-800">Añadir producto</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-5 space-y-4 overscroll-contain">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre del producto"
              className="w-full bg-[#FBF9F6] border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Descripción del producto"
              className="w-full bg-[#FBF9F6] border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#FBF9F6] border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Imágenes <span className="text-red-500">*</span>
            </label>
            <div className="w-full bg-[#FBF9F6] border-2 border-dashed border-neutral-300 rounded-lg px-3 py-4 text-sm text-neutral-500 transition-colors">
              {images.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-44 sm:max-h-64 overflow-y-auto overscroll-contain pr-0.5">
                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        className="relative group aspect-square bg-white rounded-lg overflow-hidden border border-neutral-200 cursor-grab active:cursor-grabbing"
                      >
                        <img
                          src={img.preview}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-full bg-amber-800 text-white text-[10px] font-bold shadow-sm">
                          {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/50 text-white text-[12px] opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-400">Arrastra para reordenar</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors"
                    >
                      + Añadir más
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
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100'
              }`}
            >
              {sold ? 'Activo' : 'Vendido'}
            </button>
          </div>

          <div className="sticky bottom-0 bg-white z-10 pb-5 sm:pb-6 pt-2 -mx-5 sm:-mx-6 px-5 sm:px-6">
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="flex-1 text-sm font-semibold bg-white text-neutral-500 py-2.5 rounded-lg border border-neutral-300 hover:border-neutral-400 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || images.length === 0}
                className="flex-1 text-sm font-semibold bg-amber-800 text-white py-2.5 rounded-lg hover:bg-amber-900 transition-colors disabled:opacity-50"
              >
                {saving ? savingLabel : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
