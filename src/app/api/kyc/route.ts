import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { isValidName, isValidCnic, formatCnic, sanitizeName, isValidEmail, normalizeEmail, isAdult, CNIC_HINT } from '@/lib/validation'

// POST /api/kyc
// Body: { fullName, cnic, email?, dob, address?, cnicFrontPath, cnicBackPath, selfiePath }
export async function POST(req: NextRequest) {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const body = await req.json()
  const { fullName, cnic, dob, address, cnicFrontPath, cnicBackPath, selfiePath } = body
  const email = normalizeEmail(body.email || '')

  if (!fullName || !cnic || !cnicFrontPath || !cnicBackPath || !selfiePath) {
    return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
  }
  if (!isValidName(fullName)) {
    return NextResponse.json({ error: 'Please enter your full name as on your CNIC' }, { status: 400 })
  }
  if (!isValidCnic(cnic)) {
    return NextResponse.json({ error: CNIC_HINT }, { status: 400 })
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }
  if (!isAdult(dob)) {
    return NextResponse.json({ error: 'You must be at least 18 years old, with a valid date of birth' }, { status: 400 })
  }

  // Ownership check: the uploaded document paths must belong to this user.
  const ownsAll = [cnicFrontPath, cnicBackPath, selfiePath].every(
    (p) => typeof p === 'string' && p.startsWith(`/api/files/kyc/${user.id}-`)
  )
  if (!ownsAll) {
    return NextResponse.json({ error: 'Invalid document references' }, { status: 400 })
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      fullName: sanitizeName(fullName),
      cnic: formatCnic(cnic),
      email: email || null,
      dob: dob || null,
      address: address || null,
      cnicFront: cnicFrontPath,
      cnicBack: cnicBackPath,
      selfie: selfiePath,
      kycStatus: 'SUBMITTED',
      kycNote: null,
      kycSubmittedAt: new Date(),
    },
  })

  // Save a full snapshot of THIS submission so every case is tracked (even re-submissions).
  await db.kycSubmission.create({
    data: {
      userId: user.id,
      phone: updated.phone,
      fullName: updated.fullName,
      cnic: updated.cnic,
      email: updated.email,
      dob: updated.dob,
      address: updated.address,
      cnicFront: cnicFrontPath,
      cnicBack: cnicBackPath,
      selfie: selfiePath,
      status: 'SUBMITTED',
    },
  })

  return NextResponse.json({ ok: true, user: updated })
}

// GET /api/kyc -> current KYC status
export async function GET() {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const u = await db.user.findUnique({
    where: { id: user.id },
    select: {
      fullName: true,
      cnic: true,
      email: true,
      dob: true,
      address: true,
      cnicFront: true,
      cnicBack: true,
      selfie: true,
      kycStatus: true,
    },
  })
  return NextResponse.json({ kyc: u })
}
