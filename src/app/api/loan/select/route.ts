import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { computeLoan, getSettings } from '@/lib/loan'

// POST /api/loan/select
// Body: { amount }
export async function POST(req: NextRequest) {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const { amount } = await req.json()
  const requestedAmount = Number(amount)
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return NextResponse.json({ error: 'Invalid loan amount' }, { status: 400 })
  }

  // Confirm KYC approved before allowing loan
  const u = await db.user.findUnique({ where: { id: user.id } })
  if (!u || u.kycStatus !== 'APPROVED') {
    return NextResponse.json({ error: 'Please complete KYC first' }, { status: 400 })
  }

  let editableLoan: { id: string; status: string } | null = null

  // Reject if user already has an active loan, except for the first wallet step
  // where no payment has been accepted/submitted yet. In that narrow window the
  // user is only changing their package choice, so update the existing loan.
  if (u.currentLoanId) {
    const existing = await db.loan.findUnique({ where: { id: u.currentLoanId } })
    if (existing && !['REPAID', 'REJECTED'].includes(existing.status)) {
      const paymentStarted = await db.payment.findFirst({
        where: { loanId: existing.id, status: { in: ['PENDING', 'APPROVED'] } },
        select: { id: true },
      })
      if (existing.status !== 'APPROVED' || paymentStarted) {
        return NextResponse.json({ error: 'You already have an active loan' }, { status: 400 })
      }
      editableLoan = { id: existing.id, status: existing.status }
    }
  }

  const settings = await getSettings()

  // Only allow the loan amounts the admin has configured
  let packages: number[] = []
  try { packages = JSON.parse(settings.loanPackages) } catch {}
  if (packages.length > 0 && !packages.includes(requestedAmount)) {
    return NextResponse.json({ error: 'Please choose a valid loan package' }, { status: 400 })
  }

  // Loyalty reward: customers who fully repaid past loans get a lower markup
  const repaidLoans = await db.loan.count({ where: { userId: user.id, status: 'REPAID' } })
  const discountPer = (settings as { loyaltyDiscountPerLoan?: number }).loyaltyDiscountPerLoan ?? 1
  const floor = (settings as { minMarkupPercent?: number }).minMarkupPercent ?? 2
  const effectiveMarkup = Math.max(floor, settings.markupPercent - repaidLoans * discountPer)

  const calc = computeLoan(requestedAmount, effectiveMarkup, settings.downPaymentPercent)

  const installments = Array.from({ length: 4 }, (_, i) => ({
    weekNumber: i + 1,
    amount: calc.weeklyInstallment,
    dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
    status: 'PENDING',
  }))

  if (editableLoan) {
    const loan = await db.$transaction(async (tx) => {
      const updatedLoan = await tx.loan.update({
        where: { id: editableLoan.id },
        data: {
          amount: calc.amount,
          markupPercent: calc.markup,
          totalRepayment: calc.totalRepayment,
          weeklyInstallment: calc.weeklyInstallment,
          downPayment: calc.downPayment,
          termWeeks: 4,
          status: 'APPROVED',
          installments: {
            deleteMany: {},
            create: installments,
          },
        },
        include: { installments: { orderBy: { weekNumber: 'asc' } } },
      })

      await tx.user.update({
        where: { id: user.id },
        data: {
          currentLoanId: updatedLoan.id,
          walletBalance: calc.amount,
          withdrawUnlocked: false,
        },
      })

      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Loan Amount Updated',
          message: `Your loan package is now PKR ${Math.round(requestedAmount).toLocaleString()}.`,
          type: 'INFO',
        },
      })

      return updatedLoan
    })

    return NextResponse.json({ ok: true, loan, updated: true })
  }

  // Create loan record + 4 installments
  const loan = await db.loan.create({
    data: {
      userId: user.id,
      amount: calc.amount,
      markupPercent: calc.markup,
      totalRepayment: calc.totalRepayment,
      weeklyInstallment: calc.weeklyInstallment,
      downPayment: calc.downPayment,
      termWeeks: 4,
      status: 'APPROVED', // KYC approved -> loan approved
      installments: {
        create: installments,
      },
    },
  })

  // Deposit loan amount to wallet (per original flow: shown in balance after 2 min "processing").
  // IMPORTANT: a new loan starts LOCKED — withdrawUnlocked must be false until the down
  // payment + 1st installment for THIS loan are approved. Carrying over a previous loan's
  // withdrawUnlocked=true would let the user withdraw without paying the fees and would
  // strand them on the old "Money Sent" screen.
  await db.user.update({
    where: { id: user.id },
    data: {
      currentLoanId: loan.id,
      walletBalance: calc.amount,
      withdrawUnlocked: false,
    },
  })

  // Notification
  await db.notification.create({
    data: {
      userId: user.id,
      title: 'Loan Approved',
      message: `Your loan of PKR ${Math.round(requestedAmount).toLocaleString()} has been credited to your wallet.`,
      type: 'SUCCESS',
    },
  })

  return NextResponse.json({ ok: true, loan })
}
