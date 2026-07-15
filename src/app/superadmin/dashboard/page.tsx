'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, Power, KeyRound, RefreshCw, LogOut, Loader2, UserCog, LogIn, MessageCircle,
  ReceiptText, ArrowDownRight, ArrowUpRight, Search, ChevronLeft, ChevronRight,
} from 'lucide-react'

interface SaUser {
  id: string
  phone: string
  fullName: string | null
  cnic: string | null
  email: string | null
  role: string
  kycStatus: string
  walletBalance: number
  mustChangePassword: boolean
  createdAt: string
  _count: { loans: number; payments: number; withdrawals: number }
}
interface AuditRow {
  id: string
  actorPhone: string | null
  role: string | null
  action: string
  target: string | null
  detail: string | null
  ip: string | null
  createdAt: string
}
interface FinanceSummary {
  totalRevenue: number
  totalSpending: number
  netBalance: number
  revenueCount: number
  spendingCount: number
  ledgerCount: number
}
interface LedgerRow {
  id: string
  direction: 'INCOME' | 'EXPENSE'
  type: string
  amount: number
  sourceId: string | null
  sourceType: string
  userPhone: string | null
  userName: string | null
  userCnic: string | null
  userEmail: string | null
  loanId: string | null
  paymentType: string | null
  method: string | null
  status: string
  adminPhone: string | null
  note: string | null
  createdAt: string
}
interface PageMeta {
  page: number
  pageSize: number
  total: number
  pages: number
}

const emptyFinance: FinanceSummary = {
  totalRevenue: 0,
  totalSpending: 0,
  netBalance: 0,
  revenueCount: 0,
  spendingCount: 0,
  ledgerCount: 0,
}
const emptyPageMeta: PageMeta = { page: 1, pageSize: 20, total: 0, pages: 1 }

function money(value: number): string {
  return `PKR ${Math.round(value || 0).toLocaleString()}`
}

