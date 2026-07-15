import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import { writePublicUpload } from '@/lib/uploads'

const ALLOWED = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_BYTES = 60 * 1024 * 1024 // 60MB

// GET /api/admin/reels -> all reels (admin)
export async function GET() {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin
  const reels = await db.reel.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
  return NextResponse.json({ reels })
}

// POST /api/admin/reels  (multipart: file, title, subtitle?)
export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof NextResponse) return admin

  const fd = await req.formData()
  const file = fd.get('file') as File | null
  const title = String(fd.get('title') || '').trim()
  const subtitle = String(fd.get('subtitle') || '').trim()

  if (!file) return NextResponse.json({ error: 'Please choose a video' }, { status: 400 })
  if (!title) return NextResponse.json({ error: 'Please add a title' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Only MP4, WebM, or MOV videos are allowed' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Video must be 60MB or smaller' }, { status: 400 })
  }

  const ext = file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4'
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`
  const videoPath = await writePublicUpload('reels', filename, Buffer.from(await file.arrayBuffer()), file.type)

  const order = await db.reel.count()
  const reel = await db.reel.create({
    data: { title, subtitle: subtitle || null, videoPath, order },
  })
  return NextResponse.json({ ok: true, reel })
}
