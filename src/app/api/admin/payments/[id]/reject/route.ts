import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// POST /api/admin/payments/[id]/reject
// Body: { note }
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const { note } = await req.json().catch(() => ({ note: 'Rejected by admin' }))

  const payment = await db.payment.findUnique({ where: { id } })
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }
  if (payment.status !== 'PENDING') {
    return NextResponse.json({ error: 'Payment already reviewed' }, { status: 400 })
  }

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote: note || 'Rejected by admin',
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    })
    await tx.notification.create({
      data: {
        userId: payment.userId,
        title: 'Payment Rejected',
        message: `Your payment of PKR ${Math.round(payment.amount).toLocaleString()} was rejected. Reason: ${note || 'Invalid screenshot'}. Please re-upload a valid screenshot.`,
        type: 'WARNING',
      },
    })
  })

  return NextResponse.json({ ok: true })
}
