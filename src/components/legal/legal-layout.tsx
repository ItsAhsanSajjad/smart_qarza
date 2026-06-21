import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/brand/logo'

export function LegalLayout({
  title,
  intro,
  updated,
  children,
}: {
  title: string
  intro?: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" aria-label="GEO Loan.pk home"><BrandLogo height={30} /></Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </header>

      <section className="geo-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-4 pt-12 pb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <div className="geo-rule-gold w-20 mx-auto mt-4" />
          {intro && <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">{intro}</p>}
          <p className="mt-4 text-xs text-muted-foreground">Last updated: {updated}</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-10">
        <div className="geo-card p-6 sm:p-8 text-sm leading-relaxed text-slate-700">{children}</div>
      </article>

      <footer className="border-t border-border bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} GEO Loan.pk (Pvt) Ltd ·{' '}
          <Link href="/privacy" className="hover:text-primary transition">Privacy Policy</Link> ·{' '}
          <Link href="/terms" className="hover:text-primary transition">Terms of Service</Link>
        </div>
      </footer>
    </main>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 pt-7 border-t border-border first:mt-0 first:pt-0 first:border-t-0">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}
