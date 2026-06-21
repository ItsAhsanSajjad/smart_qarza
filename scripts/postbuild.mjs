// Cross-platform post-build step for `output: "standalone"`.
// Next emits a self-contained server in .next/standalone but does NOT copy the
// static assets or the public/ folder into it (it assumes a CDN). Copy them so
// the standalone server serves CSS/JS/images correctly on any host.
import { cp, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const standalone = path.join(root, '.next', 'standalone')

if (!existsSync(standalone)) {
  console.error('✗ .next/standalone not found — did `next build` run with output:"standalone"?')
  process.exit(1)
}

await mkdir(path.join(standalone, '.next'), { recursive: true })
await cp(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'), { recursive: true })

if (existsSync(path.join(root, 'public'))) {
  await cp(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true })
}

// Copy the generated Prisma client + native query engines into the standalone
// bundle. Next 16 tracing is unreliable for these (.so.node) files, so copy them
// deterministically — otherwise the server throws "Query engine library not found".
const prismaSrc = path.join(root, 'node_modules', '.prisma', 'client')
const prismaDest = path.join(standalone, 'node_modules', '.prisma', 'client')
if (existsSync(prismaSrc)) {
  await mkdir(prismaDest, { recursive: true })
  await cp(prismaSrc, prismaDest, { recursive: true })
  console.log('✓ Copied .prisma/client (query engines) into .next/standalone')
}
const clientSrc = path.join(root, 'node_modules', '@prisma', 'client')
const clientDest = path.join(standalone, 'node_modules', '@prisma', 'client')
if (existsSync(clientSrc)) {
  await mkdir(clientDest, { recursive: true })
  await cp(clientSrc, clientDest, { recursive: true })
}

console.log('✓ Copied .next/static and public/ into .next/standalone')
