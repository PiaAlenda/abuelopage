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

const { data, error } = await supabase.from('products').select('id, name, image, category').order('id')
if (error) { console.error(error.message); process.exit(1) }

console.log('Total:', data.length)
for (const p of data) {
  console.log(p.id, '|', p.category, '|', p.name, '|', p.image)
}
