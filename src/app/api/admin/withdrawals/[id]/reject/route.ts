import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// POST /api/admin/withdrawals/[id]/reject
// Body: { note } — rejects the request and REFUNDS the held balance to the user's wallet
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const { note } = await req.json().catch(() => ({ note: '' }))
  const reason = String(note || '').trim()

  const w = await db.withdrawal.findUnique({ where: { id } })
  if (!w) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
  if (w.status !== 'PENDING') {
    return NextResponse.json({ error: 'This request has already been processed' }, { status: 400 })
  }

  try {
    await db.$transaction(async (tx) => {
      // Atomic compare-and-set: only the first racer transitions PENDING -> REJECTED, so the
      // refund increment can run at most once (guards double-refund / reject-racing-pay).
      const res = await tx.withdrawal.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: 'REJECTED', adminNote: reason || null, reviewedBy: admin.id, reviewedAt: new Date() },
      })
      if (res.count !== 1) throw new Error('ALREADY_PROCESSED')

      // refund the held balance so the user can fix their details and re-request
      await tx.user.update({ where: { id: w.userId }, data: { walletBalance: { increment: w.amount } } })
      if (w.loanId) {
        await tx.loan.update({ where: { id: w.loanId }, data: { status: 'INST1_APPROVED' } }).catch(() => {})
      }
      await tx.notification.create({
        data: {
          userId: w.userId,
          title: 'Withdrawal Rejected',
          message: `Your withdrawal was rejected${reason ? `: ${reason}` : ''}. PKR ${Math.round(w.amount).toLocaleString()} has been returned to your wallet — please check your details and try again.`,
          type: 'WARNING',
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
