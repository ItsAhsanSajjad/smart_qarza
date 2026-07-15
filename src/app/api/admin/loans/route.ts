import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// GET /api/admin/loans -> list all loans
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''
  const requestedPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20))

  const rows = await db.loan.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, phone: true, fullName: true } },
      installments: { orderBy: { weekNumber: 'asc' } },
    },
  })

  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(requestedPage, pages)
  const loans = rows.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json({ loans, total, page, pageSize, pages })
}
