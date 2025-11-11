// Minimal recursive copy without external deps.
// Copies backend/src -> api/backend-src, skipping any node_modules.
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fsp.copyFile(src, dest);
}

async function copyDir(srcDir, destDir) {
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath);
    }
  }
}

async function removeDirIfExists(dir) {
  try {
    await fsp.rm(dir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

async function main() {
  const source = path.resolve('backend', 'src');
  const destination = path.resolve('api', 'backend-src');

  if (!fs.existsSync(source)) {
    console.log(`[copy-backend] Source not found: ${source}`);
    process.exit(0);
  }

  await removeDirIfExists(destination);
  await ensureDir(destination);
  await copyDir(source, destination);
  console.log('[copy-backend] Copied backend/src -> api/backend-src');
}

main().catch((err) => {
  console.error('[copy-backend] Failed:', err);
  process.exit(1);
});


