import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// GET /api/admin/stats -> dashboard summary
export async function GET() {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const [
    totalUsers,
    totalLoans,
    pendingPayments,
    approvedPayments,
    rejectedPayments,
    totalDisbursed,
    totalReceived,
  ] = await Promise.all([
    db.user.count({ where: { role: 'USER' } }),
    db.loan.count(),
    db.payment.count({ where: { status: 'PENDING' } }),
    db.payment.count({ where: { status: 'APPROVED' } }),
    db.payment.count({ where: { status: 'REJECTED' } }),
    db.loan.aggregate({ _sum: { amount: true } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: 'APPROVED' } }),
  ])

  return NextResponse.json({
    totalUsers,
    totalLoans,
    pendingPayments,
    approvedPayments,
    rejectedPayments,
    totalDisbursed: totalDisbursed._sum.amount || 0,
    totalReceived: totalReceived._sum.amount || 0,
  })
}
