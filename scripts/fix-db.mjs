// One-shot, NON-DESTRUCTIVE full-schema builder for prod.db.
// Creates every table/index IF NOT EXISTS and adds the newer columns.
// Safe to run repeatedly. Run from the app's standalone folder with DATABASE_URL set:
//   DATABASE_URL="file:/home/geoloanp/geoloan-data/prod.db" node fix-db.mjs
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "securityQuestion" TEXT,
    "securityAnswer" TEXT,
    "fullName" TEXT,
    "cnic" TEXT,
    "email" TEXT,
    "dob" TEXT,
    "address" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "kycNote" TEXT,
    "kycSubmittedAt" DATETIME,
    "cnicFront" TEXT,
    "cnicBack" TEXT,
    "selfie" TEXT,
    "walletBalance" REAL NOT NULL DEFAULT 0,
    "withdrawUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "currentLoanId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "markupPercent" REAL NOT NULL DEFAULT 5,
    "totalRepayment" REAL NOT NULL,
    "weeklyInstallment" REAL NOT NULL,
    "downPayment" REAL NOT NULL,
    "termWeeks" INTEGER NOT NULL DEFAULT 4,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Installment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Installment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "loanId" TEXT,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "screenshotPath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "KycSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "fullName" TEXT,
    "cnic" TEXT,
    "email" TEXT,
    "dob" TEXT,
    "address" TEXT,
    "cnicFront" TEXT,
    "cnicBack" TEXT,
    "selfie" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "adminNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KycSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Withdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "loanId" TEXT,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "bank" TEXT,
    "accountNumber" TEXT NOT NULL,
    "accountTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "adminNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "bankName" TEXT NOT NULL DEFAULT 'HBL - Habib Bank Ltd',
    "accountTitle" TEXT NOT NULL DEFAULT 'GEO Loan (Pvt) Ltd',
    "accountNumber" TEXT NOT NULL DEFAULT '1234-5678-9012-3456',
    "mobileAccount" TEXT NOT NULL DEFAULT '0300-1234567',
    "markupPercent" REAL NOT NULL DEFAULT 5,
    "downPaymentPercent" REAL NOT NULL DEFAULT 12,
    "loyaltyDiscountPerLoan" REAL NOT NULL DEFAULT 1,
    "minMarkupPercent" REAL NOT NULL DEFAULT 2,
    "loanPackages" TEXT NOT NULL DEFAULT '[8000,14000,18500,24000]',
    "adminPhone" TEXT NOT NULL DEFAULT '03000000000',
    "adminPassword" TEXT NOT NULL DEFAULT 'admin123',
    "apkPath" TEXT,
    "apkVersion" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "actorPhone" TEXT,
    "role" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "detail" TEXT,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Reel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "videoPath" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  // Backfill EVERY column on EVERY table — covers tables that pre-existed from an
  // older schema. Existing columns throw "duplicate column" and are skipped.
  // (createdAt/updatedAt are core CURRENT_TIMESTAMP columns — SQLite can't ALTER-add
  // a non-constant default, so they are intentionally omitted; they already exist.)
  `ALTER TABLE "User" ADD COLUMN "securityQuestion" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "securityAnswer" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "fullName" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "cnic" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "email" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "dob" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "address" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER'`,
  `ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT 0`,
  `ALTER TABLE "User" ADD COLUMN "kycStatus" TEXT NOT NULL DEFAULT 'PENDING'`,
  `ALTER TABLE "User" ADD COLUMN "kycNote" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "kycSubmittedAt" DATETIME`,
  `ALTER TABLE "User" ADD COLUMN "cnicFront" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "cnicBack" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "selfie" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "walletBalance" REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE "User" ADD COLUMN "withdrawUnlocked" BOOLEAN NOT NULL DEFAULT 0`,
  `ALTER TABLE "User" ADD COLUMN "currentLoanId" TEXT`,
  `ALTER TABLE "Setting" ADD COLUMN "bankName" TEXT NOT NULL DEFAULT 'HBL - Habib Bank Ltd'`,
  `ALTER TABLE "Setting" ADD COLUMN "accountTitle" TEXT NOT NULL DEFAULT 'GEO Loan (Pvt) Ltd'`,
  `ALTER TABLE "Setting" ADD COLUMN "accountNumber" TEXT NOT NULL DEFAULT '1234-5678-9012-3456'`,
  `ALTER TABLE "Setting" ADD COLUMN "mobileAccount" TEXT NOT NULL DEFAULT '0300-1234567'`,
  `ALTER TABLE "Setting" ADD COLUMN "markupPercent" REAL NOT NULL DEFAULT 5`,
  `ALTER TABLE "Setting" ADD COLUMN "downPaymentPercent" REAL NOT NULL DEFAULT 12`,
  `ALTER TABLE "Setting" ADD COLUMN "loyaltyDiscountPerLoan" REAL NOT NULL DEFAULT 1`,
  `ALTER TABLE "Setting" ADD COLUMN "minMarkupPercent" REAL NOT NULL DEFAULT 2`,
  `ALTER TABLE "Setting" ADD COLUMN "loanPackages" TEXT NOT NULL DEFAULT '[8000,14000,18500,24000]'`,
  `ALTER TABLE "Setting" ADD COLUMN "adminPhone" TEXT NOT NULL DEFAULT '03000000000'`,
  `ALTER TABLE "Setting" ADD COLUMN "adminPassword" TEXT NOT NULL DEFAULT 'admin123'`,
  `ALTER TABLE "Setting" ADD COLUMN "apkPath" TEXT`,
  `ALTER TABLE "Setting" ADD COLUMN "apkVersion" TEXT`,
  `ALTER TABLE "Setting" ADD COLUMN "maintenanceMode" BOOLEAN NOT NULL DEFAULT 0`,
  `ALTER TABLE "Setting" ADD COLUMN "maintenanceMessage" TEXT`,
  `ALTER TABLE "Loan" ADD COLUMN "markupPercent" REAL NOT NULL DEFAULT 5`,
  `ALTER TABLE "Loan" ADD COLUMN "termWeeks" INTEGER NOT NULL DEFAULT 4`,
  `ALTER TABLE "Loan" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING'`,
  `ALTER TABLE "Installment" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING'`,
  `ALTER TABLE "Installment" ADD COLUMN "paidAt" DATETIME`,
  `ALTER TABLE "Payment" ADD COLUMN "loanId" TEXT`,
  `ALTER TABLE "Payment" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING'`,
  `ALTER TABLE "Payment" ADD COLUMN "adminNote" TEXT`,
  `ALTER TABLE "Payment" ADD COLUMN "reviewedBy" TEXT`,
  `ALTER TABLE "Payment" ADD COLUMN "reviewedAt" DATETIME`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "phone" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "fullName" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "cnic" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "email" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "dob" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "address" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "cnicFront" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "cnicBack" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "selfie" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'SUBMITTED'`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "adminNote" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "reviewedBy" TEXT`,
  `ALTER TABLE "KycSubmission" ADD COLUMN "reviewedAt" DATETIME`,
  `ALTER TABLE "Withdrawal" ADD COLUMN "loanId" TEXT`,
  `ALTER TABLE "Withdrawal" ADD COLUMN "bank" TEXT`,
  `ALTER TABLE "Withdrawal" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING'`,
  `ALTER TABLE "Withdrawal" ADD COLUMN "transactionId" TEXT`,
  `ALTER TABLE "Withdrawal" ADD COLUMN "adminNote" TEXT`,
  `ALTER TABLE "Withdrawal" ADD COLUMN "reviewedBy" TEXT`,
  `ALTER TABLE "Withdrawal" ADD COLUMN "reviewedAt" DATETIME`,
  `ALTER TABLE "Notification" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'INFO'`,
  `ALTER TABLE "Notification" ADD COLUMN "read" BOOLEAN NOT NULL DEFAULT 0`,
  `ALTER TABLE "Reel" ADD COLUMN "subtitle" TEXT`,
  `ALTER TABLE "Reel" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0`,
  // Indexes
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone")`,
  `CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role")`,
  `CREATE INDEX IF NOT EXISTS "Loan_userId_idx" ON "Loan"("userId")`,
  `CREATE INDEX IF NOT EXISTS "Loan_status_idx" ON "Loan"("status")`,
  `CREATE INDEX IF NOT EXISTS "Installment_loanId_idx" ON "Installment"("loanId")`,
  `CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId")`,
  `CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status")`,
  `CREATE INDEX IF NOT EXISTS "Payment_type_idx" ON "Payment"("type")`,
  `CREATE INDEX IF NOT EXISTS "KycSubmission_userId_idx" ON "KycSubmission"("userId")`,
  `CREATE INDEX IF NOT EXISTS "KycSubmission_status_idx" ON "KycSubmission"("status")`,
  `CREATE INDEX IF NOT EXISTS "Withdrawal_userId_idx" ON "Withdrawal"("userId")`,
  `CREATE INDEX IF NOT EXISTS "Withdrawal_status_idx" ON "Withdrawal"("status")`,
  `CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action")`,
  `CREATE INDEX IF NOT EXISTS "Reel_order_idx" ON "Reel"("order")`,
]

async function main() {
  for (const sql of STATEMENTS) {
    const label = sql.replace(/\s+/g, ' ').slice(0, 58)
    try {
      await db.$executeRawUnsafe(sql)
      console.log('OK   ', label)
    } catch (e) {
      console.log('SKIP ', label, '::', String(e.message || '').replace(/\s+/g, ' ').slice(0, 90))
    }
  }
  try {
    const t = await db.$queryRawUnsafe(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
    console.log('TABLES NOW:', t.map((x) => x.name).join(', '))
  } catch (e) {
    console.log('verify error:', e.message)
  }
  console.log('\nSchema fix complete.')
}

main()
  .catch((e) => { console.error('FATAL', e); process.exit(1) })
  .finally(() => db.$disconnect())
