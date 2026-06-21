import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/admin/kyc/history -> every KYC submission ever made (audit trail / all cases)
export async function GET() {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const submissions = await db.kycSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true, userId: true, phone: true, fullName: true, cnic: true, email: true,
      dob: true, address: true, cnicFront: true, cnicBack: true, selfie: true,
      status: true, adminNote: true, reviewedAt: true, createdAt: true,
    },
  })

  return NextResponse.json({ submissions }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
}
