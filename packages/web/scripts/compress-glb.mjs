#!/usr/bin/env node
/**
 * GLB Texture Compression Script
 * Extracts embedded textures, compresses to JPEG, re-packs model.
 *
 * Usage:  node scripts/compress-glb.mjs [path-to.glb]
 * Default model: public/models/vault.glb
 */

import { NodeIO } from '@gltf-transform/core'
import { exec } from 'child_process'
import {
  writeFileSync,
  readFileSync,
  unlinkSync,
  existsSync,
  copyFileSync,
  renameSync,
} from 'fs'
import { promisify } from 'util'

const execAsync = promisify(exec)

const INPUT_MODEL = process.argv[2] || 'public/models/vault.glb'
const BACKUP_MODEL = `${INPUT_MODEL}.bak`
const TEMP_MODEL = `${INPUT_MODEL}.tmp.glb`
const JPEG_QUALITY = 80 // 60-90 recommended

async function compressGLB() {
  if (!existsSync(INPUT_MODEL)) {
    console.error(`❌ Model not found: ${INPUT_MODEL}`)
    process.exit(1)
  }

  const origModelSize = readFileSync(INPUT_MODEL).byteLength
  console.log(
    `📦 Reading model: ${INPUT_MODEL} (${(origModelSize / 1024 / 1024).toFixed(2)}MB)`,
  )

  const io = new NodeIO()
  const document = await io.read(INPUT_MODEL)
  const textures = document.getRoot().listTextures()

  console.log(`🖼️  Found ${textures.length} texture(s)`)

  if (textures.length === 0) {
    console.log('ℹ️  No embedded textures to compress. Skipping.')
    process.exit(0)
  }

  let totalOriginalSize = 0
  let totalCompressedSize = 0

  for (let i = 0; i < textures.length; i++) {
    const tex = textures[i]
    const img = tex.getImage()
    if (!img) continue

    const origSize = img.byteLength
    totalOriginalSize += origSize

    const mime = tex.getMimeType()
    const ext = mime === 'image/png' ? 'png' : 'jpg'
    const tmpIn = `/tmp/glb_tex_${i}.${ext}`
    const tmpOut = `/tmp/glb_tex_${i}_compressed.jpg`

    writeFileSync(tmpIn, Buffer.from(img))
    await execAsync(`magick ${tmpIn} -quality ${JPEG_QUALITY} ${tmpOut}`)

    const compressed = readFileSync(tmpOut)
    totalCompressedSize += compressed.byteLength

    console.log(
      `   ✓ Texture ${i}: ${(origSize / 1024).toFixed(0)}KB → ${(compressed.byteLength / 1024).toFixed(0)}KB`,
    )

    tex.setImage(
      new Uint8Array(
        compressed.buffer,
        compressed.byteOffset,
        compressed.byteLength,
      ),
    )
    tex.setMimeType('image/jpeg')

    unlinkSync(tmpIn)
    unlinkSync(tmpOut)
  }

  await io.write(TEMP_MODEL, document)

  const newModelSize = readFileSync(TEMP_MODEL).byteLength

  console.log(`\n📊 Results:`)
  console.log(
    `   Textures: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB → ${(totalCompressedSize / 1024 / 1024).toFixed(2)}MB`,
  )
  console.log(
    `   Model:    ${(origModelSize / 1024 / 1024).toFixed(2)}MB → ${(newModelSize / 1024 / 1024).toFixed(2)}MB`,
  )
  console.log(
    `   Saved:    ${((1 - newModelSize / origModelSize) * 100).toFixed(1)}%`,
  )

  // Backup and replace
  console.log(`\n💾 Creating backup: ${BACKUP_MODEL}`)
  copyFileSync(INPUT_MODEL, BACKUP_MODEL)
  renameSync(TEMP_MODEL, INPUT_MODEL)

  console.log(`\n✅ Optimization complete!`)
  console.log(`   Backup: ${BACKUP_MODEL}`)
  console.log(`   To restore: mv ${BACKUP_MODEL} ${INPUT_MODEL}`)
}

compressGLB().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
