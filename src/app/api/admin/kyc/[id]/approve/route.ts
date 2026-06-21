import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// POST /api/admin/kyc/[id]/approve
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const user = await db.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await db.user.update({
    where: { id },
    data: { kycStatus: 'APPROVED', kycNote: null },
  })
  // Stamp the outcome on the latest submission record (audit trail)
  await db.kycSubmission.updateMany({
    where: { userId: id, status: 'SUBMITTED' },
    data: { status: 'APPROVED', reviewedBy: admin.id, reviewedAt: new Date() },
  })
  await db.notification.create({
    data: {
      userId: id,
      title: 'KYC Approved',
      message: 'Your KYC documents have been verified. You can now apply for a loan.',
      type: 'SUCCESS',
    },
  })
  return NextResponse.json({ ok: true })
}