function financePages(current: number, pages: number): number[] {
  const start = Math.max(1, current - 2)
  const end = Math.min(pages, start + 4)
  const normalizedStart = Math.max(1, end - 4)
  return Array.from({ length: end - normalizedStart + 1 }, (_, i) => normalizedStart + i)
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [users, setUsers] = useState<SaUser[]>([])
  const [logs, setLogs] = useState<AuditRow[]>([])
  const [finance, setFinance] = useState<FinanceSummary>(emptyFinance)
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>([])
  const [financeMeta, setFinanceMeta] = useState<PageMeta>(emptyPageMeta)
  const [financeQuery, setFinanceQuery] = useState('')
  const [financeLoading, setFinanceLoading] = useState(false)
  const [maint, setMaint] = useState({ mode: false, message: '' })
  const [chatOn, setChatOn] = useState(true)
  const [tempPw, setTempPw] = useState<{ phone: string; pw: string } | null>(null)
  const [busy, setBusy] = useState('')

  const loadAll = useCallback(async () => {
    const [uR, mR, aR, cR] = await Promise.all([
      fetch('/api/superadmin/users', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/superadmin/maintenance', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/superadmin/audit', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/superadmin/chat', { cache: 'no-store' }).then((r) => r.json()),
    ])
    setUsers(uR.users || [])
    setMaint({ mode: !!mR.mode, message: mR.message || '' })
    setLogs(aR.logs || [])
    setChatOn(cR.enabled !== false)
  }, [])

  const loadFinance = useCallback(async (page = 1, query = '') => {
    setFinanceLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (query.trim()) params.set('q', query.trim())
      const r = await fetch(`/api/superadmin/finance?${params.toString()}`, { cache: 'no-store' })
      const d = await r.json().catch(() => ({}))
      if (r.ok) {
        setFinance(d.summary || emptyFinance)
        setLedgerRows(d.entries || [])
        setFinanceMeta({
          page: d.page || 1,
          pageSize: d.pageSize || 20,
          total: d.total || 0,
          pages: d.pages || 1,
        })
      }
    } finally {
      setFinanceLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/superadmin/me', { cache: 'no-store' }).then((r) => {
      if (!r.ok) {
        router.replace('/superadmin')
        return
      }
      setAuthed(true)
      loadAll()
      loadFinance(1, '')
    })
  }, [router, loadAll, loadFinance])

  async function saveMaintenance(enabled: boolean) {
    setBusy('maint')
    await fetch('/api/superadmin/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, message: maint.message }),
    })
    setMaint((m) => ({ ...m, mode: enabled }))
    setBusy('')
    loadAll()
  }

  async function saveChat(enabled: boolean) {
    setBusy('chat')
    await fetch('/api/superadmin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })
    setChatOn(enabled)
    setBusy('')
    loadAll()
  }

  async function resetPw(u: SaUser) {
    if (!confirm(`Reset password for ${u.phone}? They will get a new temporary password and must change it on next login.`)) return
    setBusy('reset' + u.id)
    const r = await fetch(`/api/superadmin/users/${u.id}/reset-password`, { method: 'POST' })
    const d = await r.json().catch(() => ({}))
    setBusy('')
    if (r.ok && d.tempPassword) {
      setTempPw({ phone: u.phone, pw: d.tempPassword })
      loadAll()
    } else {
      alert(d.error || 'Failed to reset')
    }
  }

  async function setRole(u: SaUser, role: string) {
    if (role === u.role) return
    setBusy('role' + u.id)
    const r = await fetch(`/api/superadmin/users/${u.id}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    setBusy('')
    if (!r.ok) {
      const d = await r.json().catch(() => ({}))
      alert(d.error || 'Failed to set role')
    }
    loadAll()
  }

  async function impersonate(u: SaUser) {
    if (!confirm(`Open ${u.phone}'s account as ${u.role}? You'll be signed in as them (this is logged). Use "Exit" to return.`)) return
    setBusy('imp' + u.id)
    const r = await fetch(`/api/superadmin/users/${u.id}/impersonate`, { method: 'POST' })
    const d = await r.json().catch(() => ({}))
    setBusy('')
    if (r.ok && d.redirect) window.location.href = d.redirect
    else alert(d.error || 'Failed to open account')
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/superadmin')
  }

  if (authed === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 grid place-items-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Super Admin</h1>
            <p className="text-xs text-slate-400">Full control panel — every action is logged</p>
          </div>
          <button onClick={() => { loadAll(); loadFinance(financeMeta.page, financeQuery) }} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs inline-flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={logout} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs inline-flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>

        {/* Temp password reveal */}
        {tempPw && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-300">Temporary password for {tempPw.phone}</p>
            <p className="text-xs text-slate-400 mt-1">Share it securely. Shown once — the user must change it on next login.</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-amber-200 text-sm">{tempPw.pw}</code>
              <button onClick={() => navigator.clipboard?.writeText(tempPw.pw)} className="text-xs text-slate-400 hover:text-slate-200">Copy</button>
              <button onClick={() => setTempPw(null)} className="text-xs text-slate-500 hover:text-slate-300 ml-auto">Dismiss</button>
            </div>
          </div>
        )}

        {/* Maintenance / kill switch */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Power className={`w-4 h-4 ${maint.mode ? 'text-red-400' : 'text-emerald-400'}`} />
            <h2 className="text-sm font-semibold">Maintenance / Shutdown</h2>
            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${maint.mode ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {maint.mode ? 'OFFLINE — only super admin' : 'ONLINE'}
            </span>
          </div>
          <input
            value={maint.message}
            onChange={(e) => setMaint((m) => ({ ...m, message: e.target.value }))}
            placeholder="Message shown to users while offline"
            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-amber-500 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={() => saveMaintenance(true)}
              disabled={busy === 'maint'}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60 text-xs font-semibold"
            >
              Take app offline
            </button>
            <button
              onClick={() => saveMaintenance(false)}
              disabled={busy === 'maint'}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-xs font-semibold"
            >
              Bring online
            </button>
          </div>
        </div>

        {/* Live chat toggle */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className={`w-4 h-4 ${chatOn ? 'text-emerald-400' : 'text-slate-500'}`} />
            <h2 className="text-sm font-semibold">Live Chat Widget</h2>
            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${chatOn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
              {chatOn ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 mb-3">Show or hide the Tawk.to chat button across the whole site.</p>
          <div className="flex gap-2">
            <button
              onClick={() => saveChat(true)}
              disabled={busy === 'chat' || chatOn}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold"
            >
              Enable chat
            </button>
            <button
              onClick={() => saveChat(false)}
              disabled={busy === 'chat' || !chatOn}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-xs font-semibold"
            >
              Disable chat
            </button>
          </div>
        </div>

        {/* Finance check and balance */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-amber-300" />
              <div>
                <h2 className="text-sm font-semibold">Finance Check & Balance</h2>
                <p className="text-[11px] text-slate-500">Permanent ledger snapshots for revenue, spending, and deleted-account history.</p>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                loadFinance(1, financeQuery)
              }}
              className="flex w-full gap-2 md:w-auto"
            >
              <div className="relative flex-1 md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  value={financeQuery}
                  onChange={(e) => setFinanceQuery(e.target.value)}
                  placeholder="Search name, CNIC, phone, email, source"
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 text-xs outline-none transition focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={financeLoading}
                className="h-10 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
              >
                Search
              </button>
            </form>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                <ArrowDownRight className="h-4 w-4" />
                Total Revenue
              </div>
              <p className="mt-2 text-xl font-bold text-emerald-100">{money(finance.totalRevenue)}</p>
              <p className="mt-1 text-[11px] text-emerald-300/70">{finance.revenueCount.toLocaleString()} approved payment records</p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-red-300">
                <ArrowUpRight className="h-4 w-4" />
                Total Spending
              </div>
              <p className="mt-2 text-xl font-bold text-red-100">{money(finance.totalSpending)}</p>
              <p className="mt-1 text-[11px] text-red-300/70">{finance.spendingCount.toLocaleString()} paid withdrawal records</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                <ReceiptText className="h-4 w-4" />
                Net Balance
              </div>
              <p className="mt-2 text-xl font-bold text-amber-100">{money(finance.netBalance)}</p>
              <p className="mt-1 text-[11px] text-amber-300/70">{finance.ledgerCount.toLocaleString()} ledger records retained</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">Finance Ledger</h3>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                {financeMeta.total.toLocaleString()} matching records
              </span>
              {financeLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-xs">
                <thead className="text-slate-500">
                  <tr className="border-b border-slate-800">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 pr-3">CNIC / Email</th>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3">Admin</th>
                    <th className="py-2 pr-3">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800/60 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap text-slate-400">{new Date(row.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${row.direction === 'INCOME' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                          {row.direction === 'INCOME' ? 'REVENUE' : 'SPENDING'}
                        </span>
                        <div className="mt-1 text-slate-500">{row.paymentType || row.method || row.type}</div>
                      </td>
                      <td className={`py-2 pr-3 whitespace-nowrap font-semibold ${row.direction === 'INCOME' ? 'text-emerald-300' : 'text-red-300'}`}>
                        {money(row.amount)}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="text-slate-200">{row.userName || 'No name'}</div>
                        <div className="font-mono text-[11px] text-slate-500">{row.userPhone || '-'}</div>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="font-mono text-[11px] text-slate-400">{row.userCnic || '-'}</div>
                        <div className="text-[11px] text-slate-500">{row.userEmail || '-'}</div>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="text-slate-400">{row.sourceType}</div>
                        <div className="max-w-[150px] truncate font-mono text-[11px] text-slate-600">{row.sourceId || row.loanId || '-'}</div>
                      </td>
                      <td className="py-2 pr-3 font-mono text-[11px] text-slate-500">{row.adminPhone || '-'}</td>
                      <td className="py-2 pr-3 max-w-[180px] text-slate-500">{row.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!financeLoading && ledgerRows.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-600">No finance ledger records found.</p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Page {financeMeta.page} of {financeMeta.pages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => loadFinance(Math.max(1, financeMeta.page - 1), financeQuery)}
                  disabled={financeLoading || financeMeta.page <= 1}
                  className="h-8 rounded-lg border border-slate-700 px-2 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous finance page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {financePages(financeMeta.page, financeMeta.pages).map((p) => (
                  <button
                    key={p}
                    onClick={() => loadFinance(p, financeQuery)}
                    disabled={financeLoading}
                    className={`h-8 min-w-8 rounded-lg border px-2 text-xs transition ${p === financeMeta.page ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => loadFinance(Math.min(financeMeta.pages, financeMeta.page + 1), financeQuery)}
                  disabled={financeLoading || financeMeta.page >= financeMeta.pages}
                  className="h-8 rounded-lg border border-slate-700 px-2 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next finance page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserCog className="w-4 h-4 text-slate-300" />
            <h2 className="text-sm font-semibold">All Accounts ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-slate-500 text-left">
                <tr className="border-b border-slate-800">
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">KYC</th>
                  <th className="py-2 pr-3">Wallet</th>
                  <th className="py-2 pr-3">Loans</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/60">
                    <td className="py-2 pr-3 font-mono">{u.phone}</td>
                    <td className="py-2 pr-3">{u.fullName || '—'}</td>
                    <td className="py-2 pr-3">
                      {u.role === 'SUPER_ADMIN' ? (
                        <span className="text-amber-400 font-semibold">SUPER_ADMIN</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => setRole(u, e.target.value)}
                          disabled={busy === 'role' + u.id}
                          className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </td>
                    <td className="py-2 pr-3">{u.kycStatus}</td>
                    <td className="py-2 pr-3">{Math.round(u.walletBalance).toLocaleString()}</td>
                    <td className="py-2 pr-3">{u._count.loans}</td>
                    <td className="py-2 pr-3">
                      {u.role !== 'SUPER_ADMIN' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => impersonate(u)}
                            disabled={busy === 'imp' + u.id}
                            className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium inline-flex items-center gap-1 disabled:opacity-60"
                          >
                            <LogIn className="w-3 h-3" /> Login as
                          </button>
                          <button
                            onClick={() => resetPw(u)}
                            disabled={busy === 'reset' + u.id}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 inline-flex items-center gap-1 disabled:opacity-60"
                          >
                            <KeyRound className="w-3 h-3" /> Reset PW
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit log */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-sm font-semibold mb-3">Audit Log (latest {logs.length})</h2>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {logs.map((l) => (
              <div key={l.id} className="text-[11px] text-slate-400 border-b border-slate-800/40 py-1.5 flex flex-wrap gap-x-3">
                <span className="text-slate-500">{new Date(l.createdAt).toLocaleString()}</span>
                <span className="text-amber-400 font-medium">{l.action}</span>
                {l.target && <span>→ {l.target}</span>}
                {l.detail && <span className="text-slate-500">{l.detail}</span>}
                {l.actorPhone && <span className="ml-auto text-slate-600">{l.actorPhone}{l.ip ? ` · ${l.ip}` : ''}</span>}
              </div>
            ))}
            {logs.length === 0 && <p className="text-xs text-slate-600">No actions logged yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
