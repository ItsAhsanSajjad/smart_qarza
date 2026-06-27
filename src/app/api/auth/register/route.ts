import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { seedDefaults } from '@/lib/seed'
import {
  normalizePhone, isValidPhone, isValidPassword, isValidName, sanitizeName,
  SECURITY_QUESTIONS, isValidAnswer, normalizeAnswer, PHONE_HINT,
} from '@/lib/validation'

// POST /api/auth/register
// Body: { phone, password, confirmPassword, fullName?, securityQuestion, securityAnswer }
export async function POST(req: NextRequest) {
  await seedDefaults()
  const body = await req.json()
  const phone = normalizePhone(body.phone || '')
  const password = body.password
  const fullName = sanitizeName(typeof body.fullName === 'string' ? body.fullName : '')
  const securityQuestion = typeof body.securityQuestion === 'string' ? body.securityQuestion : ''
  const securityAnswer = body.securityAnswer

  if (!phone || !password) {
    return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: PHONE_HINT }, { status: 400 })
  }
  if (fullName && !isValidName(fullName)) {
    return NextResponse.json({ error: 'Please enter a valid name (letters only)' }, { status: 400 })
  }
  if (!isValidPassword(password)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }
  if (typeof body.confirmPassword === 'string' && body.confirmPassword !== password) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
  }
  if (!SECURITY_QUESTIONS.includes(securityQuestion)) {
    return NextResponse.json({ error: 'Please choose a security question' }, { status: 400 })
  }
  if (!isValidAnswer(securityAnswer)) {
    return NextResponse.json({ error: 'Please provide a security answer' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { phone } })
  if (existing) {
    return NextResponse.json({ error: 'Phone number already registered. Please login.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const answerHash = await bcrypt.hash(normalizeAnswer(securityAnswer), 10)
  const user = await db.user.create({
    data: {
      phone, password: passwordHash, fullName: fullName || null, role: 'USER',
      securityQuestion, securityAnswer: answerHash,
    },
  })

  // No session is created here — the user must log in after registering.
  return NextResponse.json({ ok: true, user: { id: user.id, phone: user.phone } })
}
