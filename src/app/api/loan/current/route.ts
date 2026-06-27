import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'

// GET /api/loan/current -> user's current active loan + installments + pending payment
export async function GET() {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const u = await db.user.findUnique({ where: { id: user.id } })
  if (!u) return NextResponse.json({ loan: null })

  if (!u.currentLoanId) return NextResponse.json({ loan: null })

  const loan = await db.loan.findUnique({
    where: { id: u.currentLoanId },
    include: { installments: { orderBy: { weekNumber: 'asc' } } },
  })
  if (!loan) return NextResponse.json({ loan: null })

  // Self-heal: a PAID withdrawal means the loan is withdrawn. Prevents the user
  // getting stuck on the "Money Sent" screen (routing would loop on WITHDRAW_PENDING).
  if (loan.status === 'WITHDRAW_PENDING') {
    const paidW = await db.withdrawal.findFirst({ where: { loanId: loan.id, status: 'PAID' } })
    if (paidW) {
      await db.loan.update({ where: { id: loan.id }, data: { status: 'WITHDRAWN' } })
      loan.status = 'WITHDRAWN'
    }
  }

  // Self-heal stale unlock: withdrawUnlocked may only be true once THIS loan has reached
  // the installment stage. A leftover true from a previous (repaid) loan would route to the
  // old withdraw screen and let funds be withdrawn without paying this loan's fees.
  if (u.withdrawUnlocked && !['INST1_APPROVED', 'WITHDRAW_PENDING', 'WITHDRAWN'].includes(loan.status)) {
    await db.user.update({ where: { id: u.id }, data: { withdrawUnlocked: false } })
    u.withdrawUnlocked = false
  }

  // Pending payment for this loan?
  const pendingPayment = await db.payment.findFirst({
    where: { userId: user.id, loanId: loan.id, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  })

  // Single source of truth: amount paid = approved INSTALLMENT + REPAYMENT payments
  // (the down payment is a separate fee, not part of the repayable amount).
  const payAgg = await db.payment.aggregate({
    where: { loanId: loan.id, type: { in: ['INSTALLMENT', 'REPAYMENT'] }, status: 'APPROVED' },
    _sum: { amount: true },
  })
  const repaid = payAgg._sum.amount || 0
  const outstanding = Math.max(0, loan.totalRepayment - repaid)

  // Reflect repayment coverage on the installment tracker (a week shows PAID once
  // the cumulative paid amount covers it).
  const weekly = loan.weeklyInstallment || loan.totalRepayment / 4
  const loanWithCoverage = {
    ...loan,
    installments: loan.installments.map((i) => ({
      ...i,
      status: i.status === 'PAID' || i.weekNumber * weekly <= repaid + 0.01 ? 'PAID' : i.status,
    })),
  }

  return NextResponse.json({
    loan: loanWithCoverage,
    pendingPayment,
    repaid,
    outstanding,
    walletBalance: u.walletBalance,
    withdrawUnlocked: u.withdrawUnlocked,
  })
}
