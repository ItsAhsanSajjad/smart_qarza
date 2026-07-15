import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireSuperAdmin } from '@/lib/session'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { ensureSchema } from '@/lib/ensure-schema'
import { ensureFinancialLedgerBackfilled } from '@/lib/financial-ledger'

const DEFAULT_PAGE_SIZE = 20

function pageParam(value: string | null, fallback: number): number {
  const parsed = Number(value || '')
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.floor(parsed)
}

// GET /api/superadmin/finance
// Durable revenue/spending ledger for super-admin checks and balances.
export async function GET(req: NextRequest) {
  const sa = await requireSuperAdmin()
  if (sa instanceof NextResponse) return sa

  await ensureSchema()
  await ensureFinancialLedgerBackfilled()

  const params = req.nextUrl.searchParams
  const page = pageParam(params.get('page'), 1)
  const pageSize = Math.min(100, pageParam(params.get('pageSize'), DEFAULT_PAGE_SIZE))
  const q = (params.get('q') || '').trim()
  const direction = (params.get('direction') || '').trim().toUpperCase()
  const type = (params.get('type') || '').trim().toUpperCase()

  const where: Prisma.FinancialLedgerWhereInput = {
    ...(direction === 'INCOME' || direction === 'EXPENSE' ? { direction } : {}),
    ...(type ? { type } : {}),
    ...(q
      ? {
          OR: [
            { userName: { contains: q } },
            { userPhone: { contains: q } },
            { userCnic: { contains: q } },
            { userEmail: { contains: q } },
            { sourceId: { contains: q } },
            { paymentType: { contains: q } },
            { method: { contains: q } },
            { adminPhone: { contains: q } },
            { note: { contains: q } },
          ],
        }
      : {}),
  }

  const [income, expense, total, entries] = await Promise.all([
    db.financialLedger.aggregate({ where: { direction: 'INCOME' }, _sum: { amount: true }, _count: true }),
    db.financialLedger.aggregate({ where: { direction: 'EXPENSE' }, _sum: { amount: true }, _count: true }),
    db.financialLedger.count({ where }),
    db.financialLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  await writeAudit({ actor: sa, action: 'VIEW_FINANCE_LEDGER', detail: `${entries.length}/${total} records` })

  const totalRevenue = income._sum.amount || 0
  const totalSpending = expense._sum.amount || 0

  return NextResponse.json({
    summary: {
      totalRevenue,
      totalSpending,
      netBalance: totalRevenue - totalSpending,
      revenueCount: income._count,
      spendingCount: expense._count,
      ledgerCount: income._count + expense._count,
    },
    entries,
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  })
}
