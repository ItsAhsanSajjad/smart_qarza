import { db } from '@/lib/db'

// Idempotent, additive schema guard. Runs once per server process (via
// instrumentation at boot) BEFORE any request is served, so a freshly-uploaded
// build self-heals its SQLite schema — creating any missing table and every
// missing column. Prevents the "app expects a column the DB lacks" crash loop
// that can escalate into a full account suspension. NEVER destructive.
//
// Order matters: create tables FIRST (so PRAGMA can then read their columns),
// then backfill only the columns that are actually missing (quiet — no error
// logs on a healthy DB), then indexes.
let done = false

const CREATE_TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY,"phone" TEXT NOT NULL,"password" TEXT NOT NULL,"securityQuestion" TEXT,"securityAnswer" TEXT,"fullName" TEXT,"cnic" TEXT,"email" TEXT,"dob" TEXT,"address" TEXT,"role" TEXT NOT NULL DEFAULT 'USER',"mustChangePassword" BOOLEAN NOT NULL DEFAULT false,"kycStatus" TEXT NOT NULL DEFAULT 'PENDING',"kycNote" TEXT,"kycSubmittedAt" DATETIME,"cnicFront" TEXT,"cnicBack" TEXT,"selfie" TEXT,"walletBalance" REAL NOT NULL DEFAULT 0,"withdrawUnlocked" BOOLEAN NOT NULL DEFAULT false,"currentLoanId" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"hiddenFromDashboardAt" DATETIME,"hiddenFromDashboardBy" TEXT,"hiddenFromDashboardReason" TEXT)`,
  `CREATE TABLE IF NOT EXISTS "Loan" ("id" TEXT NOT NULL PRIMARY KEY,"userId" TEXT NOT NULL,"amount" REAL NOT NULL,"markupPercent" REAL NOT NULL DEFAULT 5,"totalRepayment" REAL NOT NULL,"weeklyInstallment" REAL NOT NULL,"downPayment" REAL NOT NULL,"termWeeks" INTEGER NOT NULL DEFAULT 4,"status" TEXT NOT NULL DEFAULT 'PENDING',"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "Installment" ("id" TEXT NOT NULL PRIMARY KEY,"loanId" TEXT NOT NULL,"weekNumber" INTEGER NOT NULL,"amount" REAL NOT NULL,"dueDate" DATETIME NOT NULL,"status" TEXT NOT NULL DEFAULT 'PENDING',"paidAt" DATETIME,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "Payment" ("id" TEXT NOT NULL PRIMARY KEY,"userId" TEXT NOT NULL,"loanId" TEXT,"type" TEXT NOT NULL,"amount" REAL NOT NULL,"screenshotPath" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'PENDING',"adminNote" TEXT,"reviewedBy" TEXT,"reviewedAt" DATETIME,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "KycSubmission" ("id" TEXT NOT NULL PRIMARY KEY,"userId" TEXT NOT NULL,"phone" TEXT,"fullName" TEXT,"cnic" TEXT,"email" TEXT,"dob" TEXT,"address" TEXT,"cnicFront" TEXT,"cnicBack" TEXT,"selfie" TEXT,"status" TEXT NOT NULL DEFAULT 'SUBMITTED',"adminNote" TEXT,"reviewedBy" TEXT,"reviewedAt" DATETIME,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"hiddenFromDashboardAt" DATETIME,"hiddenFromDashboardBy" TEXT,"hiddenFromDashboardReason" TEXT)`,
  `CREATE TABLE IF NOT EXISTS "Withdrawal" ("id" TEXT NOT NULL PRIMARY KEY,"userId" TEXT NOT NULL,"loanId" TEXT,"amount" REAL NOT NULL,"method" TEXT NOT NULL,"bank" TEXT,"accountNumber" TEXT NOT NULL,"accountTitle" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'PENDING',"transactionId" TEXT,"adminNote" TEXT,"reviewedBy" TEXT,"reviewedAt" DATETIME,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "Notification" ("id" TEXT NOT NULL PRIMARY KEY,"userId" TEXT NOT NULL,"title" TEXT NOT NULL,"message" TEXT NOT NULL,"type" TEXT NOT NULL DEFAULT 'INFO',"read" BOOLEAN NOT NULL DEFAULT false,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "Setting" ("id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',"bankName" TEXT NOT NULL DEFAULT 'HBL - Habib Bank Ltd',"accountTitle" TEXT NOT NULL DEFAULT 'Smart Qarz (Pvt) Ltd',"accountNumber" TEXT NOT NULL DEFAULT '1234-5678-9012-3456',"mobileAccount" TEXT NOT NULL DEFAULT '0300-1234567',"markupPercent" REAL NOT NULL DEFAULT 5,"downPaymentPercent" REAL NOT NULL DEFAULT 12,"loyaltyDiscountPerLoan" REAL NOT NULL DEFAULT 1,"minMarkupPercent" REAL NOT NULL DEFAULT 2,"loanPackages" TEXT NOT NULL DEFAULT '[8000,14000,18500,24000]',"adminPhone" TEXT NOT NULL DEFAULT '03000000000',"adminPassword" TEXT NOT NULL DEFAULT 'admin123',"apkPath" TEXT,"apkVersion" TEXT,"maintenanceMode" BOOLEAN NOT NULL DEFAULT false,"maintenanceMessage" TEXT,"chatEnabled" BOOLEAN NOT NULL DEFAULT true,"updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "AuditLog" ("id" TEXT NOT NULL PRIMARY KEY,"actorId" TEXT,"actorPhone" TEXT,"role" TEXT,"action" TEXT NOT NULL,"target" TEXT,"detail" TEXT,"ip" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "FinancialLedger" ("id" TEXT NOT NULL PRIMARY KEY,"entryKey" TEXT NOT NULL,"direction" TEXT NOT NULL,"type" TEXT NOT NULL,"amount" REAL NOT NULL,"sourceId" TEXT,"sourceType" TEXT NOT NULL,"userId" TEXT,"userPhone" TEXT,"userName" TEXT,"userCnic" TEXT,"userEmail" TEXT,"loanId" TEXT,"paymentType" TEXT,"method" TEXT,"status" TEXT NOT NULL,"adminId" TEXT,"adminPhone" TEXT,"note" TEXT,"metadata" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "Reel" ("id" TEXT NOT NULL PRIMARY KEY,"title" TEXT NOT NULL,"subtitle" TEXT,"videoPath" TEXT NOT NULL,"order" INTEGER NOT NULL DEFAULT 0,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"hiddenFromDashboardAt" DATETIME,"hiddenFromDashboardBy" TEXT,"hiddenFromDashboardReason" TEXT)`,
]

