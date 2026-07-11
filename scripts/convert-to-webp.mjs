import sharp from 'sharp'
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

function sanitize(name) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
    .replace(/[–—]/g, '-')
    .replace(/[''""]/g, '')
    .replace(/[^a-zA-Z0-9._()-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .replace(/\(/g, '(').replace(/\)/g, ')')
}

const folders = ['hogar', 'bazar', 'electronica', 'otro']
const baseDir = 'public/products'

for (const folder of folders) {
  const dir = join(baseDir, folder)
  if (!existsSync(dir)) continue

  const files = readdirSync(dir).filter(f => /\.(jpe?g|png|JPE?G|PNG)$/.test(f))
  for (const file of files) {
    const inputPath = join(dir, file)
    const baseName = file.replace(/\.(jpe?g|png|JPE?G|PNG)$/i, '')
    const outputName = sanitize(baseName) + '.webp'
    const outputPath = join(dir, outputName)

    try {
      await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath)
      console.log(`✓ ${folder}/${file} → ${outputName}`)
    } catch (e) {
      console.error(`✗ ${folder}/${file}: ${e.message}`)
    }
  }
}
