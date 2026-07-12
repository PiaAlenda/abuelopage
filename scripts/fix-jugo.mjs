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

// Convert jugo de asado1.webp → jugo_de_asado1.webp
await sharp('public/products/bazar/jugo de asado1.webp').webp({ quality: 80 }).toFile('public/products/bazar/jugo_de_asado1.webp')
console.log('Converted: jugo_de_asado1.webp')

const buf = readFileSync('public/products/bazar/jugo_de_asado1.webp')
const { error: e } = await supabase.storage.from('products').upload('bazar/jugo_de_asado1.webp', buf, { upsert: false })
if (e && !e.message.includes('already exists')) console.error('Upload error:', e.message)
else console.log('Uploaded: bazar/jugo_de_asado1.webp')

// ID 14 "Juego de asado" → juego_de_asado2 + jugo_de_asado1 (la correcta)
await supabase.from('products').update({
  image: `${bucketUrl}/bazar/juego_de_asado2.webp`,
  images: [
    `${bucketUrl}/bazar/juego_de_asado2.webp`,
    `${bucketUrl}/bazar/jugo_de_asado1.webp`
  ]
}).eq('id', 14)
console.log('ID 14: fixed 2 images (juego_de_asado2 + jugo_de_asado1)')

// ID 116 → set_de_cuchillos_bandejas_etc
await supabase.from('products').update({
  image: `${bucketUrl}/bazar/set_de_cuchillos_bandejas_etc.webp`,
  images: [`${bucketUrl}/bazar/set_de_cuchillos_bandejas_etc.webp`]
}).eq('id', 116)
console.log('ID 116: OK')
