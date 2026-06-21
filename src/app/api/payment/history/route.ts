import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'

// GET /api/payment/history -> user's all payments
export async function GET() {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const payments = await db.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ payments })
}
