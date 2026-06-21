import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { normalizePhone, isValidPhone } from '@/lib/validation'

// POST /api/auth/forgot/question  { phone } -> { question }
// Returns the user's security question so they can answer it to reset the password.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const phone = normalizePhone(body.phone || '')
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { phone } })
  if (!user || !user.securityQuestion || !user.securityAnswer) {
    return NextResponse.json(
      { error: 'No recovery question is set for this account. Please contact support.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ ok: true, question: user.securityQuestion })
}
