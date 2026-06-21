import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// GET /api/admin/payments -> list payments with filter
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || '' // PENDING | APPROVED | REJECTED | ''
  const type = searchParams.get('type') || ''

  const payments = await db.payment.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, phone: true, fullName: true, cnic: true },
      },
      loan: { select: { id: true, amount: true } },
    },
    take: 200,
  })

  return NextResponse.json({ payments })
}
