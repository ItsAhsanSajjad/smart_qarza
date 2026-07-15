import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import { recordApprovedPaymentInLedger } from '@/lib/financial-ledger'

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

  const reviewedAt = new Date()
  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id },
      data: {
        status: 'APPROVED',
        adminNote: note || null,
        reviewedBy: admin.id,
        reviewedAt,
      },
    })
    await recordApprovedPaymentInLedger(
      tx,
      { ...payment, status: 'APPROVED', adminNote: note || null, reviewedBy: admin.id, reviewedAt },
      admin,
    )

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
    } else if (payment.type === 'REPAYMENT') {
      // Loan repayment (partial or full). Accumulate approved repayments; when the
      // full repayable amount (principal + markup) is covered -> loan REPAID.
      // paid = approved INSTALLMENT + REPAYMENT payments (incl this one)
      const payAgg = await tx.payment.aggregate({
        where: { loanId: loan.id, type: { in: ['INSTALLMENT', 'REPAYMENT'] }, status: 'APPROVED' },
        _sum: { amount: true },
      })
      const paid = payAgg._sum.amount || 0
      const remaining = Math.max(0, loan.totalRepayment - paid)

      // Mark every installment whose cumulative threshold is now covered as PAID
      const weekly = loan.weeklyInstallment || loan.totalRepayment / 4
      const insts = await tx.installment.findMany({ where: { loanId: loan.id }, orderBy: { weekNumber: 'asc' } })
      for (const inst of insts) {
        if (inst.status !== 'PAID' && inst.weekNumber * weekly <= paid + 0.01) {
          await tx.installment.update({ where: { id: inst.id }, data: { status: 'PAID', paidAt: new Date() } })
        }
      }
      if (remaining <= 0.01) {
        await tx.loan.update({ where: { id: loan.id }, data: { status: 'REPAID' } })
        await tx.installment.updateMany({ where: { loanId: loan.id, status: { not: 'PAID' } }, data: { status: 'PAID', paidAt: new Date() } })
        // Loan done: clear the active loan and reset the per-user withdraw state so the
        // next loan starts clean (locked, empty wallet).
        await tx.user.update({ where: { id: payment.userId }, data: { currentLoanId: null, withdrawUnlocked: false, walletBalance: 0 } }).catch(() => {})
        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: 'Loan Fully Repaid 🎉',
            message: 'Your loan is fully repaid. Thank you! You can apply for a new loan now — at a lower interest rate as a returning customer.',
            type: 'SUCCESS',
          },
        })
      } else {
        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: 'Repayment Received',
            message: `Repayment of PKR ${Math.round(payment.amount).toLocaleString()} approved. Remaining balance: PKR ${Math.round(remaining).toLocaleString()}.`,
            type: 'SUCCESS',
          },
        })
      }
    }
  })

  return NextResponse.json({ ok: true })
}
