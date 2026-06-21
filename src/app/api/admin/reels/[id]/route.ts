import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

// DELETE /api/admin/reels/[id]
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const reel = await db.reel.findUnique({ where: { id } })
  if (!reel) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Remove the video file (best-effort).
  if (reel.videoPath.startsWith('/reels/')) {
    try { await fs.unlink(path.join(process.cwd(), 'public', reel.videoPath.replace(/^\//, ''))) } catch {}
  }
  await db.reel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
