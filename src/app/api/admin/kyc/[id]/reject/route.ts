import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// POST /api/admin/kyc/[id]/reject
// Body: { note? }
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const note = (typeof body.note === 'string' && body.note.trim()) || 'Your documents could not be verified.'

  const user = await db.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await db.user.update({
    where: { id },
    data: { kycStatus: 'REJECTED', kycNote: note },
  })
  // Stamp the outcome on the latest submission record (audit trail)
  await db.kycSubmission.updateMany({
    where: { userId: id, status: 'SUBMITTED' },
    data: { status: 'REJECTED', adminNote: note, reviewedBy: admin.id, reviewedAt: new Date() },
  })
  await db.notification.create({
    data: {
      userId: id,
      title: 'KYC Rejected',
      message: `Your KYC was rejected. Reason: ${note}. Please re-submit valid documents.`,
      type: 'WARNING',
    },
  })
  return NextResponse.json({ ok: true })
}
