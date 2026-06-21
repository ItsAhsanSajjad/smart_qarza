import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'

// GET /api/notifications -> list user notifications
export async function GET() {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const list = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json({ notifications: list })
}

// POST /api/notifications -> mark all as read
export async function POST() {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  })
  return NextResponse.json({ ok: true })
}
