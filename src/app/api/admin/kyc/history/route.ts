import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/admin/kyc/history?q=search -> every KYC submission ever made (audit trail / all cases)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const searchParams = new URL(req.url).searchParams
  const q = (searchParams.get('q') || '').trim().toLowerCase()
  const requestedPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20))
  const rows = await db.kycSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, userId: true, phone: true, fullName: true, cnic: true, email: true,
      dob: true, address: true, cnicFront: true, cnicBack: true, selfie: true,
      status: true, adminNote: true, reviewedAt: true, createdAt: true,
    },
  })

  const searchable = (value: unknown) => String(value ?? '').toLowerCase()
  const timeValue = (value: unknown) => {
    const ms = value ? new Date(String(value)).getTime() : 0
    return Number.isFinite(ms) ? ms : 0
  }

  const filtered = rows
    .filter((row) => {
      if (!q) return true
      return [
        row.id,
        row.userId,
        row.phone,
        row.fullName,
        row.cnic,
        row.email,
        row.dob,
        row.address,
        row.status,
        row.adminNote,
        row.reviewedAt,
        row.createdAt,
      ].some((value) => searchable(value).includes(q))
    })
    .sort((a, b) => (timeValue(b.reviewedAt) || timeValue(b.createdAt)) - (timeValue(a.reviewedAt) || timeValue(a.createdAt)))

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(requestedPage, pages)
  const submissions = filtered.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json({ submissions, total, page, pageSize, pages }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
}
