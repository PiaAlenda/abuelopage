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

async function convertAndUpload(inputPath, outputName, category) {
  const webpPath = `public/products/${category}/${outputName}`
  await sharp(inputPath).webp({ quality: 80 }).toFile(webpPath)
  console.log(`Converted: ${outputName}`)

  const buf = readFileSync(webpPath)
  const { error } = await supabase.storage.from('products').upload(`${category}/${outputName}`, buf, { upsert: false })
  if (error && !error.message.includes('already exists')) {
    console.error(`Upload error: ${error.message}`)
  } else {
    console.log(`Uploaded: ${category}/${outputName}`)
  }
  return `${bucketUrl}/${category}/${outputName}`
}

// Convert and upload bacha lavadero images
const bacha1 = await convertAndUpload('public/products/otro/bacha de lavadedro2.jpeg', 'bacha_de_lavadedro2.webp', 'otro')
const bacha2 = await convertAndUpload('public/products/otro/bacha del lavadero.jpeg', 'bacha_del_lavadero.webp', 'otro')

// Upload extra tabla de planchar images
const tablaExtras = ['tabla_de_planchar2.webp', 'tabla_de_planchar3.webp', 'tabla_de_planchar4.webp']
const tablaUrls = []
for (const f of tablaExtras) {
  const p = `public/products/hogar/${f}`
  try {
    const buf = readFileSync(p)
    const { error } = await supabase.storage.from('products').upload(`hogar/${f}`, buf, { upsert: false })
    if (!error) console.log(`Uploaded: hogar/${f}`)
    tablaUrls.push(`${bucketUrl}/hogar/${f}`)
  } catch (e) {
    console.error(`Not found: ${f}`)
  }
}

// Update DB: ID 51 Tabla de planchar (add extras to existing)
const { data: p51 } = await supabase.from('products').select('images').eq('id', 51).single()
const existing51 = p51?.images || []
await supabase.from('products').update({ images: [...existing51, ...tablaUrls] }).eq('id', 51)
console.log(`ID 51: added ${tablaUrls.length} extra images`)

// Update DB: ID 140 Bacha lavadero (assign from placeholder)
await supabase.from('products').update({ image: bacha1, images: [bacha1, bacha2] }).eq('id', 140)
console.log(`ID 140: assigned bacha lavadero images`)

console.log('\nDone!')
