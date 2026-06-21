import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

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
  const dir = path.join(process.cwd(), 'public', 'reels')
  await fs.mkdir(dir, { recursive: true })
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()))

  const order = await db.reel.count()
  const reel = await db.reel.create({
    data: { title, subtitle: subtitle || null, videoPath: `/reels/${filename}`, order },
  })
  return NextResponse.json({ ok: true, reel })
}
