import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// GET /api/admin/loans -> list all loans
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''

  const loans = await db.loan.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, phone: true, fullName: true } },
      installments: { orderBy: { weekNumber: 'asc' } },
    },
    take: 200,
  })

  return NextResponse.json({ loans })
}
