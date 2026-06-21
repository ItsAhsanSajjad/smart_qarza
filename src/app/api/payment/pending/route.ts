import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'

// GET /api/payment/pending -> user's pending payment (if any)
export async function GET() {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const pending = await db.payment.findFirst({
    where: { userId: user.id, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  })

  // Also pull latest decision on previous payments (approved/rejected)
  const recent = await db.payment.findMany({
    where: { userId: user.id, status: { in: ['APPROVED', 'REJECTED'] } },
    orderBy: { reviewedAt: 'desc' },
    take: 5,
  })

  return NextResponse.json({ pending, recent })
}
