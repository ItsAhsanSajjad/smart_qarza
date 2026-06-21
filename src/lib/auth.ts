import { createHmac, timingSafeEqual, randomBytes } from 'crypto'
import { db } from '@/lib/db'

// Session = signed, expiring token: base64url(payload) + "." + base64url(HMAC-SHA256)
// The HMAC is keyed on SESSION_SECRET so tokens cannot be forged client-side.
// Role is NOT stored in the token — it is read fresh from the DB on every request.

const SESSION_COOKIE = 'qlp_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, in seconds

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (secret && secret.length >= 16) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET env var is required in production (min 16 chars).')
  }
  // Dev-only fallback so local runs don't crash. NEVER used in production.
  console.warn('[auth] SESSION_SECRET not set — using insecure dev fallback. Set SESSION_SECRET before deploying.')
  return 'dev-only-insecure-secret-change-me'
}

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export interface SessionUser {
  id: string
  phone: string
  role: 'USER' | 'ADMIN'
  fullName?: string | null
}

export async function createSession(userId: string): Promise<string> {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + SESSION_MAX_AGE * 1000, n: randomBytes(6).toString('hex') })
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export async function getSession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  try {
    const dot = token.lastIndexOf('.')
    if (dot < 0) return null
    const payload = token.slice(0, dot)
    const mac = token.slice(dot + 1)

    // Verify integrity before trusting any field.
    if (!safeEqual(mac, sign(payload))) return null

    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      uid: string
      exp: number
    }
    if (!uid || !exp || Date.now() > exp) return null

    const user = await db.user.findUnique({ where: { id: uid } })
    if (!user) return null
    return {
      id: user.id,
      phone: user.phone,
      role: user.role as 'USER' | 'ADMIN',
      fullName: user.fullName,
    }
  } catch {
    return null
  }
}

// Centralized cookie options so login/register/logout stay consistent.
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod
    path: '/',
    maxAge: SESSION_MAX_AGE,
  }
}

export { SESSION_COOKIE, SESSION_MAX_AGE }
