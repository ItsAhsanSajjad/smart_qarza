import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// GET /api/admin/kyc?status=SUBMITTED|APPROVED|REJECTED|all&q=search
// Returns users with their full KYC details + document image paths for review.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const searchParams = new URL(req.url).searchParams
  const status = (searchParams.get('status') || 'SUBMITTED').toUpperCase()
  const q = (searchParams.get('q') || '').trim().toLowerCase()
  const requestedPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20))
  const where =
    status === 'ALL'
      ? { kycStatus: { in: ['SUBMITTED', 'APPROVED', 'REJECTED'] } }
      : { kycStatus: status }

  const users = await db.user.findMany({
    where: where as any,
    orderBy: { kycSubmittedAt: 'desc' },
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
      kycSubmissions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { reviewedAt: true, createdAt: true, adminNote: true },
      },
    },
  })

  const searchable = (value: unknown) => String(value ?? '').toLowerCase()
  const timeValue = (value: unknown) => {
    const ms = value ? new Date(String(value)).getTime() : 0
    return Number.isFinite(ms) ? ms : 0
  }

  const filtered = users
    .map(({ kycSubmissions, ...user }) => {
      const latest = kycSubmissions[0]
      return {
        ...user,
        reviewedAt: latest?.reviewedAt ?? null,
        latestCaseCreatedAt: latest?.createdAt ?? null,
        latestAdminNote: latest?.adminNote ?? null,
      }
    })
    .filter((u) => {
      if (!q) return true
      return [
        u.id,
        u.fullName,
        u.phone,
        u.cnic,
        u.email,
        u.dob,
        u.address,
        u.kycStatus,
        u.kycNote,
        u.kycSubmittedAt,
        u.reviewedAt,
        u.createdAt,
        u.latestAdminNote,
      ].some((value) => searchable(value).includes(q))
    })
    .sort((a, b) => {
      const bTime = timeValue(b.reviewedAt) || timeValue(b.kycSubmittedAt) || timeValue(b.createdAt)
      const aTime = timeValue(a.reviewedAt) || timeValue(a.kycSubmittedAt) || timeValue(a.createdAt)
      return bTime - aTime
    })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(requestedPage, pages)
  const submissions = filtered.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json({ submissions, total, page, pageSize, pages })
}
