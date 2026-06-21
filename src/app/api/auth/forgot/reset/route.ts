import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'
import { normalizePhone, isValidPhone, isValidPassword, isValidAnswer, normalizeAnswer } from '@/lib/validation'

// POST /api/auth/forgot/reset  { phone, answer, password, confirmPassword }
// Verifies the security answer and sets a new password (no OTP). Logs the user in.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const phone = normalizePhone(body.phone || '')
  const answer = body.answer
  const password = body.password

  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 })
  }
  if (!isValidAnswer(answer)) {
    return NextResponse.json({ error: 'Please answer the security question' }, { status: 400 })
  }
  if (!isValidPassword(password)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }
  if (typeof body.confirmPassword === 'string' && body.confirmPassword !== password) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { phone } })
  if (!user || !user.securityAnswer) {
    return NextResponse.json({ error: 'No recovery question is set for this account.' }, { status: 404 })
  }

  const ok = await bcrypt.compare(normalizeAnswer(answer), user.securityAnswer)
  if (!ok) {
    return NextResponse.json({ error: 'Incorrect answer to the security question' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await db.user.update({ where: { id: user.id }, data: { password: passwordHash } })

  // Log them straight in after a successful reset.
  const token = await createSession(user.id)
  const res = NextResponse.json({
    user: { id: user.id, phone: user.phone, role: user.role, fullName: user.fullName },
  })
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return res
}
