'use client'

import Link from 'next/link'
import {
  Users, Banknote, Star, Clock, Zap, ShieldCheck, ReceiptText, Lock,
  Smartphone, FileText, Wallet, CheckCircle2, AlertTriangle, Phone, ArrowRight,
  BadgeCheck, HeartHandshake,
} from 'lucide-react'
import { Reveal, RevealGroup, RevealItem, CountUp } from '@/components/landing/motion'

/* ============================================================
   Testimonial strip (masked names — social proof)
   ============================================================ */
const REVIEWS = [
  { name: 'Ali***', text: 'Excellent loan service, very fast!' },
  { name: 'Usman***', text: 'Approved in minutes. Highly recommend.' },
  { name: 'Bilal***', text: 'Simple process, no hassle at all.' },
  { name: 'Hamza***', text: 'Got my funds the same day.' },
  { name: 'Sana***', text: 'Transparent fees, no hidden charges.' },
  { name: 'Ahmad***', text: 'Trusted and professional team.' },
  { name: 'Zara***', text: 'Best digital loan app in Pakistan.' },
  { name: 'Farhan***', text: 'Repayment options are very flexible.' },
]
function initials(n: string) { return n.replace(/\*/g, '').slice(0, 2).toUpperCase() }

export function TestimonialStrip() {
  const row = [...REVIEWS, ...REVIEWS]
  return (
    <section className="border-y border-border bg-card/60">
      <div
        className="relative flex overflow-hidden py-4"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}
      >
        <div className="sq-marquee flex items-center gap-4 whitespace-nowrap px-3 shrink-0">
          {row.map((r, i) => (
            <div key={i} className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-3 py-1.5 shrink-0">
              <span className="grid place-items-center w-7 h-7 rounded-full bg-primary/12 text-primary text-[11px] font-bold shrink-0">{initials(r.name)}</span>
              <span className="text-xs font-semibold text-foreground">{r.name}</span>
              <span className="flex text-gold">{[0, 1, 2, 3, 4].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}</span>
              <span className="text-xs text-muted-foreground">{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Borrow Responsibly banner (regulatory trust)
   ============================================================ */
export function ResponsibleBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 -mt-2 mb-12">
      <div className="rounded-2xl border-l-4 border-warning bg-warning/10 px-5 py-4 sm:px-7 sm:py-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-foreground shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-foreground">Borrow Responsibly</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Digital nano loans are short-term loans with high markup rates and additional charges.
              Please understand the risk of over-indebtedness before borrowing. Only take a loan you
              can comfortably repay within the agreed timeframe, and always read the terms and
              conditions carefully before applying. <span className="font-semibold text-foreground">Your financial well-being is our priority.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Stats row
   ============================================================ */
const STATS = [
  { icon: Users, to: 5, suffix: 'M+', label: 'Happy Customers' },
  { icon: Banknote, prefix: 'PKR ', to: 500, suffix: 'B+', label: 'Loans Disbursed' },
  { icon: Star, to: 4, suffix: '.9', label: 'App Rating' },
  { icon: Clock, to: 5, suffix: ' min', label: 'Average Approval' },
]
export function StatsRow() {
  return (
    <section className="max-w-6xl mx-auto px-4 mb-16">
      <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <RevealItem key={s.label}>
            <div className="geo-card p-6 text-center">
              <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-3">
                <s.icon className="w-5 h-5" />
              </span>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} duration={2} />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

/* ============================================================
   Why Choose Smart Qarz
   ============================================================ */
const WHY = [
  { icon: Zap, title: 'Lightning Fast', text: 'Get approved in minutes, not days. Our digital-first process keeps things moving quickly.' },
  { icon: ShieldCheck, title: 'No Collateral', text: 'No guarantor or collateral required. We keep borrowing simple and accessible.' },
  { icon: ReceiptText, title: 'Transparent Fees', text: 'No hidden charges. You see the cost clearly before you submit your application.' },
  { icon: Lock, title: 'Bank-Level Security', text: 'Your data is protected with strong encryption and careful privacy controls.' },
]
export function WhyChoose() {
  return (
    <section id="why" className="max-w-6xl mx-auto px-4 py-4 mb-8">
      <Reveal className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Why Choose Smart Qarz?</h2>
        <div className="geo-rule-gold mt-3 w-24 mx-auto" />
        <p className="mt-3 text-muted-foreground">Fast, secure and reliable loan services.</p>
      </Reveal>
      <RevealGroup className="grid sm:grid-cols-2 gap-5">
        {WHY.map((f) => (
          <RevealItem key={f.title}>
            <div className="geo-card geo-hover-card group h-full p-6 flex items-start gap-4">
              <span className="inline-grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105">
                <f.icon className="w-5 h-5" />
              </span>
              <div>
                <div className="font-display font-bold text-lg text-foreground">{f.title}</div>
                <div className="text-muted-foreground text-sm mt-1 leading-relaxed">{f.text}</div>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

/* ============================================================
   About — trusted financial partner (+ mini app screens)
   ============================================================ */
const SCREENS = [
  { icon: Wallet, title: 'Get the Cash You Need', sub: 'Up to Rs. 50,000' },
  { icon: FileText, title: 'Quick 3-Step Application', sub: 'Fast & simple' },
  { icon: ReceiptText, title: 'Flexible Repayment', sub: 'Choose your terms' },
  { icon: BadgeCheck, title: 'Boost Your Credit Limit', sub: 'Repay on time' },
]
export function AboutTrust() {
  return (
    <section id="about" className="bg-secondary/40 border-y border-border py-16">
      <div className="max-w-6xl mx-auto px-4">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 mb-4">About Us</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Your Trusted Financial Partner in Pakistan</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Smart Qarz gives you the convenience of applying for a personal loan whenever you need it.
            Anyone who meets the basic requirements can apply — fill in your details online, submit
            your documents, and enjoy a more convenient borrowing experience.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {['100% Digital Process', 'Quick Approval in Minutes', 'Secure & Transparent'].map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground px-3 py-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> {b}
              </span>
            ))}
          </div>
        </Reveal>

        <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SCREENS.map((s) => (
            <RevealItem key={s.title}>
              <div className="rounded-2xl border border-border bg-card overflow-hidden geo-hover-card h-full">
                <div className="geo-gradient text-primary-foreground p-3 text-center text-xs font-semibold">Smart Qarz</div>
                <div className="p-4 flex flex-col items-center text-center gap-2">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary"><s.icon className="w-5 h-5" /></span>
                  <div className="font-semibold text-sm text-foreground leading-tight">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                  <div className="w-full mt-1 space-y-1.5">
                    <div className="h-2 rounded-full bg-muted" />
                    <div className="h-2 rounded-full bg-muted w-4/5 mx-auto" />
                  </div>
                  <span className="mt-1 text-[10px] sq-cta text-cta-foreground px-2.5 py-1 rounded-full font-semibold">Apply</span>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-6">
          <div className="rounded-2xl geo-gradient text-primary-foreground p-6 sm:p-8 flex items-center gap-4 flex-wrap justify-center text-center sm:text-left sm:justify-start">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/15 ring-1 ring-white/25 shrink-0"><HeartHandshake className="w-7 h-7" /></span>
            <div>
              <div className="font-display text-xl font-bold">Zero Harassment · Dignified Experience</div>
              <p className="text-sm text-white/85 mt-1 max-w-2xl">We never harass or threaten our customers. Recovery is respectful, private, and always within the law.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ============================================================
   Simple Loan Process
   ============================================================ */
const STEPS = [
  { n: 1, icon: Smartphone, title: 'Download & Register', text: 'Download the Smart Qarz app and create your account in seconds.' },
  { n: 2, icon: FileText, title: 'Fill Application', text: 'Provide your basic information and upload the required documents.' },
  { n: 3, icon: Wallet, title: 'Get Instant Approval', text: 'Receive funds directly in your bank account or wallet within minutes.' },
]
export function LoanProcess() {
  return (
    <section id="process" className="max-w-6xl mx-auto px-4 py-16">
      <Reveal className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Simple Loan Process</h2>
        <div className="geo-rule-gold mt-3 w-24 mx-auto" />
        <p className="mt-3 text-muted-foreground">Get your loan in just 3 easy steps.</p>
      </Reveal>
      <RevealGroup className="grid md:grid-cols-3 gap-5">
        {STEPS.map((s) => (
          <RevealItem key={s.n}>
            <div className="geo-card geo-hover-card h-full p-6 relative">
              <span className="absolute top-5 right-5 font-display text-5xl font-extrabold text-primary/10">{s.n}</span>
              <span className="inline-grid place-items-center w-12 h-12 rounded-2xl geo-gradient text-primary-foreground shadow-md">
                <s.icon className="w-5 h-5" />
              </span>
              <div className="font-display font-bold text-lg text-foreground mt-4">{s.title}</div>
              <div className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{s.text}</div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

/* ============================================================
   Privacy Policy CTA
   ============================================================ */
export function PrivacyCta() {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-16">
      <Reveal>
        <div className="geo-card text-center p-8 sm:p-10">
          <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4"><Lock className="w-7 h-7" /></span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">Privacy Policy</h2>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Your data security and privacy are our top priorities. Learn how we protect your information.</p>
          <Link href="/privacy" className="geo-shine inline-flex items-center gap-2 sq-cta text-cta-foreground font-bold px-6 py-3 rounded-xl mt-6 hover:-translate-y-0.5 transition-all duration-300">
            View Privacy Policy <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

/* ============================================================
   Official Outbound Call Numbers (anti-scam trust)
   NOTE: replace CALL_NUMBERS with your real authorised numbers.
   ============================================================ */
const CALL_NUMBERS = [
  '0328-3283290', '0328-3283296', '0328-3283299', '0328-3283292', '0328-3283294',
  '0328-3283266', '0328-3283268', '0328-3283260', '0328-3283298', '0328-3283295',
  '0328-3283272', '0328-3283288', '0328-3283266', '0328-3283284', '0328-3283275',
  '0328-3283290', '0328-3283286', '0328-3283279', '0328-3283264', '0328-3283268',
  '0327-6162096', '0327-7657226', '0327-8562096', '0327-7037234', '0327-4038048',
]
export function CallNumbers() {
  return (
    <section className="bg-secondary/40 border-y border-border py-16">
      <div className="max-w-5xl mx-auto px-4">
        <Reveal className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-3"><Phone className="w-6 h-6" /></span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">Official Outbound Call Numbers</h2>
          <p className="mt-2 text-muted-foreground">These are our authorised call numbers. Please verify before answering.</p>
        </Reveal>
        <Reveal>
          <div className="geo-card p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {CALL_NUMBERS.map((num, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
                  <span className="grid place-items-center w-6 h-6 rounded-md bg-primary/10 text-primary text-[10px] font-bold shrink-0">{i + 1}</span>
                  <span className="font-mono text-xs text-foreground tracking-tight">{num}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="mt-4 rounded-xl border-l-4 border-warning bg-warning/10 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-warning-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">If you receive a call from a number not listed above claiming to be from Smart Qarz, please report it immediately. We never ask for your password or OTP.</p>
        </div>
      </div>
    </section>
  )
}
