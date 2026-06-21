import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/reels -> public list of customer videos for the landing page
export async function GET() {
  const reels = await db.reel.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, title: true, subtitle: true, videoPath: true },
  })
  return NextResponse.json({ reels }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
}
