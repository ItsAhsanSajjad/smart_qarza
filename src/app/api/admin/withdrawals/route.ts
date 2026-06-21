import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// GET /api/admin/withdrawals?status=PENDING -> withdrawal requests with user details
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const status = req.nextUrl.searchParams.get('status') || ''
  const withdrawals = await db.withdrawal.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { fullName: true, phone: true, cnic: true } } },
  })

  return NextResponse.json({ withdrawals })
}
