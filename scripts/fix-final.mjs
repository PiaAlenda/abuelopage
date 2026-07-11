import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
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

function sanitize(name) {
  let s = name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
    .replace(/[''""]/g, '')
    .replace(/[–—]/g, '-')
  s = s.replace(/[\s]+/g, '_')
  s = s.replace(/[^a-zA-Z0-9._()-]/g, '_')
  s = s.replace(/_+/g, '_')
  s = s.replace(/^_|_$/g, '')
  return s
}

async function uploadFile(folder, name) {
  // Try multiple possible local paths
  const possiblePaths = [
    join('public', 'products', folder, name),                    // exact sanitized
    join('public', 'products', folder, sanitize(name)),          // sanitized of input
  ]
  // Also try unsanitized version (reverse-lookup)
  const unsanitized = name.replace(/_/g, ' ')
  if (unsanitized !== name) possiblePaths.push(join('public', 'products', folder, unsanitized))
  
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      const buf = readFileSync(p)
      const storagePath = `${folder}/${name}`
      const { error } = await supabase.storage.from('products').upload(storagePath, buf, { upsert: false })
      if (error && !error.message.includes('already exists')) {
        console.error(`  ERR upload ${storagePath}: ${error.message}`)
        return false
      } else if (!error) {
        console.log(`  UP ${storagePath}`)
        return true
      }
      return true // already exists
    }
  }
  console.error(`  NOT FOUND: ${folder}/${name} (tried ${possiblePaths.length} paths)`)
  return false
}

// Step 1: Fix broken URLs (accents, ñ → sanitized)
console.log('=== Fixing broken URLs ===')
const { data: products } = await supabase.from('products').select('*')

let fixedUrls = 0
for (const p of products) {
  if (!p.image || p.image.includes('placeholder.svg')) continue
  const fileName = p.image.split('/').pop()
  const sanitized = sanitize(fileName)
  if (sanitized === fileName) continue

  const newUrl = `${bucketUrl}/${p.category.toLowerCase()}/${sanitized}`
  try {
    const r = await fetch(newUrl)
    if (r.ok) {
      await supabase.from('products').update({ image: newUrl }).eq('id', p.id)
      console.log(`${p.id}: ${fileName} → ${sanitized}`)
      fixedUrls++
    }
  } catch (e) {}
}
console.log(`Fixed ${fixedUrls} URLs`)

// Step 2: Upload new user-uploaded files + assign to placeholder products
console.log('\n=== Assigning images to products ===')

// New products to assign
const assignments = [
  { id: 51, category: 'hogar', file: 'tabla_de_planchar5.webp' },
  { id: 132, category: 'bazar', file: 'bandejas_antiguas_enlozadas_amarillas1.webp', extras: ['bandejas_antiguas_enlozadas_amarillas2.webp'] },
  { id: 138, category: 'otro', file: 'set_de_asado_parrilla1.webp', extras: ['set_de_asado_parrila2.webp'] },
  { id: 150, category: 'electronica', file: 'microondas.webp', extras: ['microondas2.webp', 'microondas3.webp'] },
]

for (const a of assignments) {
  const urls = [a.file, ...(a.extras || [])].map(f => `${bucketUrl}/${a.category}/${f}`)
  
  // Upload each file
  for (const f of [a.file, ...(a.extras || [])]) {
    await uploadFile(a.category, f)
  }
  
  await supabase.from('products').update({ image: urls[0], images: urls }).eq('id', a.id)
  console.log(`  ID ${a.id}: ${a.file}`)
}

// Fix Duo de sartenes (ID 97) - update image URL + add extra images
console.log('\n=== Fixing Duo de sartenes (ID 97) ===')
const duoFiles = [
  'Duo_de_sartenes1.webp',
  'Duo_de_sartenes2.webp',
  'Duo_de_sartenes3.webp',
  'Duo_de_sartenes4.webp',
  // User-uploaded extra photos (with spaces in original name)
  'Duo_de_sartenes2_(1).webp',
  'Duo_de_Sartenes2_(1).webp',
  'Duo_de_sartenes2_(2).webp',
  'Duo_de_Sartenes2_(2).webp',
  'Duo_de_sartenes2_(3).webp',
  'Duo_de_Sartenes2_(3).webp',
  'Duo_de_sartenes2_(4).webp',
  'Duo_de_Sartenes2_(4).webp',
]

// Upload and check each
const duoUrls = []
for (const f of duoFiles) {
  const uploaded = await uploadFile('bazar', f)
  if (uploaded) {
    duoUrls.push(`${bucketUrl}/bazar/${f}`)
  }
}

if (duoUrls.length > 0) {
  await supabase.from('products').update({ image: duoUrls[0], images: duoUrls }).eq('id', 97)
  console.log(`  Updated ID 97: ${duoUrls.length} images`)
}

// Fix Bandeja enlozada (ID 133)
console.log('\n=== Fixing Bandeja enlozada (ID 133) ===')
const bandejaFiles = [
  'Bandeja_enlozada_antigua_blanca_con_borde_azul_-_Vintage1.webp',
  'Bandeja_enlozada_antigua_blanca_con_borde_azul_-_Vintage2.webp',
]
const bandejaUrls = []
for (const f of bandejaFiles) {
  const uploaded = await uploadFile('bazar', f)
  if (uploaded) bandejaUrls.push(`${bucketUrl}/bazar/${f}`)
}
if (bandejaUrls.length > 0) {
  await supabase.from('products').update({ image: bandejaUrls[0], images: bandejaUrls }).eq('id', 133)
  console.log(`  Updated ID 133: ${bandejaUrls.length} images`)
}

// Add parlante panasonic6 to ID 29
console.log('\n=== Adding extra image to Parlantes Panasonic (ID 29) ===')
const uploaded = await uploadFile('electronica', 'parlante_panasonic6.webp')
if (uploaded) {
  const { data: p29 } = await supabase.from('products').select('images').eq('id', 29).single()
  const p29Images = [...(p29?.images || []), `${bucketUrl}/electronica/parlante_panasonic6.webp`]
  await supabase.from('products').update({ images: p29Images }).eq('id', 29)
  console.log('  Added parlante_panasonic6.webp to ID 29')
}

console.log('\nAll done!')
