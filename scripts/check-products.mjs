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

const ids = [86, 51, 97, 132, 133, 138, 150]
const { data: products } = await supabase.from('products').select('id, name, image').in('id', ids)

for (const p of products) {
  const fileName = p.image.split('/').pop()
  console.log(`ID ${p.id}: ${fileName}`)
}
