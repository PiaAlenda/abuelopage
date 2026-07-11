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

async function uploadFile(folder, name) {
  // Try sanitized path first, then with spaces
  const paths = [
    join('public', 'products', folder, name),
    join('public', 'products', folder, name.replace(/_/g, ' ')),
  ]
  for (const p of paths) {
    if (existsSync(p)) {
      const buf = readFileSync(p)
      const storagePath = `${folder}/${name}`
      const { error } = await supabase.storage.from('products').upload(storagePath, buf, { upsert: false })
      if (error && !error.message.includes('already exists')) {
        console.error(`  ERR ${storagePath}: ${error.message}`)
        return false
      }
      console.log(`  OK ${storagePath}`)
      return true
    }
  }
  console.error(`  NOT FOUND ${folder}/${name}`)
  return false
}

// 1. Fix ID 97: Duo de sartenes
console.log('=== Fix Duo de sartenes (ID 97) ===')
const duoMain = 'Duo_de_sartenes1.webp'
await uploadFile('bazar', duoMain)

const duoExtras = [
  'Duo_de_sartenes2.webp', 'Duo_de_sartenes3.webp', 'Duo_de_sartenes4.webp',
  'Duo_de_sartenes2_(1).webp', 'Duo_de_sartenes2_(2).webp',
  'Duo_de_sartenes2_(3).webp', 'Duo_de_sartenes2_(4).webp',
]
const duoUrls = [`${bucketUrl}/bazar/${duoMain}`]
for (const f of duoExtras) {
  if (await uploadFile('bazar', f)) {
    duoUrls.push(`${bucketUrl}/bazar/${f}`)
  }
}
await supabase.from('products').update({ image: duoUrls[0], images: duoUrls }).eq('id', 97)
console.log(`  → ${duoMain} + ${duoUrls.length - 1} extras`)

// 2. Assign images to placeholder products
console.log('\n=== Assign images ===')

const assigns = [
  {
    id: 51, category: 'hogar',
    files: ['tabla_de_planchar5.webp']
  },
  {
    id: 132, category: 'bazar',
    files: ['bandejas_antiguas_enlozadas_amarillas1.webp', 'bandejas_antiguas_enlozadas_amarillas2.webp']
  },
  {
    id: 138, category: 'otro',
    files: ['set_de_asado_parrilla1.webp', 'set_de_asado_parrila2.webp']
  },
  {
    id: 150, category: 'electronica',
    files: ['microondas.webp', 'microondas2.webp', 'microondas3.webp']
  },
]

for (const a of assigns) {
  const urls = []
  for (const f of a.files) {
    if (await uploadFile(a.category, f)) {
      urls.push(`${bucketUrl}/${a.category}/${f}`)
    }
  }
  if (urls.length > 0) {
    await supabase.from('products').update({ image: urls[0], images: urls }).eq('id', a.id)
    console.log(`  ID ${a.id}: ${a.files[0]} + ${urls.length - 1} extras`)
  }
}

// 3. Add extra image to ID 29 Parlantes Panasonic
console.log('\n=== Extra image ID 29 ===')
if (await uploadFile('electronica', 'parlante_panasonic6.webp')) {
  const { data: p29 } = await supabase.from('products').select('images').eq('id', 29).single()
  const updated = [...(p29?.images || []), `${bucketUrl}/electronica/parlante_panasonic6.webp`]
  await supabase.from('products').update({ images: updated }).eq('id', 29)
  console.log('  Added parlante_panasonic6.webp')
}

console.log('\nDone!')
