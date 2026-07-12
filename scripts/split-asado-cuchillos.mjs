import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8').split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
const bucketUrl = env.VITE_SUPABASE_URL + '/storage/v1/object/public/products'

// Upload juego_de_asado.webp (sanitized version of cuchillos image)
const bufCuchillo = readFileSync('public/products/bazar/juego_de_asado.webp')
const { error: err1 } = await supabase.storage.from('products').upload('bazar/juego_de_asado.webp', bufCuchillo, { upsert: false })
if (err1 && !err1.message.includes('already exists')) console.error('Upload cuchillo error:', err1.message)
else console.log('Uploaded: bazar/juego_de_asado.webp')

// Upload juego_de_asado2.webp (sanitized version of asado image)
const bufAsado = readFileSync('public/products/bazar/juego_de_asado2.webp')
const { error: err2 } = await supabase.storage.from('products').upload('bazar/juego_de_asado2.webp', bufAsado, { upsert: false })
if (err2 && !err2.message.includes('already exists')) console.error('Upload asado error:', err2.message)
else console.log('Uploaded: bazar/juego_de_asado2.webp')

// Update ID 14 "Juego de asado" → only asado image
await supabase.from('products').update({
  image: `${bucketUrl}/bazar/juego_de_asado2.webp`,
  images: [`${bucketUrl}/bazar/juego_de_asado2.webp`]
}).eq('id', 14)
console.log('ID 14: solo juego_de_asado2.webp')

// Update ID 116 "Set de cuchillos + bandeja + afilador" → only cuchillo image
await supabase.from('products').update({
  image: `${bucketUrl}/bazar/juego_de_asado.webp`,
  images: [`${bucketUrl}/bazar/juego_de_asado.webp`]
}).eq('id', 116)
console.log('ID 116: solo juego_de_asado.webp')
