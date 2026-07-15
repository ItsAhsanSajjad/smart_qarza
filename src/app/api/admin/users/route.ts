import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// GET /api/admin/users -> paginated users
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const role = searchParams.get('role') || 'USER'
  const requestedPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20))

  const rows = await db.user.findMany({
    where: {
      role: role as any,
      ...(q
        ? {
            OR: [
              { phone: { contains: q } },
              { fullName: { contains: q } },
              { cnic: { contains: q } },
              { email: { contains: q } },
              { address: { contains: q } },
              { kycStatus: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      phone: true,
      fullName: true,
      cnic: true,
      kycStatus: true,
      walletBalance: true,
      withdrawUnlocked: true,
      currentLoanId: true,
      createdAt: true,
    },
  })

  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(requestedPage, pages)
  const users = rows.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json({ users, total, page, pageSize, pages })
}
