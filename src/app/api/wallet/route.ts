import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { isValidAccount, normalizeAccount, isValidName } from '@/lib/validation'

const WITHDRAW_METHODS = ['jazzcash', 'easypaisa', 'bank']

// GET /api/wallet -> user's wallet balance + withdraw status + latest withdrawal request
export async function GET() {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const u = await db.user.findUnique({
    where: { id: user.id },
    select: { walletBalance: true, withdrawUnlocked: true, currentLoanId: true },
  })
  if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const withdrawal = await db.withdrawal.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, amount: true, method: true, bank: true, accountNumber: true,
      accountTitle: true, status: true, transactionId: true, adminNote: true,
      createdAt: true, reviewedAt: true,
    },
  })

  return NextResponse.json({ ...u, withdrawal })
}

// POST /api/wallet -> create a withdrawal REQUEST (admin sends the money + a transaction id)
// Body: { method, bank?, accountNumber, accountTitle }
export async function POST(req: Request) {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const body = await req.json().catch(() => ({}))
  const method = String(body.method || '').toLowerCase()
  const bank = typeof body.bank === 'string' ? body.bank.trim() : ''
  const accountNumber = normalizeAccount(body.accountNumber || '')
  const accountTitle = typeof body.accountTitle === 'string' ? body.accountTitle.trim() : ''

  if (!method || !accountNumber || !accountTitle) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  if (!WITHDRAW_METHODS.includes(method)) {
    return NextResponse.json({ error: 'Please choose a valid withdrawal method' }, { status: 400 })
  }
  if (method === 'bank' && !bank) {
    return NextResponse.json({ error: 'Please select your bank' }, { status: 400 })
  }
  if (!isValidAccount(accountNumber)) {
    return NextResponse.json({ error: 'Enter a valid account number (10–34 characters)' }, { status: 400 })
  }
  if (!isValidName(accountTitle)) {
    return NextResponse.json({ error: 'Enter the account holder name' }, { status: 400 })
  }

  const u = await db.user.findUnique({ where: { id: user.id } })
  if (!u || !u.withdrawUnlocked) {
    return NextResponse.json({ error: 'Withdrawal not unlocked yet' }, { status: 400 })
  }
  if (u.walletBalance <= 0) {
    return NextResponse.json({ error: 'No balance to withdraw' }, { status: 400 })
  }

  // Block a second request while one is still pending
  const pending = await db.withdrawal.findFirst({ where: { userId: user.id, status: 'PENDING' } })
  if (pending) {
    return NextResponse.json({ error: 'A withdrawal request is already being processed' }, { status: 409 })
  }

  const amount = u.walletBalance

  // Create the request, HOLD the balance (set to 0) so it can't be requested twice,
  // and mark the loan as withdrawal-pending. Money is sent manually by admin.
  try {
    await db.$transaction(async (tx) => {
      // Atomic compare-and-set debit: only succeeds if the balance is STILL exactly `amount`
      // and withdrawal is unlocked. Two concurrent requests can't both hold the same funds.
      const debit = await tx.user.updateMany({
        where: { id: user.id, withdrawUnlocked: true, walletBalance: amount },
        data: { walletBalance: 0 },
      })
      if (debit.count !== 1) throw new Error('CONFLICT')
      // belt-and-suspenders: never allow two PENDING requests for one user
      const pendingCount = await tx.withdrawal.count({ where: { userId: user.id, status: 'PENDING' } })
      if (pendingCount > 0) throw new Error('CONFLICT')

      await tx.withdrawal.create({
        data: {
          userId: user.id,
          loanId: u.currentLoanId,
          amount,
          method,
          bank: method === 'bank' ? bank : null,
          accountNumber,
          accountTitle,
          status: 'PENDING',
        },
      })
      if (u.currentLoanId) {
        await tx.loan.update({ where: { id: u.currentLoanId }, data: { status: 'WITHDRAW_PENDING' } }).catch(() => {})
      }
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Withdrawal Requested',
          message: `Your withdrawal of PKR ${Math.round(amount).toLocaleString()} is being processed. You'll receive the Transaction ID once the money is sent.`,
          type: 'INFO',
        },
      })
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'CONFLICT') {
      return NextResponse.json({ error: 'A withdrawal request is already being processed' }, { status: 409 })
    }
    throw e
  }

  return NextResponse.json({ ok: true, status: 'PENDING', amount })
}
