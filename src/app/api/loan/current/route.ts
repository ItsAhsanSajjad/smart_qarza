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

  // Pending payment for this loan?
  const pendingPayment = await db.payment.findFirst({
    where: { userId: user.id, loanId: loan.id, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    loan,
    pendingPayment,
    walletBalance: u.walletBalance,
    withdrawUnlocked: u.withdrawUnlocked,
  })
}
