import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Product } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface ProductContextValue {
  products: Product[]
  allProducts: Product[]
  displayProducts: Product[]
  loading: boolean
  updateProduct: (id: number, data: Partial<Pick<Product, 'price' | 'sold' | 'name' | 'alt' | 'description'>>) => Promise<string | null>
  createProduct: (data: Omit<Product, 'id'>) => Promise<{ product: Product | null; error: string | null }>
}

const ProductContext = createContext<ProductContextValue | null>(null)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [isAdmin])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id')

    if (error) {
      console.error('Error fetching products:', error.message)
    } else if (data) {
      const soldCount = data.filter((p: any) => p.sold).length
      console.log(`[ProductContext] Total: ${data.length} | Vendidos: ${soldCount} | isAdmin: ${isAdmin}`)
      setAllProducts(data as Product[])
    }
    setLoading(false)
  }

  const products = allProducts.filter(p => !p.sold)
  const displayProducts = isAdmin ? allProducts : products

  const updateProduct = useCallback(async (id: number, data: Partial<Pick<Product, 'price' | 'sold' | 'name' | 'alt' | 'description'>>): Promise<string | null> => {
    if (!isAdmin) return 'No tienes permisos'

    const { error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)

    if (error) return error.message

    setAllProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
    return null
  }, [isAdmin])

  const createProduct = useCallback(async (data: Omit<Product, 'id'>): Promise<{ product: Product | null; error: string | null }> => {
    if (!isAdmin) return { product: null, error: 'No tienes permisos' }

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single()

    if (error) return { product: null, error: error.message }

    setAllProducts(prev => [...prev, newProduct as Product])
    return { product: newProduct as Product, error: null }
  }, [isAdmin])

  return (
    <ProductContext.Provider value={{ products, allProducts, displayProducts, loading, updateProduct, createProduct }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts debe usarse dentro de un ProductProvider')
  return ctx
}
