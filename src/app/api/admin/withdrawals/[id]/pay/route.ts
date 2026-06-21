import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// POST /api/admin/withdrawals/[id]/pay
// Body: { transactionId } — admin has sent the money and records the bank/wallet Transaction ID
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const { transactionId } = await req.json().catch(() => ({ transactionId: '' }))
  const txn = String(transactionId || '').trim()
  if (txn.length < 4) {
    return NextResponse.json({ error: 'Enter the Transaction ID (min 4 characters)' }, { status: 400 })
  }

  const w = await db.withdrawal.findUnique({ where: { id } })
  if (!w) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
  if (w.status !== 'PENDING') {
    return NextResponse.json({ error: 'This request has already been processed' }, { status: 400 })
  }

  const dest = w.method === 'bank' ? (w.bank || 'bank') : w.method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'

  try {
    await db.$transaction(async (tx) => {
      // Atomic compare-and-set: only the first racer (PENDING -> PAID) wins. Guards
      // double-click / double-pay / pay-racing-reject from paying the user twice.
      const res = await tx.withdrawal.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: 'PAID', transactionId: txn, reviewedBy: admin.id, reviewedAt: new Date() },
      })
      if (res.count !== 1) throw new Error('ALREADY_PROCESSED')

      if (w.loanId) {
        await tx.loan.update({ where: { id: w.loanId }, data: { status: 'WITHDRAWN' } }).catch(() => {})
      }
      await tx.notification.create({
        data: {
          userId: w.userId,
          title: 'Withdrawal Sent',
          message: `PKR ${Math.round(w.amount).toLocaleString()} sent to your ${dest} account (${w.accountNumber}). Transaction ID: ${txn}`,
          type: 'SUCCESS',
        },
      })
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'ALREADY_PROCESSED') {
      return NextResponse.json({ error: 'This request has already been processed' }, { status: 400 })
    }
    throw e
  }

  return NextResponse.json({ ok: true })
}
