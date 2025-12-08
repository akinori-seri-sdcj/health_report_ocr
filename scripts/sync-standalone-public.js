// Copy public/ into .next/standalone/public after Next.js build (standalone output)
// This ensures assets like /ui/icons/*.png are available when running `node .next/standalone/server.js`.
const fs = require('fs')
const fsp = fs.promises
const path = require('path')

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true })
}

async function copyDir(srcDir, destDir) {
  const entries = await fsp.readdir(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      await ensureDir(destPath)
      await copyDir(srcPath, destPath)
    } else if (entry.isFile()) {
      await ensureDir(path.dirname(destPath))
      await fsp.copyFile(srcPath, destPath)
    }
  }
}

async function main() {
  const publicDir = path.resolve('public')
  const standalonePublicDir = path.resolve('.next', 'standalone', 'public')

  if (!fs.existsSync(path.resolve('.next', 'standalone'))) {
    console.warn('[sync-standalone-public] Skipped: .next/standalone not found (build may have failed)')
    return
  }
  if (!fs.existsSync(publicDir)) {
    console.warn('[sync-standalone-public] Skipped: public/ not found')
    return
  }

  await ensureDir(standalonePublicDir)
  await copyDir(publicDir, standalonePublicDir)
  console.log(`[sync-standalone-public] Copied ${publicDir} -> ${standalonePublicDir}`)
}

main().catch((err) => {
  console.error('[sync-standalone-public] Failed:', err)
  process.exit(1)
})
