import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import { deletePublicUpload } from '@/lib/uploads'

// POST /api/admin/reels/[id] — delete a reel (POST not DELETE; host blocks DELETE)
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const { id } = await ctx.params
  const reel = await db.reel.findUnique({ where: { id } })
  if (!reel) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Remove the video file (best-effort — local path or Blob URL).
  await deletePublicUpload(reel.videoPath)
  await db.reel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
