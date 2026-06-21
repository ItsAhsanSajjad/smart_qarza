import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { isAllowedImage, writeUpload, MAX_UPLOAD_BYTES, sniffImage, validateImage, extForFormat } from '@/lib/uploads'

const ALLOWED_TYPES = ['DOWN_PAYMENT', 'INSTALLMENT', 'OTHER']

// POST /api/payment/upload  (multipart/form-data)
// Fields: file, type (DOWN_PAYMENT | INSTALLMENT | OTHER), amount, loanId?
// Stores the screenshot OUTSIDE public/ and creates a PENDING Payment record.
export async function POST(req: NextRequest) {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string
  const amountStr = formData.get('amount') as string
  const loanId = (formData.get('loanId') as string) || null

  if (!file || !type || !amountStr) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 })
  }
  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }
  if (!isAllowedImage(file.type)) {
    return NextResponse.json({ error: 'Only JPG/PNG/WEBP images allowed' }, { status: 400 })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'File size exceeds 5MB' }, { status: 400 })
  }

  // If a loanId is supplied it must belong to the requesting user.
  if (loanId) {
    const loan = await db.loan.findUnique({ where: { id: loanId } })
    if (!loan || loan.userId !== user.id) {
      return NextResponse.json({ error: 'Invalid loan' }, { status: 400 })
    }
  }

  // Once-only guard: block a second submission while one is already under review.
  const alreadyPending = await db.payment.findFirst({
    where: { userId: user.id, loanId, type, status: 'PENDING' },
  })
  if (alreadyPending) {
    return NextResponse.json({ error: 'A payment is already under review. Please wait for it to be checked.' }, { status: 409 })
  }

  // Authoritative content check (not the client MIME): must be a real image.
  const buffer = Buffer.from(await file.arrayBuffer())
  const imgErr = validateImage(buffer)
  if (imgErr) {
    return NextResponse.json({ error: imgErr }, { status: 400 })
  }

  const ext = extForFormat(sniffImage(buffer)!.format)
  const filename = `${user.id}-${type}-${Date.now()}.${ext}`
  await writeUpload('payments', filename, buffer)

  const payment = await db.payment.create({
    data: {
      userId: user.id,
      loanId,
      type,
      amount,
      screenshotPath: `/api/files/payments/${filename}`,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ ok: true, payment })
}