// table -> { column: full ADD COLUMN ddl }. Only missing columns are altered.
const COLUMNS: Record<string, Record<string, string>> = {
  User: {
    securityQuestion: `ALTER TABLE "User" ADD COLUMN "securityQuestion" TEXT`,
    securityAnswer: `ALTER TABLE "User" ADD COLUMN "securityAnswer" TEXT`,
    role: `ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER'`,
    mustChangePassword: `ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT 0`,
    kycStatus: `ALTER TABLE "User" ADD COLUMN "kycStatus" TEXT NOT NULL DEFAULT 'PENDING'`,
    kycNote: `ALTER TABLE "User" ADD COLUMN "kycNote" TEXT`,
    kycSubmittedAt: `ALTER TABLE "User" ADD COLUMN "kycSubmittedAt" DATETIME`,
    cnicFront: `ALTER TABLE "User" ADD COLUMN "cnicFront" TEXT`,
    cnicBack: `ALTER TABLE "User" ADD COLUMN "cnicBack" TEXT`,
    selfie: `ALTER TABLE "User" ADD COLUMN "selfie" TEXT`,
    walletBalance: `ALTER TABLE "User" ADD COLUMN "walletBalance" REAL NOT NULL DEFAULT 0`,
    withdrawUnlocked: `ALTER TABLE "User" ADD COLUMN "withdrawUnlocked" BOOLEAN NOT NULL DEFAULT 0`,
    currentLoanId: `ALTER TABLE "User" ADD COLUMN "currentLoanId" TEXT`,
    hiddenFromDashboardAt: `ALTER TABLE "User" ADD COLUMN "hiddenFromDashboardAt" DATETIME`,
    hiddenFromDashboardBy: `ALTER TABLE "User" ADD COLUMN "hiddenFromDashboardBy" TEXT`,
    hiddenFromDashboardReason: `ALTER TABLE "User" ADD COLUMN "hiddenFromDashboardReason" TEXT`,
  },
  Setting: {
    markupPercent: `ALTER TABLE "Setting" ADD COLUMN "markupPercent" REAL NOT NULL DEFAULT 5`,
    downPaymentPercent: `ALTER TABLE "Setting" ADD COLUMN "downPaymentPercent" REAL NOT NULL DEFAULT 12`,
    loyaltyDiscountPerLoan: `ALTER TABLE "Setting" ADD COLUMN "loyaltyDiscountPerLoan" REAL NOT NULL DEFAULT 1`,
    minMarkupPercent: `ALTER TABLE "Setting" ADD COLUMN "minMarkupPercent" REAL NOT NULL DEFAULT 2`,
    apkPath: `ALTER TABLE "Setting" ADD COLUMN "apkPath" TEXT`,
    apkVersion: `ALTER TABLE "Setting" ADD COLUMN "apkVersion" TEXT`,
    maintenanceMode: `ALTER TABLE "Setting" ADD COLUMN "maintenanceMode" BOOLEAN NOT NULL DEFAULT 0`,
    maintenanceMessage: `ALTER TABLE "Setting" ADD COLUMN "maintenanceMessage" TEXT`,
    chatEnabled: `ALTER TABLE "Setting" ADD COLUMN "chatEnabled" BOOLEAN NOT NULL DEFAULT 1`,
  },
  Loan: {
    markupPercent: `ALTER TABLE "Loan" ADD COLUMN "markupPercent" REAL NOT NULL DEFAULT 5`,
    termWeeks: `ALTER TABLE "Loan" ADD COLUMN "termWeeks" INTEGER NOT NULL DEFAULT 4`,
  },
  Payment: {
    loanId: `ALTER TABLE "Payment" ADD COLUMN "loanId" TEXT`,
    reviewedBy: `ALTER TABLE "Payment" ADD COLUMN "reviewedBy" TEXT`,
    reviewedAt: `ALTER TABLE "Payment" ADD COLUMN "reviewedAt" DATETIME`,
  },
  Withdrawal: {
    loanId: `ALTER TABLE "Withdrawal" ADD COLUMN "loanId" TEXT`,
    transactionId: `ALTER TABLE "Withdrawal" ADD COLUMN "transactionId" TEXT`,
  },
  KycSubmission: {
    hiddenFromDashboardAt: `ALTER TABLE "KycSubmission" ADD COLUMN "hiddenFromDashboardAt" DATETIME`,
    hiddenFromDashboardBy: `ALTER TABLE "KycSubmission" ADD COLUMN "hiddenFromDashboardBy" TEXT`,
    hiddenFromDashboardReason: `ALTER TABLE "KycSubmission" ADD COLUMN "hiddenFromDashboardReason" TEXT`,
  },
  Reel: {
    hiddenFromDashboardAt: `ALTER TABLE "Reel" ADD COLUMN "hiddenFromDashboardAt" DATETIME`,
    hiddenFromDashboardBy: `ALTER TABLE "Reel" ADD COLUMN "hiddenFromDashboardBy" TEXT`,
    hiddenFromDashboardReason: `ALTER TABLE "Reel" ADD COLUMN "hiddenFromDashboardReason" TEXT`,
  },
}

