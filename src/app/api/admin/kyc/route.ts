import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// GET /api/admin/kyc?status=SUBMITTED|APPROVED|REJECTED|all
// Returns users with their full KYC details + document image paths for review.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const status = (new URL(req.url).searchParams.get('status') || 'SUBMITTED').toUpperCase()
  const where =
    status === 'ALL'
      ? { kycStatus: { in: ['SUBMITTED', 'APPROVED', 'REJECTED'] } }
      : { kycStatus: status }

  const submissions = await db.user.findMany({
    where: where as any,
    orderBy: { kycSubmittedAt: 'asc' },
    select: {
      id: true,
      fullName: true,
      phone: true,
      cnic: true,
      email: true,
      dob: true,
      address: true,
      cnicFront: true,
      cnicBack: true,
      selfie: true,
      kycStatus: true,
      kycNote: true,
      kycSubmittedAt: true,
      createdAt: true,
    },
    take: 200,
  })

  return NextResponse.json({ submissions })
}
