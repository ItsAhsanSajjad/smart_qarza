import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession, SESSION_COOKIE } from './auth'
import type { SessionUser } from './auth'

export async function requireUser(): Promise<SessionUser | NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const user = await getSession(token)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return user
}

export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await requireUser()
  if (user instanceof NextResponse) return user
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return user
}

export async function getSessionFromRequest(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return await getSession(token)
}
