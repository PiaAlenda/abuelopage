import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8').split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

const { data } = await supabase.from('products').select('id,name,category,image,images').or('name.ilike.%cuchillo%,name.ilike.%asado%').order('id')
console.log(JSON.stringify(data, null, 2))
