import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { isAllowedImage, writeUpload, MAX_UPLOAD_BYTES, sniffImage, validateImage, extForFormat } from '@/lib/uploads'

// POST /api/upload/kyc  (multipart/form-data, field name = "file")
// Stores the image OUTSIDE public/ and returns an authorized URL:
//   { path: "/api/files/kyc/<file>" }
export async function POST(req: NextRequest) {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }
  if (!isAllowedImage(file.type)) {
    return NextResponse.json({ error: 'Only JPG/PNG/WEBP images allowed' }, { status: 400 })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'File size exceeds 5MB' }, { status: 400 })
  }

  // Authoritative check: inspect the real file content (not the client MIME),
  // and require a reasonably sized photo so blank/tiny junk is rejected.
  const buffer = Buffer.from(await file.arrayBuffer())
  const imgErr = validateImage(buffer, { minW: 400, minH: 250 })
  if (imgErr) {
    return NextResponse.json({ error: imgErr }, { status: 400 })
  }

  // Extension is derived from the sniffed format, not the client file name.
  const ext = extForFormat(sniffImage(buffer)!.format)
  const filename = `${user.id}-${Date.now()}.${ext}`
  await writeUpload('kyc', filename, buffer)

  return NextResponse.json({ path: `/api/files/kyc/${filename}` })
}
