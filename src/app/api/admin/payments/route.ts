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
  const q = (searchParams.get('q') || '').trim().toLowerCase()
  const requestedPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20))

  const rows = await db.payment.findMany({
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
  })

  const searchable = (value: unknown) => String(value ?? '').toLowerCase()
  const filtered = rows.filter((p) => {
    if (!q) return true
    return [
      p.id,
      p.type,
      p.amount,
      p.status,
      p.adminNote,
      p.createdAt,
      p.reviewedAt,
      p.user.id,
      p.user.phone,
      p.user.fullName,
      p.user.cnic,
      p.loan?.id,
      p.loan?.amount,
    ].some((value) => searchable(value).includes(q))
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(requestedPage, pages)
  const payments = filtered.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json({ payments, total, page, pageSize, pages })
}
