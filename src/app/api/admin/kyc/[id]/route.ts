import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import { snapshotUserFinancialRecords } from '@/lib/financial-ledger'

// POST /api/admin/kyc/[id] -> hide a user account from admin dashboards.
// Records stay in the database for super-admin audit and finance checks.
// Uses POST (not DELETE) — the shared host blocks PUT/DELETE methods.
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  if (id === admin.id) {
    return NextResponse.json({ error: 'You cannot hide your own admin account' }, { status: 400 })
  }
  const user = await db.user.findUnique({ where: { id }, select: { role: true, hiddenFromDashboardAt: true } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Cannot hide an admin account' }, { status: 400 })
  }
  if (user.hiddenFromDashboardAt) {
    return NextResponse.json({ ok: true, alreadyHidden: true })
  }

  await snapshotUserFinancialRecords(id, admin)
  await db.$transaction(async (tx) => {
    const hiddenAt = new Date()
    await tx.user.update({
      where: { id },
      data: {
        hiddenFromDashboardAt: hiddenAt,
        hiddenFromDashboardBy: admin.id,
        hiddenFromDashboardReason: 'Hidden from admin dashboard',
      },
    })
    await tx.kycSubmission.updateMany({
      where: { userId: id, hiddenFromDashboardAt: null },
      data: {
        hiddenFromDashboardAt: hiddenAt,
        hiddenFromDashboardBy: admin.id,
        hiddenFromDashboardReason: 'User hidden from admin dashboard',
      },
    })
  })
  return NextResponse.json({ ok: true })
}
