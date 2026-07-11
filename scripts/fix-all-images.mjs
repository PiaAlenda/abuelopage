import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync, createReadStream } from 'fs'
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
  // Collapse consecutive special chars first, then replace rest with underscore
  s = s.replace(/[–—]/g, '-')
  s = s.replace(/[\s]+/g, '_')
  s = s.replace(/[^a-zA-Z0-9._()-]/g, '_')
  s = s.replace(/_+/g, '_')
  s = s.replace(/^_|_$/g, '')
  return s
}

// 1. Upload all local webp files to Storage (skip existing)
const folders = ['hogar', 'bazar', 'electronica', 'otro']

console.log('=== Uploading webp files to Storage ===')
for (const folder of folders) {
  const dir = join('public', 'products', folder)
  if (!existsSync(dir)) continue
  const files = readdirSync(dir).filter(f => /\.webp$/i.test(f))
  for (const file of files) {
    const sanitized = sanitize(file)
    const storagePath = `${folder}/${sanitized}`
    
    // Check if already exists
    const { data: existing } = await supabase.storage.from('products').list(folder, { search: sanitized })
    if (existing?.some(e => e.name === sanitized)) {
      continue
    }
    
    const buffer = readFileSync(join(dir, file))
    const { error } = await supabase.storage.from('products').upload(storagePath, buffer, { upsert: false })
    if (error && !error.message.includes('already exists')) {
      console.error(`  ERR ${storagePath}: ${error.message}`)
    } else {
      console.log(`  UP ${storagePath}`)
    }
  }
}

// 2. Update all product image URLs to use sanitized filenames
console.log('\n=== Fixing product image URLs ===')
const { data: products } = await supabase.from('products').select('id, name, image, category')

let fixed = 0
for (const p of products) {
  if (!p.image || p.image.includes('placeholder.svg')) continue
  
  const urlParts = p.image.split('/')
  const fileName = urlParts[urlParts.length - 1]
  const sanitized = sanitize(fileName)
  
  if (sanitized !== fileName) {
    const newUrl = `${bucketUrl}/${p.category.toLowerCase()}/${sanitized}`
    
    // Test the new URL
    try {
      const r = await fetch(newUrl)
      if (r.ok) {
        await supabase.from('products').update({ image: newUrl }).eq('id', p.id)
        console.log(`  FIXED ${p.id}: ${p.name}`)
        console.log(`    ${fileName} → ${sanitized}`)
        fixed++
      } else {
        // Try the old URL too - maybe the old one works
        const r2 = await fetch(p.image)
        if (!r2.ok) {
          console.log(`  BROKEN ${p.id}: ${p.name} (needs manual fix)`)
          console.log(`    tried: ${sanitized} → ${r.status}`)
        }
      }
    } catch (e) {
      console.log(`  ERR ${p.id}: ${p.name}`)
    }
  } else {
    // Sanitized == fileName: verify the URL works
    try {
      const r = await fetch(p.image)
      if (!r.ok) {
        console.log(`  FAIL ${p.id}: ${p.name} → ${r.status}`)
      }
    } catch (e) {
      console.log(`  ERR ${p.id}: ${p.name}`)
    }
  }
}

console.log(`\nFixed ${fixed} products`)
