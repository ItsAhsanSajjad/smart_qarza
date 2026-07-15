import Link from 'next/link'
import { Wallet, ArrowRight, Home as HomeIcon, Mail, MapPin, Phone, Facebook, Instagram, Play, Calculator } from 'lucide-react'
import { BrandLogo } from '@/components/brand/logo'
import { Hero } from '@/components/landing/hero'
import { CtaBanner } from '@/components/landing/cta-banner'
import { CustomerReels } from '@/components/landing/customer-reels'
import { Reveal } from '@/components/landing/motion'
import {
  TestimonialStrip, ResponsibleBanner, StatsRow, WhyChoose,
  AboutTrust, LoanProcess, PrivacyCta, CallNumbers,
} from '@/components/landing/sections'

function GooglePlayBadge({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/app"
      aria-label="Get it on Google Play"
      className={`inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-1.5 hover:bg-slate-800 transition ${className}`}
    >
      <Play className="w-4 h-4 fill-current" />
      <span className="leading-none text-left">
        <span className="block text-[8px] uppercase tracking-wide text-white/70">Get it on</span>
        <span className="block text-xs font-semibold">Google Play</span>
      </span>
    </Link>
  )
}

const NAV_LINKS = [
  { label: 'About Us', href: '#about' },
  { label: 'Loan Process', href: '#process' },
  { label: 'Privacy Policy', href: '/privacy' },
]

export default function Home() {
  return (
    <main className="geo-surface min-h-screen">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <BrandLogo height={32} />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-primary transition">{l.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold">
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground">EN</span>
              <span className="px-2 py-0.5 font-urdu text-muted-foreground">اردو</span>
            </span>
            <Link href="/app" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition">
              <Calculator className="w-3.5 h-3.5" /> Loan Calculator
            </Link>
            <GooglePlayBadge />
          </div>
        </div>
      </header>

      <Hero />
      <TestimonialStrip />
      <ResponsibleBanner />
      <StatsRow />
      <WhyChoose />
      <AboutTrust />
      <LoanProcess />
      <CustomerReels />
      <CtaBanner />
      <PrivacyCta />
      <CallNumbers />

      {/* Footer — dark band */}
      <footer className="relative bg-[oklch(0.2_0.02_205)] text-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <Reveal>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
              {/* Brand */}
              <div className="lg:col-span-5">
                <span className="inline-flex rounded-xl bg-white px-3 py-2 shadow-sm">
                  <BrandLogo height={30} />
                </span>
                <p className="mt-4 text-sm leading-relaxed text-white/70 max-w-sm">
                  Easy and convenient online loans for Pakistanis. Register, complete KYC, choose a
                  package, and manage your repayments — all in one place.
                </p>
                <div className="mt-5 flex items-center gap-2">
                  {[
                    { node: <Facebook className="w-4 h-4" />, label: 'Facebook', href: 'https://www.facebook.com/smartqarz.pk' },
                    { node: <Instagram className="w-4 h-4" />, label: 'Instagram', href: 'https://www.instagram.com/smartqarz.pk/' },
                  ].map(({ node, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 grid place-items-center rounded-lg bg-white/10 text-white hover:bg-primary hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {node}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="lg:col-span-3">
                <h3 className="text-sm font-semibold text-white">Quick Links</h3>
                <div className="w-9 h-0.5 rounded bg-cta mt-2 mb-4" />
                <ul className="space-y-2.5 text-sm text-white/70">
                  <li><Link href="#about" className="inline-flex items-center gap-2 hover:text-cta transition"><HomeIcon className="w-3.5 h-3.5" /> About Us</Link></li>
                  <li><Link href="#process" className="inline-flex items-center gap-2 hover:text-cta transition"><Wallet className="w-3.5 h-3.5" /> Loan Process</Link></li>
                  <li><Link href="/privacy" className="inline-flex items-center gap-2 hover:text-cta transition"><HomeIcon className="w-3.5 h-3.5" /> Privacy Policy</Link></li>
                  <li><Link href="/app" className="inline-flex items-center gap-2 hover:text-cta transition"><Wallet className="w-3.5 h-3.5" /> Download App</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="lg:col-span-4">
                <h3 className="text-sm font-semibold text-white">Contact Us</h3>
                <div className="w-9 h-0.5 rounded bg-cta mt-2 mb-4" />
                <ul className="space-y-2.5 text-sm text-white/70">
                  <li>
                    <a href="mailto:info@smartqarz.pk" className="inline-flex items-center gap-2 hover:text-cta transition">
                      <Mail className="w-3.5 h-3.5" /> info@smartqarz.pk
                    </a>
                  </li>
                  <li className="inline-flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> 0300-1234567</li>
                  <li className="inline-flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5" /> Lahore, Pakistan</li>
                </ul>
                <div className="mt-4"><GooglePlayBadge /></div>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/60">© {new Date().getFullYear()} Smart Qarz (Pvt) Ltd · All rights reserved.</p>
            <div className="flex items-center gap-5 text-xs text-white/60">
              <Link href="/privacy" className="hover:text-cta transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-cta transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
