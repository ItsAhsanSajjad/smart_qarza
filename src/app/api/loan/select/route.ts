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
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid loan amount' }, { status: 400 })
  }

  // Confirm KYC approved before allowing loan
  const u = await db.user.findUnique({ where: { id: user.id } })
  if (!u || u.kycStatus !== 'APPROVED') {
    return NextResponse.json({ error: 'Please complete KYC first' }, { status: 400 })
  }

  // Reject if user already has an active loan
  if (u.currentLoanId) {
    const existing = await db.loan.findUnique({ where: { id: u.currentLoanId } })
    if (existing && !['REPAID', 'REJECTED'].includes(existing.status)) {
      return NextResponse.json({ error: 'You already have an active loan' }, { status: 400 })
    }
  }

  const settings = await getSettings()

  // Only allow the loan amounts the admin has configured
  let packages: number[] = []
  try { packages = JSON.parse(settings.loanPackages) } catch {}
  if (packages.length > 0 && !packages.includes(Number(amount))) {
    return NextResponse.json({ error: 'Please choose a valid loan package' }, { status: 400 })
  }

  // Loyalty reward: customers who fully repaid past loans get a lower markup
  const repaidLoans = await db.loan.count({ where: { userId: user.id, status: 'REPAID' } })
  const discountPer = (settings as { loyaltyDiscountPerLoan?: number }).loyaltyDiscountPerLoan ?? 1
  const floor = (settings as { minMarkupPercent?: number }).minMarkupPercent ?? 2
  const effectiveMarkup = Math.max(floor, settings.markupPercent - repaidLoans * discountPer)

  const calc = computeLoan(amount, effectiveMarkup, settings.downPaymentPercent)

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
        create: Array.from({ length: 4 }, (_, i) => ({
          weekNumber: i + 1,
          amount: calc.weeklyInstallment,
          dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
          status: i === 0 ? 'PENDING' : 'PENDING',
        })),
      },
    },
  })

  // Deposit loan amount to wallet (per original flow: shown in balance after 2 min "processing")
  await db.user.update({
    where: { id: user.id },
    data: {
      currentLoanId: loan.id,
      walletBalance: calc.amount,
    },
  })

  // Notification
  await db.notification.create({
    data: {
      userId: user.id,
      title: 'Loan Approved',
      message: `Your loan of PKR ${Math.round(amount).toLocaleString()} has been credited to your wallet.`,
      type: 'SUCCESS',
    },
  })

  return NextResponse.json({ ok: true, loan })
}