const CREATE_INDEXES: string[] = [
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone")`,
  `CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role")`,
  `CREATE INDEX IF NOT EXISTS "User_hiddenFromDashboardAt_idx" ON "User"("hiddenFromDashboardAt")`,
  `CREATE INDEX IF NOT EXISTS "Loan_userId_idx" ON "Loan"("userId")`,
  `CREATE INDEX IF NOT EXISTS "Loan_status_idx" ON "Loan"("status")`,
  `CREATE INDEX IF NOT EXISTS "Installment_loanId_idx" ON "Installment"("loanId")`,
  `CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId")`,
  `CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status")`,
  `CREATE INDEX IF NOT EXISTS "Payment_type_idx" ON "Payment"("type")`,
  `CREATE INDEX IF NOT EXISTS "KycSubmission_userId_idx" ON "KycSubmission"("userId")`,
  `CREATE INDEX IF NOT EXISTS "KycSubmission_status_idx" ON "KycSubmission"("status")`,
  `CREATE INDEX IF NOT EXISTS "KycSubmission_hiddenFromDashboardAt_idx" ON "KycSubmission"("hiddenFromDashboardAt")`,
  `CREATE INDEX IF NOT EXISTS "Withdrawal_userId_idx" ON "Withdrawal"("userId")`,
  `CREATE INDEX IF NOT EXISTS "Withdrawal_status_idx" ON "Withdrawal"("status")`,
  `CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "FinancialLedger_entryKey_key" ON "FinancialLedger"("entryKey")`,
  `CREATE INDEX IF NOT EXISTS "FinancialLedger_createdAt_idx" ON "FinancialLedger"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "FinancialLedger_direction_idx" ON "FinancialLedger"("direction")`,
  `CREATE INDEX IF NOT EXISTS "FinancialLedger_type_idx" ON "FinancialLedger"("type")`,
  `CREATE INDEX IF NOT EXISTS "FinancialLedger_userPhone_idx" ON "FinancialLedger"("userPhone")`,
  `CREATE INDEX IF NOT EXISTS "FinancialLedger_sourceId_idx" ON "FinancialLedger"("sourceId")`,
  `CREATE INDEX IF NOT EXISTS "Reel_order_idx" ON "Reel"("order")`,
  `CREATE INDEX IF NOT EXISTS "Reel_hiddenFromDashboardAt_idx" ON "Reel"("hiddenFromDashboardAt")`,
]

