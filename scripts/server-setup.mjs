// One-time server setup for cPanel "Setup Node.js App".
// Run it from the app's virtualenv terminal:  node scripts/server-setup.mjs
// ...or paste this file's path into the NodeJS Selector "Run JS Script" box.
// It regenerates the Prisma client (Linux engine), creates/updates the SQLite
// schema, and seeds the default settings + admin account.
import { execSync } from 'node:child_process'

const run = (cmd) => {
  console.log('\n$ ' + cmd)
  execSync(cmd, { stdio: 'inherit' })
}

try {
  run('npx prisma generate')
  run('npx prisma db push')
  run('npx tsx scripts/seed.ts')
  console.log('\n✅ Database ready.')
  console.log('   Admin login: 03000000000 / admin123  — CHANGE the password after first login (Admin → Settings).')
} catch (e) {
  console.error('\n✗ Setup failed:', e?.message || e)
  console.error('  Check that DATABASE_URL in .env points to a writable absolute path and that npm install finished.')
  process.exit(1)
}
