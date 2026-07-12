import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8').split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
const bucketUrl = env.VITE_SUPABASE_URL + '/storage/v1/object/public/products'

// 1 — Convertir y subir "set de cuchillos, bandejas etc.webp" para ID 116
await sharp('public/products/bazar/set de cuchillos, bandejas etc.webp')
  .webp({ quality: 80 })
  .toFile('public/products/bazar/set_de_cuchillos_bandejas_etc.webp')
console.log('Converted: set_de_cuchillos_bandejas_etc.webp')

const buf116 = readFileSync('public/products/bazar/set_de_cuchillos_bandejas_etc.webp')
const { error: e116 } = await supabase.storage.from('products').upload('bazar/set_de_cuchillos_bandejas_etc.webp', buf116, { upsert: false })
if (e116 && !e116.message.includes('already exists')) console.error('Upload error:', e116.message)
else console.log('Uploaded: bazar/set_de_cuchillos_bandejas_etc.webp')

await supabase.from('products').update({
  image: `${bucketUrl}/bazar/set_de_cuchillos_bandejas_etc.webp`,
  images: [`${bucketUrl}/bazar/set_de_cuchillos_bandejas_etc.webp`]
}).eq('id', 116)
console.log('ID 116: assigned set_de_cuchillos_bandejas_etc.webp')

// 2 — ID 14 "Juego de asado": solo la imagen del asado (juego_de_asado2.webp)
await supabase.from('products').update({
  image: `${bucketUrl}/bazar/juego_de_asado2.webp`,
  images: [`${bucketUrl}/bazar/juego_de_asado2.webp`]
}).eq('id', 14)
console.log('ID 14: only juego_de_asado2.webp')
