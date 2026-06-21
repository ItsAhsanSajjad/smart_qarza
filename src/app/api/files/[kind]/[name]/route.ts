import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { readUpload, contentTypeForName, isSafeName, type UploadKind } from '@/lib/uploads'

// GET /api/files/<kind>/<name>
// Authorized access to sensitive uploads (KYC docs, payment screenshots).
// Rules: must be logged in; admins may view anything; a normal user may only
// view files they own (filenames are prefixed with their user id).
export async function GET(_req: NextRequest, ctx: { params: Promise<{ kind: string; name: string }> }) {
  const user = await requireUser()
  if (user instanceof NextResponse) return user

  const { kind, name } = await ctx.params
  if ((kind !== 'kyc' && kind !== 'payments') || !isSafeName(name)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Ownership check: our filenames start with "<userId>-".
  if (user.role !== 'ADMIN' && !name.startsWith(`${user.id}-`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const buf = await readUpload(kind as UploadKind, name)
  if (!buf) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': contentTypeForName(name),
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
    },
  })
}
