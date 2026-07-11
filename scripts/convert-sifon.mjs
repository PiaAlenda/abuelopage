import sharp from 'sharp'
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

const inputDir = 'public/products/otro'
const files = ['sifon y garrafa1.jpeg', 'sifon y garrafa2.jpeg', 'sifon y garrafa3.jpeg']
const urls = []

for (const f of files) {
  const outputName = sanitize(f.replace(/\.jpe?g$/i, '')) + '.webp'
  await sharp(`${inputDir}/${f}`).webp({ quality: 80 }).toFile(`${inputDir}/${outputName}`)
  console.log(`Converted: ${outputName}`)

  const buf = readFileSync(`${inputDir}/${outputName}`)
  const { error } = await supabase.storage.from('products').upload(`otro/${outputName}`, buf, { upsert: false })
  if (error && !error.message.includes('already exists')) {
    console.error(`Upload error: ${error.message}`)
  } else {
    console.log(`Uploaded: otro/${outputName}`)
  }
  urls.push(`${bucketUrl}/otro/${outputName}`)
}

await supabase.from('products').update({ image: urls[0], images: urls }).eq('id', 136)
console.log(`\nID 136: assigned ${urls.length} images`)
