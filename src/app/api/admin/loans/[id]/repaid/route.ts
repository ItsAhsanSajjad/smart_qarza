import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// POST /api/admin/loans/[id]/repaid
// Marks a loan fully repaid: all installments PAID, loan -> REPAID. The user can
// then take a NEW loan, and their markup is reduced (loyalty reward) per repaid loan.
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const loan = await db.loan.findUnique({ where: { id } })
  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
  if (loan.status === 'REPAID') {
    return NextResponse.json({ error: 'Loan is already marked repaid' }, { status: 400 })
  }

  await db.$transaction(async (tx) => {
    const res = await tx.loan.updateMany({
      where: { id, status: { not: 'REPAID' } },
      data: { status: 'REPAID' },
    })
    if (res.count !== 1) throw new Error('ALREADY_REPAID')
    await tx.installment.updateMany({
      where: { loanId: id, status: { not: 'PAID' } },
      data: { status: 'PAID', paidAt: new Date() },
    })
    // Free the user to take a new loan again
    if (loan.userId) {
      await tx.user.update({ where: { id: loan.userId }, data: { currentLoanId: null } }).catch(() => {})
      await tx.notification.create({
        data: {
          userId: loan.userId,
          title: 'Loan Fully Repaid 🎉',
          message: 'Thank you! Your loan is fully repaid. You can apply for a new loan now — at a lower interest rate as a returning customer.',
          type: 'SUCCESS',
        },
      })
    }
  }).catch((e) => {
    if (e instanceof Error && e.message === 'ALREADY_REPAID') return
    throw e
  })

  return NextResponse.json({ ok: true })
}
