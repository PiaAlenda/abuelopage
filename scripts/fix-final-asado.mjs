import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8').split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
const bucketUrl = env.VITE_SUPABASE_URL + '/storage/v1/object/public/products'

// Upload juego_de_asado.webp (the one without "2") to storage
const buf = readFileSync('public/products/bazar/juego_de_asado.webp')
const { error: e } = await supabase.storage.from('products').upload('bazar/juego_de_asado.webp', buf, { upsert: false })
if (e && !e.message.includes('already exists')) console.error('Upload error:', e.message)
else console.log('Uploaded: bazar/juego_de_asado.webp')

// ID 14 "Juego de asado" → LAS DOS imágenes
await supabase.from('products').update({
  image: `${bucketUrl}/bazar/juego_de_asado2.webp`,
  images: [
    `${bucketUrl}/bazar/juego_de_asado2.webp`,
    `${bucketUrl}/bazar/juego_de_asado.webp`
  ]
}).eq('id', 14)
console.log('ID 14: assigned 2 images (juego_de_asado2 + juego_de_asado)')

// ID 116 "Set de cuchillos + bandeja + afilador" → solo set_de_cuchillos_bandejas_etc
await supabase.from('products').update({
  image: `${bucketUrl}/bazar/set_de_cuchillos_bandejas_etc.webp`,
  images: [`${bucketUrl}/bazar/set_de_cuchillos_bandejas_etc.webp`]
}).eq('id', 116)
console.log('ID 116: assigned set_de_cuchillos_bandejas_etc.webp')
