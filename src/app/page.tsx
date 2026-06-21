import Link from 'next/link'
import { Wallet, ArrowRight, Home as HomeIcon, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import { BrandLogo } from '@/components/brand/logo'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { CtaBanner } from '@/components/landing/cta-banner'
import { CustomerReels } from '@/components/landing/customer-reels'
import { Reveal } from '@/components/landing/motion'

export default function Home() {
  return (
    <main className="geo-surface min-h-screen">
      {/* Top Nav — clean white bar with the real wordmark */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <BrandLogo height={36} />
          <nav className="flex items-center gap-1.5">
            <Link
              href="/app"
              className="geo-shine inline-flex items-center gap-2 geo-gradient text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              Open App <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero (animated) */}
      <Hero />

      {/* Features (scroll-reveal) */}
      <Features />

      {/* CTA banner (animated gradient) */}
      <CtaBanner />

      {/* Our Satisfied Customers — videos uploaded by admin */}
      <CustomerReels />

      <footer className="geo-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <Reveal>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
              {/* Brand */}
              <div className="lg:col-span-5">
                <span className="inline-flex rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5">
                  <BrandLogo height={36} />
                </span>
                <p className="mt-4 text-sm leading-relaxed text-white/80 max-w-sm">
                  GEO Loan.pk is a secure digital lending platform — register, complete KYC, choose a
                  package, and manage your repayments, all in one place.
                </p>
                <div className="mt-5 flex items-center gap-2">
                  {[
                    { node: <Facebook className="w-4 h-4" />, label: 'Facebook', href: 'https://www.facebook.com/geoloan.pk' },
                    { node: <Instagram className="w-4 h-4" />, label: 'Instagram', href: 'https://www.instagram.com/geoloan.pk/' },
                    {
                      node: (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
                          <path d="M16.5 3c.31 2.13 1.58 3.62 3.5 3.86v2.43c-1.21.02-2.37-.36-3.5-1.02v6.48c0 3.3-2.68 5.75-5.86 5.75A5.64 5.64 0 0 1 5 14.86a5.62 5.62 0 0 1 6.86-5.5v2.55a3.06 3.06 0 0 0-1-.17 3.11 3.11 0 0 0 0 6.22 3.16 3.16 0 0 0 3.16-3.04V3h2.48Z" />
                        </svg>
                      ),
                      label: 'TikTok',
                      href: '#', // TODO: add TikTok profile link
                    },
                  ].map(({ node, label, href }) => {
                    const external = href.startsWith('http')
                    // No real URL yet — render a non-interactive icon, not a focusable no-op link
                    if (href === '#') {
                      return (
                        <span
                          key={label}
                          aria-hidden
                          title={`${label} (coming soon)`}
                          className="w-9 h-9 grid place-items-center rounded-lg bg-white/10 text-white/50 cursor-default"
                        >
                          {node}
                        </span>
                      )
                    }
                    return (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        title={label}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className="w-9 h-9 grid place-items-center rounded-lg bg-white/10 hover:bg-gold hover:text-gold-foreground hover:-translate-y-0.5 hover:scale-105 transition-all duration-300"
                      >
                        {node}
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* Quick links */}
              <div className="lg:col-span-3">
                <h3 className="text-sm font-semibold text-white">Quick Links</h3>
                <div className="w-9 h-0.5 rounded bg-gold mt-2 mb-4" />
                <ul className="space-y-2.5 text-sm text-white/80">
                  <li><Link href="/" className="inline-flex items-center gap-2 hover:text-gold hover:translate-x-0.5 transition-all"><HomeIcon className="w-3.5 h-3.5" /> Home</Link></li>
                  <li><Link href="/app" className="inline-flex items-center gap-2 hover:text-gold hover:translate-x-0.5 transition-all"><Wallet className="w-3.5 h-3.5" /> User App</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="lg:col-span-4">
                <h3 className="text-sm font-semibold text-white">Contact</h3>
                <div className="w-9 h-0.5 rounded bg-gold mt-2 mb-4" />
                <ul className="space-y-2.5 text-sm text-white/80">
                  <li>
                    <a href="mailto:info@geoloan.pk" className="inline-flex items-center gap-2 hover:text-gold hover:translate-x-0.5 transition-all">
                      <Mail className="w-3.5 h-3.5" /> info@geoloan.pk
                    </a>
                  </li>
                  <li className="inline-flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Lahore, Pakistan
                  </li>
                </ul>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/70">© {new Date().getFullYear()} GEO Loan.pk (Pvt) Ltd · All rights reserved.</p>
            <div className="flex items-center gap-5 text-xs text-white/70">
              <Link href="/privacy" className="hover:text-gold transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gold transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
