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

  const users = await db.user.findMany({
    where: {
      role: role as any,
      ...(q
        ? {
            OR: [
              { phone: { contains: q } },
              { fullName: { contains: q } },
              { cnic: { contains: q } },
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
    take: 200,
  })

  return NextResponse.json({ users })
}
