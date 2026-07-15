import { db } from '@/lib/db'

// Loan calculation helpers
export interface LoanPackage {
  amount: number
  markup: number
  totalRepayment: number
  weeklyInstallment: number
  downPayment: number
}

export function computeLoan(amount: number, markupPercent: number, downPaymentPercent: number): LoanPackage {
  const totalRepayment = amount + amount * (markupPercent / 100)
  return {
    amount,
    markup: markupPercent,
    totalRepayment,
    weeklyInstallment: totalRepayment / 4,
    downPayment: amount * (downPaymentPercent / 100),
  }
}

export async function getLoanPackages(): Promise<number[]> {
  const settings = await db.setting.findUnique({ where: { id: 'default' } })
  if (!settings) return [8000, 14000, 18500, 24000]
  try {
    return JSON.parse(settings.loanPackages) as number[]
  } catch {
    return [8000, 14000, 18500, 24000]
  }
}

export async function getSettings() {
  const s = await db.setting.findUnique({ where: { id: 'default' } })
  if (!s) {
    // fallback
    return {
      bankName: 'HBL - Habib Bank Ltd',
      accountTitle: 'Smart Qarz (Pvt) Ltd',
      accountNumber: '1234-5678-9012-3456',
      mobileAccount: '0300-1234567',
      markupPercent: 5,
      downPaymentPercent: 12,
      loanPackages: '[8000,14000,18500,24000]',
    }
  }
  return s
}

export function formatPKR(n: number): string {
  return 'PKR ' + Math.round(n).toLocaleString('en-PK')
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
}
