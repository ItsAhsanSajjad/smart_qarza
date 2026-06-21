// Run via: npx tsx scripts/seed.ts
import bcrypt from 'bcryptjs'
import { db } from '../src/lib/db'

const ADMIN_PHONE = '03000000000'
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'admin123'

async function main() {
  // Settings — adminPassword column kept blank (auth uses the User table + bcrypt).
  const settings = await db.setting.upsert({
    where: { id: 'default' },
    update: { adminPassword: '' },
    create: {
      id: 'default',
      bankName: 'HBL - Habib Bank Ltd',
      accountTitle: 'GEO Loan (Pvt) Ltd',
      accountNumber: '1234-5678-9012-3456',
      mobileAccount: '0300-1234567',
      markupPercent: 5,
      downPaymentPercent: 12,
      loanPackages: '[8000,14000,18500,24000]',
      adminPhone: ADMIN_PHONE,
      adminPassword: '',
    },
  })
  console.log('✅ Settings seeded:', settings.id)

  // Admin account — password always stored as a bcrypt hash.
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const existingAdmin = await db.user.findUnique({ where: { phone: ADMIN_PHONE } })
  if (!existingAdmin) {
    const admin = await db.user.create({
      data: {
        phone: ADMIN_PHONE,
        password: hash,
        fullName: 'GEO Loan Admin',
        role: 'ADMIN',
        kycStatus: 'APPROVED',
      },
    })
    console.log('✅ Admin account created:', admin.phone)
  } else {
    // Ensure the existing admin has a hashed password (migrate legacy plaintext).
    await db.user.update({ where: { id: existingAdmin.id }, data: { password: hash } })
    console.log('ℹ️  Admin account updated (password re-hashed):', existingAdmin.phone)
  }

  console.log('\n📋 Login Credentials:')
  console.log('   Admin Phone: ' + ADMIN_PHONE)
  console.log('   Admin Password: ' + ADMIN_PASSWORD + '  (change after first login)')
  console.log('\n🌐 Routes:')
  console.log('   User App:     /app')
  console.log('   Admin Panel:  /admin')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
