import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// POST /api/admin/kyc/[id]/reset
// Marks an already-reviewed KYC as needing resubmission. If the user only chose
// a loan package and has not started payment yet, that draft loan is cleared too.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const note =
    (typeof body.note === 'string' && body.note.trim()) ||
    'Your KYC approval was reset. Please submit clear, correct documents again.'

  if (id === admin.id) {
    return NextResponse.json({ error: 'You cannot reset your own admin account' }, { status: 400 })
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, role: true, currentLoanId: true },
  })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.role !== 'USER') {
    return NextResponse.json({ error: 'Only customer accounts can be reset' }, { status: 400 })
  }

  let clearLoanId: string | null = null
  if (target.currentLoanId) {
    const loan = await db.loan.findUnique({
      where: { id: target.currentLoanId },
      select: { id: true, status: true },
    })
    if (loan && !['REPAID', 'REJECTED'].includes(loan.status)) {
      const paymentStarted = await db.payment.findFirst({
        where: { loanId: loan.id, status: { in: ['PENDING', 'APPROVED'] } },
        select: { id: true },
      })
      if (loan.status !== 'APPROVED' || paymentStarted) {
        return NextResponse.json(
          { error: 'KYC cannot be reset after payment or withdrawal has started. Delete the account if this was a wrong/test approval.' },
          { status: 400 },
        )
      }
      clearLoanId = loan.id
    }
  }

  await db.$transaction(async (tx) => {
    if (clearLoanId) {
      await tx.loan.delete({ where: { id: clearLoanId } })
    }

    await tx.user.update({
      where: { id },
      data: {
        kycStatus: 'REJECTED',
        kycNote: note,
        kycSubmittedAt: null,
        cnicFront: null,
        cnicBack: null,
        selfie: null,
        currentLoanId: null,
        walletBalance: 0,
        withdrawUnlocked: false,
      },
    })

    const latest = await tx.kycSubmission.findFirst({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    if (latest) {
      await tx.kycSubmission.update({
        where: { id: latest.id },
        data: { status: 'REJECTED', adminNote: note, reviewedBy: admin.id, reviewedAt: new Date() },
      })
    }

    await tx.notification.create({
      data: {
        userId: id,
        title: 'KYC Resubmission Required',
        message: note,
        type: 'WARNING',
      },
    })
  })

  return NextResponse.json({ ok: true })
}