async function columnsOf(table: string): Promise<Set<string>> {
  try {
    const rows = (await db.$queryRawUnsafe(`PRAGMA table_info("${table}")`)) as Array<{ name: string }>
    return new Set(rows.map((r) => r.name))
  } catch {
    return new Set() // fall back to attempting all ALTERs (each is caught anyway)
  }
}

export async function ensureSchema(): Promise<void> {
  if (done) return
  // SQLite-only self-heal (shared hosting). On Postgres/other engines the schema
  // is created by `prisma db push`/`migrate deploy` at build time, and this raw
  // SQLite DDL (PRAGMA, DATETIME, BOOLEAN DEFAULT 0) would error — so skip it.
  if (!(process.env.DATABASE_URL || '').startsWith('file:')) {
    done = true
    return
  }
  try {
    for (const sql of CREATE_TABLES) {
      try { await db.$executeRawUnsafe(sql) } catch {}
    }
    for (const [table, cols] of Object.entries(COLUMNS)) {
      const existing = await columnsOf(table)
      for (const [col, ddl] of Object.entries(cols)) {
        if (!existing.has(col)) {
          try { await db.$executeRawUnsafe(ddl) } catch {}
        }
      }
    }
    for (const sql of CREATE_INDEXES) {
      try { await db.$executeRawUnsafe(sql) } catch {}
    }
  } catch {
    // never block startup on schema maintenance
  }
  done = true
}
