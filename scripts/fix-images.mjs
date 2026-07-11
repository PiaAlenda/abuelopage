import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env', 'utf-8')
const vars = Object.fromEntries(
  env.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const i = l.indexOf('=')
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)

const supabase = createClient(vars.VITE_SUPABASE_URL, vars.SUPABASE_SERVICE_KEY)
const bucketUrl = vars.VITE_SUPABASE_URL + '/storage/v1/object/public/products'

const placeholder = vars.VITE_SUPABASE_URL + '/storage/v1/object/public/products/placeholder.svg'

// Primero: revertir a placeholder todos los productos que tenían placeholder y fueron mal asignados
const idsToRevert = [4, 13, 16, 17, 49, 51, 68, 70, 74, 82, 85, 89, 98, 100, 103, 104, 105, 112, 117, 118, 119, 121, 122, 123, 132, 135]

for (const id of idsToRevert) {
  await supabase.from('products').update({ image: placeholder, images: [] }).eq('id', id)
  console.log(`Revertido ID ${id}`)
}

// Ahora: actualizar SOLO los matches correctos
function sanitize(name) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

const correctMatches = [
  { id: 26, category: 'electronica', file: 'Google Nest Hub (2ª Gen).webp' },
  { id: 47, category: 'electronica', file: 'Xiaomi Watch S1.webp' },
  { id: 55, category: 'hogar', file: 'florero.webp' },
  { id: 57, category: 'hogar', file: 'Colcha vintage de lanilla1.webp' },
  { id: 58, category: 'hogar', file: 'Plumon reversible dos plazas1.webp' },
  { id: 63, category: 'hogar', file: 'Juego de sillones del living1.webp' },
  { id: 72, category: 'bazar', file: 'Jarra labrada antigua1.webp' },
  { id: 149, category: 'electronica', file: 'lavarropa1.webp' },
]

for (const match of correctMatches) {
  const newUrl = `${bucketUrl}/${match.category}/${sanitize(match.file)}`

  // También buscar imágenes extra
  const baseName = match.file.replace(/\.webp$/i, '').replace(/\d+$/, '')
  const { readdirSync, existsSync } = await import('fs')
  const { join } = await import('path')
  const dir = join('public', 'products', match.category)
  const files = existsSync(dir) ? readdirSync(dir).filter(f => /\.webp$/i.test(f)) : []
  
  const extras = files.filter(f => {
    const fb = f.replace(/\.webp$/i, '').toLowerCase()
    return fb.startsWith(baseName.toLowerCase()) && f !== match.file
  })

  const images = [newUrl, ...extras.map(f => `${bucketUrl}/${match.category}/${sanitize(f)}`)]

  await supabase.from('products').update({ image: newUrl, images }).eq('id', match.id)
  console.log(`ID ${match.id} → ${newUrl}` + (extras.length ? ` (+${extras.length} extras)` : ''))
}

// También actualizar images array para Xiaomi Watch S1 (tiene fotos extra)
const xiaomiExtras = ['Xiaomi Watch S1-2.webp', 'Xiaomi Watch S1-3.webp']
const xiaomiImages = [
  `${bucketUrl}/electronica/${sanitize('Xiaomi Watch S1.webp')}`,
  ...xiaomiExtras.map(f => `${bucketUrl}/electronica/${sanitize(f)}`)
]
await supabase.from('products').update({ images: xiaomiImages }).eq('id', 47)
console.log('ID 47 Xiaomi Watch S1 → images array actualizado')

// Lavarropa extras
const lavarropaImages = [
  `${bucketUrl}/electronica/${sanitize('lavarropa1.webp')}`,
  `${bucketUrl}/electronica/${sanitize('lavarropa2.webp')}`,
  `${bucketUrl}/electronica/${sanitize('lavarropa3.webp')}`,
  `${bucketUrl}/electronica/${sanitize('lavarropa4.webp')}`,
]
await supabase.from('products').update({ images: lavarropaImages }).eq('id', 149)
console.log('ID 149 Lavarropa → images array actualizado')

console.log('\nDone!')
