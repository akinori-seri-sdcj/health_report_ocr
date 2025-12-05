// Copy frontend/dist (Vite build output) into public/ui for Next.js to serve.
// Uses only Node stdlib to avoid extra dependencies.
const fs = require('fs')
const fsp = fs.promises
const path = require('path')

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true })
}

async function removeDir(dirPath) {
  await fsp.rm(dirPath, { recursive: true, force: true })
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
  const distPath = path.resolve('frontend', 'dist')
  const targetPath = path.resolve('public', 'ui')
  const staticPath = path.resolve('frontend', 'public')

  if (!fs.existsSync(distPath)) {
    console.error('[sync-frontend] Missing build output. Run "npm run build:frontend" first.')
    process.exit(1)
  }

  await removeDir(targetPath)
  await ensureDir(targetPath)
  await copyDir(distPath, targetPath)
  if (fs.existsSync(staticPath)) {
    await copyDir(staticPath, targetPath)
    console.log(`[sync-frontend] Copied ${distPath} -> ${targetPath}`)
    console.log(`[sync-frontend] Copied ${staticPath} -> ${targetPath}`)
  } else {
    console.log(`[sync-frontend] Copied ${distPath} -> ${targetPath} (no frontend/public to copy)`)
  }
}

main().catch((err) => {
  console.error('[sync-frontend] Failed:', err)
  process.exit(1)
})
