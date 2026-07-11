import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const env = readFileSync('.env', 'utf-8')
const vars = Object.fromEntries(
  env.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const i = l.indexOf('=')
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)

const supabase = createClient(vars.VITE_SUPABASE_URL, vars.SUPABASE_SERVICE_KEY)
const bucketUrl = vars.VITE_SUPABASE_URL + '/storage/v1/object/public/products'

async function upload(folder, file) {
  const buffer = readFileSync(join('public/products', folder, file))
  const { error } = await supabase.storage.from('products').upload(`${folder}/${file}`, buffer, { upsert: false })
  if (error && !error.message.includes('already exists')) {
    console.error(`  ERR upload ${folder}/${file}: ${error.message}`)
  } else if (!error) {
    console.log(`  OK upload ${folder}/${file}`)
  }
}

// 1. Upload new webp files
console.log('=== Uploading new images ===')
await upload('bazar', 'bandejas_antiguas_enlozadas_amarillas1.webp')
await upload('bazar', 'bandejas_antiguas_enlozadas_amarillas2.webp')
await upload('bazar', 'Bandeja_enlozada_antigua_blanca_con_borde_azul_-_Vintage1.webp')
await upload('bazar', 'Bandeja_enlozada_antigua_blanca_con_borde_azul_-_Vintage2.webp')
await upload('bazar', 'Duo_de_sartenes2_(1).webp')
await upload('bazar', 'Duo_de_sartenes2_(2).webp')
await upload('bazar', 'Duo_de_sartenes2_(3).webp')
await upload('bazar', 'Duo_de_sartenes2_(4).webp')
await upload('electronica', 'microondas.webp')
await upload('electronica', 'microondas2.webp')
await upload('electronica', 'microondas3.webp')
await upload('electronica', 'parlante_panasonic6.webp')
await upload('otro', 'set_de_asado_parrila2.webp')
await upload('otro', 'set_de_asado_parrilla1.webp')
await upload('hogar', 'tabla_de_planchar5.webp')

// 2. Fix broken DB URLs
console.log('\n=== Fixing broken image URLs ===')

const fixes = {
  // ID 97: Duo de sartenes (had unsanitized space filename)
  97: { category: 'bazar', images: ['Duo_de_sartenes1.webp', 'Duo_de_sartenes2.webp', 'Duo_de_sartenes3.webp', 'Duo_de_sartenes4.webp', 'Duo_de_sartenes2_(1).webp', 'Duo_de_sartenes2_(2).webp', 'Duo_de_sartenes2_(3).webp', 'Duo_de_sartenes2_(4).webp'] },
  // ID 133: Bandeja enlozada antigua blanca con borde azul – Vintage
  133: { category: 'bazar', images: ['Bandeja_enlozada_antigua_blanca_con_borde_azul_-_Vintage1.webp', 'Bandeja_enlozada_antigua_blanca_con_borde_azul_-_Vintage2.webp'] },
}

for (const [id, fix] of Object.entries(fixes)) {
  const urls = fix.images.map(f => `${bucketUrl}/${fix.category}/${f}`)
  await supabase.from('products').update({ image: urls[0], images: urls }).eq('id', parseInt(id))
  console.log(`  ID ${id}: image=${fix.images[0]}, images=[${fix.images.length} files]`)
}

// 3. Assign images to placeholder products
console.log('\n=== Assigning images to placeholder products ===')

const newImages = {
  51: { category: 'hogar', images: ['tabla_de_planchar5.webp'] },
  132: { category: 'bazar', images: ['bandejas_antiguas_enlozadas_amarillas1.webp', 'bandejas_antiguas_enlozadas_amarillas2.webp'] },
  138: { category: 'otro', images: ['set_de_asado_parrilla1.webp', 'set_de_asado_parrila2.webp'] },
  150: { category: 'electronica', images: ['microondas.webp', 'microondas2.webp', 'microondas3.webp'] },
  // Add extra image to Parlantes Panasonic
  29: { category: 'electronica', extraImages: ['parlante_panasonic6.webp'] },
}

for (const [id, ni] of Object.entries(newImages)) {
  if (ni.images) {
    const urls = ni.images.map(f => `${bucketUrl}/${ni.category}/${f}`)
    await supabase.from('products').update({ image: urls[0], images: urls }).eq('id', parseInt(id))
    console.log(`  ID ${id}: set image=${ni.images[0]}`)
  }
  if (ni.extraImages) {
    const { data: p } = await supabase.from('products').select('images').eq('id', parseInt(id)).single()
    const existing = p?.images || []
    const newUrls = ni.extraImages.map(f => `${bucketUrl}/${ni.category}/${f}`)
    const combined = [...existing, ...newUrls]
    await supabase.from('products').update({ images: combined }).eq('id', parseInt(id))
    console.log(`  ID ${id}: added ${ni.extraImages.length} extra images`)
  }
}

console.log('\nDone!')
