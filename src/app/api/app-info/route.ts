import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/app-info -> public Android APK info for the landing download button
export async function GET() {
  const s = await db.setting.findUnique({ where: { id: 'default' }, select: { apkPath: true, apkVersion: true } })
  return NextResponse.json(
    { apkPath: s?.apkPath || null, apkVersion: s?.apkVersion || null },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } },
  )
}
