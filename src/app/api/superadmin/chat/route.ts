import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/session'
import { db } from '@/lib/db'
import { writeAudit, getClientIp } from '@/lib/audit'

// GET — current live-chat state.
export async function GET() {
  const sa = await requireSuperAdmin()
  if (sa instanceof NextResponse) return sa
  const s = await db.setting.findUnique({ where: { id: 'default' }, select: { chatEnabled: true } })
  return NextResponse.json({ enabled: s?.chatEnabled !== false })
}

// POST  Body: { enabled: boolean } — enable/disable the live-chat widget site-wide.
export async function POST(req: NextRequest) {
  const sa = await requireSuperAdmin()
  if (sa instanceof NextResponse) return sa
  const { enabled } = await req.json().catch(() => ({}))
  await db.setting.update({ where: { id: 'default' }, data: { chatEnabled: !!enabled } })
  await writeAudit({ actor: sa, action: 'TOGGLE_CHAT', detail: `enabled=${!!enabled}`, ip: getClientIp(req) })
  return NextResponse.json({ ok: true })
}
