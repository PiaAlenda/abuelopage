import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8').split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
const bucketUrl = env.VITE_SUPABASE_URL + '/storage/v1/object/public/products'

// Producto "Set asado parrilla" ID 138 — tiene la img de cuchillos mezclada
// La imagen correcta es la primera: set_asado_parrilla1.webp
await supabase.from('products').update({
  image: `${bucketUrl}/otro/set_asado_parrilla1.webp`,
  images: [`${bucketUrl}/otro/set_asado_parrilla1.webp`]
}).eq('id', 138)

console.log('ID 138: updated to only parrilla image')

// ID 87 "Set de cuchillos" (si existe) — asignar la imagen de cuchillos
const { data: cuchillos } = await supabase.from('products').select('id,images').ilike('name', '%cuchillo%')
console.log('Cuchillo products:', JSON.stringify(cuchillos, null, 2))
