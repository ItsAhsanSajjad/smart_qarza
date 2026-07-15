import { Prisma, type Loan, type Payment, type User, type Withdrawal } from '@prisma/client'
import { db } from '@/lib/db'
import type { SessionUser } from '@/lib/auth'

type LedgerClient = Prisma.TransactionClient
type SnapshotUser = Pick<User, 'id' | 'phone' | 'fullName' | 'cnic' | 'email'>
type SnapshotLoan = Pick<Loan, 'id' | 'amount' | 'status' | 'totalRepayment'>
type PaymentSnapshot = Payment & { user?: SnapshotUser | null; loan?: SnapshotLoan | null }
type WithdrawalSnapshot = Withdrawal & { user?: SnapshotUser | null }
type ActorSnapshot = Pick<SessionUser, 'id' | 'phone'>

const snapshotUserSelect = {
  id: true,
  phone: true,
  fullName: true,
  cnic: true,
  email: true,
} satisfies Prisma.UserSelect

const snapshotLoanSelect = {
  id: true,
  amount: true,
  status: true,
  totalRepayment: true,
} satisfies Prisma.LoanSelect

function stringifyMetadata(value: unknown): string | null {
  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

function recordDate(reviewedAt: Date | null, fallback: Date): Date {
  return reviewedAt || fallback || new Date()
}

export async function recordApprovedPaymentInLedger(
  client: LedgerClient,
  payment: PaymentSnapshot,
  actor?: ActorSnapshot | null,
): Promise<void> {
  const user = payment.user
  await client.financialLedger.upsert({
    where: { entryKey: `payment:${payment.id}:approved` },
    update: {},
    create: {
      entryKey: `payment:${payment.id}:approved`,
      direction: 'INCOME',
      type: 'PAYMENT_APPROVED',
      amount: payment.amount,
      sourceId: payment.id,
      sourceType: 'Payment',
      userId: payment.userId,
      userPhone: user?.phone || null,
      userName: user?.fullName || null,
      userCnic: user?.cnic || null,
      userEmail: user?.email || null,
      loanId: payment.loanId || null,
      paymentType: payment.type,
      method: null,
      status: 'APPROVED',
      adminId: actor?.id || payment.reviewedBy || null,
      adminPhone: actor?.phone || null,
      note: payment.adminNote || null,
      metadata: stringifyMetadata({
        screenshotPath: payment.screenshotPath,
        loanAmount: payment.loan?.amount ?? null,
        loanStatus: payment.loan?.status ?? null,
        loanTotalRepayment: payment.loan?.totalRepayment ?? null,
      }),
      createdAt: recordDate(payment.reviewedAt, payment.createdAt),
    },
  })
}

export async function recordPaidWithdrawalInLedger(
  client: LedgerClient,
  withdrawal: WithdrawalSnapshot,
  actor?: ActorSnapshot | null,
): Promise<void> {
  const user = withdrawal.user
  await client.financialLedger.upsert({
    where: { entryKey: `withdrawal:${withdrawal.id}:paid` },
    update: {},
    create: {
      entryKey: `withdrawal:${withdrawal.id}:paid`,
      direction: 'EXPENSE',
      type: 'WITHDRAWAL_PAID',
      amount: withdrawal.amount,
      sourceId: withdrawal.id,
      sourceType: 'Withdrawal',
      userId: withdrawal.userId,
      userPhone: user?.phone || null,
      userName: user?.fullName || null,
      userCnic: user?.cnic || null,
      userEmail: user?.email || null,
      loanId: withdrawal.loanId || null,
      paymentType: null,
      method: withdrawal.method,
      status: 'PAID',
      adminId: actor?.id || withdrawal.reviewedBy || null,
      adminPhone: actor?.phone || null,
      note: withdrawal.adminNote || null,
      metadata: stringifyMetadata({
        bank: withdrawal.bank,
        accountNumber: withdrawal.accountNumber,
        accountTitle: withdrawal.accountTitle,
        transactionId: withdrawal.transactionId,
      }),
      createdAt: recordDate(withdrawal.reviewedAt, withdrawal.createdAt),
    },
  })
}

export async function snapshotUserFinancialRecords(userId: string, actor?: ActorSnapshot | null): Promise<void> {
  const [payments, withdrawals] = await Promise.all([
    db.payment.findMany({
      where: { userId, status: 'APPROVED' },
      include: {
        user: { select: snapshotUserSelect },
        loan: { select: snapshotLoanSelect },
      },
    }),
    db.withdrawal.findMany({
      where: { userId, status: 'PAID' },
      include: { user: { select: snapshotUserSelect } },
    }),
  ])

  for (const payment of payments) {
    await recordApprovedPaymentInLedger(db, payment, actor)
  }
  for (const withdrawal of withdrawals) {
    await recordPaidWithdrawalInLedger(db, withdrawal, actor)
  }
}

let backfillPromise: Promise<void> | null = null

async function backfillFinancialLedger(): Promise<void> {
  const [payments, withdrawals] = await Promise.all([
    db.payment.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: { select: snapshotUserSelect },
        loan: { select: snapshotLoanSelect },
      },
    }),
    db.withdrawal.findMany({
      where: { status: 'PAID' },
      include: { user: { select: snapshotUserSelect } },
    }),
  ])

  for (const payment of payments) {
    await recordApprovedPaymentInLedger(db, payment, null)
  }
  for (const withdrawal of withdrawals) {
    await recordPaidWithdrawalInLedger(db, withdrawal, null)
  }
}

export async function ensureFinancialLedgerBackfilled(): Promise<void> {
  if (!backfillPromise) {
    backfillPromise = backfillFinancialLedger().catch((error) => {
      backfillPromise = null
      throw error
    })
  }
  await backfillPromise
}
