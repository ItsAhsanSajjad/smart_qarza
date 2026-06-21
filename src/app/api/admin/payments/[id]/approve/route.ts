import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// POST /api/admin/payments/[id]/approve
// Body: { note? }
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const { note } = await req.json().catch(() => ({ note: '' }))

  const payment = await db.payment.findUnique({
    where: { id },
    include: { loan: true, user: true },
  })
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }
  if (payment.status !== 'PENDING') {
    return NextResponse.json({ error: 'Payment already reviewed' }, { status: 400 })
  }

  // ============ APPROVE LOGIC ============
  // 1) Mark payment APPROVED
  // 2) Based on type, update loan status & wallet
  // 3) Notify user

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id },
      data: {
        status: 'APPROVED',
        adminNote: note || null,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    })

    if (!payment.loan) {
      // standalone payment (shouldn't happen for our flow)
      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: 'Payment Approved',
          message: `Your payment of PKR ${Math.round(payment.amount).toLocaleString()} has been approved.`,
          type: 'SUCCESS',
        },
      })
      return
    }

    const loan = payment.loan

    if (payment.type === 'DOWN_PAYMENT') {
      // Down payment approved -> advance to next step: 1st installment payment
      await tx.loan.update({
        where: { id: loan.id },
        data: { status: 'DOWN_PAYMENT_APPROVED' },
      })
      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: 'Down Payment Approved',
          message: `Your down payment of PKR ${Math.round(payment.amount).toLocaleString()} is verified. Please pay the 1st installment to unlock withdrawal.`,
          type: 'SUCCESS',
        },
      })
    } else if (payment.type === 'INSTALLMENT') {
      // Installment approved -> mark first installment paid + unlock withdraw
      await tx.loan.update({
        where: { id: loan.id },
        data: { status: 'INST1_APPROVED' },
      })
      const firstInst = await tx.installment.findFirst({
        where: { loanId: loan.id, weekNumber: 1 },
      })
      if (firstInst) {
        await tx.installment.update({
          where: { id: firstInst.id },
          data: { status: 'PAID', paidAt: new Date() },
        })
      }
      // Unlock withdraw
      await tx.user.update({
        where: { id: payment.userId },
        data: { withdrawUnlocked: true },
      })
      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: 'Withdrawal Unlocked!',
          message: `Your installment is approved. You can now withdraw PKR ${Math.round(loan.amount).toLocaleString()}.`,
          type: 'SUCCESS',
        },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
