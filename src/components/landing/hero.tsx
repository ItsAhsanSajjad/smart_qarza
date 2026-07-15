'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import {
  ArrowRight, ShieldCheck, Zap, BadgeCheck, Wallet, CheckCircle2, Clock, Star,
} from 'lucide-react'
import { BrandLockup, TAGLINE_UR } from '@/components/brand/logo'
import { DownloadApp } from '@/components/landing/download-app'
import { CountUp, EASE } from '@/components/landing/motion'

const HEADLINE: { text: string; accent?: boolean }[][] = [
  [{ text: 'Quick' }, { text: '&' }, { text: 'Easy' }],
  [{ text: 'Digital', accent: true }, { text: 'Loans', accent: true }],
  [{ text: 'for' }, { text: 'Pakistan' }],
]

const CHIPS = ['No Collateral Required', 'Instant Approval', 'Flexible Repayment']

export function Hero() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const blobUp = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -70])
  const blobDown = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 90])
  let wordIndex = 0

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Ambient soft-green wash + grid */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <motion.div style={{ y: blobUp }} className="absolute -top-24 -left-16">
          <div className="geo-aurora geo-float w-[30rem] h-[30rem] bg-[oklch(0.8_0.12_160_/_0.5)]" />
        </motion.div>
        <motion.div style={{ y: blobDown }} className="absolute -top-10 right-[-8rem]">
          <div className="geo-aurora geo-float-slow geo-float-delay w-[26rem] h-[26rem] bg-[oklch(0.85_0.1_150_/_0.45)]" />
        </motion.div>
        <div className="geo-grid absolute inset-0" />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-12 pb-14 sm:pt-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-6 items-center">
          {/* LEFT — message */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex items-center gap-2 geo-glass text-primary text-xs font-semibold px-3.5 py-2 rounded-full mb-6"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> SECP-compliant · Trusted by 5M+ Pakistanis
            </motion.div>

            <h1 className="font-display text-[2.6rem] leading-[1.05] sm:text-6xl font-extrabold tracking-tight text-foreground">
              {HEADLINE.map((line, li) => (
                <span key={li} className="block">
                  {line.map((w) => {
                    const i = wordIndex++
                    return (
                      <motion.span
                        key={`${li}-${w.text}`}
                        initial={reduce ? false : { opacity: 0, y: '0.5em' }}
                        animate={reduce ? undefined : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.12 + i * 0.06, ease: EASE }}
                        className={`inline-block ${w.accent ? 'text-primary' : ''}`}
                      >
                        {w.text}&nbsp;
                      </motion.span>
                    )
                  })}
                </span>
              ))}
            </h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
              className="mt-5 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Get instant approval with Smart Qarz — your trusted financial partner. Register,
              complete KYC, and receive funds directly in your wallet.
            </motion.p>

            {/* Trust chips */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.66, ease: EASE }}
              className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2.5"
            >
              {CHIPS.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 ring-1 ring-primary/15">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {c}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.78, ease: EASE }}
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3"
            >
              <Link
                href="/app"
                className="geo-shine inline-flex items-center gap-2 sq-cta text-cta-foreground font-bold px-6 py-3.5 rounded-xl shadow-[0_16px_38px_-14px_oklch(0.68_0.19_47_/_0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Apply Now — Get Rs 50,000 <ArrowRight className="w-4 h-4" />
              </Link>
              <DownloadApp />
            </motion.div>

            {/* Rating line */}
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
              className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground"
            >
              <span className="flex">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
              </span>
              <span className="font-semibold text-foreground">4.9</span> · 12,000+ reviews on Google Play
            </motion.div>
          </div>

          {/* RIGHT — device */}
          <div className="lg:col-span-6 relative">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---- 3D-tilt phone mockup with count-up balance + trust badges ---- */
function PhoneMockup() {
  const reduce = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, { stiffness: 150, damping: 18 })
  const rotateY = useSpring(ry, { stiffness: 150, damping: 18 })

  const [balance, setBalance] = useState(50000)
  useEffect(() => {
    const load = () =>
      fetch('/api/settings', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          try {
            const p = JSON.parse(d?.settings?.loanPackages || '[]')
            if (Array.isArray(p) && p.length) setBalance(Math.max(...p))
          } catch {}
        })
        .catch(() => {})
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  const onMove = (e: React.PointerEvent) => {
    if (reduce) return
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 9)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 9)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
      className="relative flex justify-center"
      style={{ perspective: 1000 }}
    >
      <div className="absolute inset-0 -z-10 geo-gradient opacity-15 blur-3xl rounded-full" aria-hidden />

      {/* Floating SECP badge */}
      <div className="hidden sm:flex geo-glass absolute z-20 left-[-1rem] top-16 items-center gap-2 rounded-xl pl-2 pr-3.5 py-2 geo-float" aria-hidden>
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-primary/12 text-primary"><ShieldCheck className="w-4 h-4" /></span>
        <span className="text-xs font-bold text-foreground leading-tight">SECP<br /><span className="text-[10px] font-medium text-muted-foreground">Licensed</span></span>
      </div>
      {/* Floating approval-time badge */}
      <div className="hidden sm:flex geo-glass absolute z-20 right-[-0.5rem] bottom-24 items-center gap-2 rounded-xl pl-2 pr-3.5 py-2 geo-float-slow geo-float-delay" aria-hidden>
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-cta/15 text-cta"><Clock className="w-4 h-4" /></span>
        <span className="text-xs font-bold text-foreground leading-tight">5 Minutes<br /><span className="text-[10px] font-medium text-muted-foreground">Approval time</span></span>
      </div>

      <div className={reduce ? '' : 'geo-float-slow'}>
        <motion.div
          ref={cardRef}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d', minHeight: 0 }}
          className="phone-shell max-w-[320px]"
        >
          <div className="geo-gradient text-primary-foreground p-5 flex flex-col items-center text-center">
            <BrandLockup variant="onDark" size={28} />
            <div className="mt-2" dir="rtl">
              <span className="font-urdu text-sm font-semibold text-white/95">{TAGLINE_UR}</span>
            </div>
          </div>
          <div className="p-5">
            <div className="geo-gradient-emerald text-white rounded-2xl p-5 text-center shadow-lg">
              <div className="text-xs text-white/85">Loan Amount · Up to</div>
              <div className="text-3xl font-extrabold my-2 font-display">
                <CountUp key={balance} to={balance} prefix="Rs " duration={1.8} />
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs bg-white/15 px-2.5 py-1 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" /> Instant approval
              </div>
            </div>
            <button className="sq-cta text-cta-foreground w-full mt-4 py-3 rounded-xl font-bold text-sm">Choose Loan</button>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-secondary border border-border">
                <Wallet className="w-4 h-4 mx-auto text-primary" />
                <div className="mt-1.5 font-bold text-base text-foreground font-display"><CountUp to={5} suffix="M+" duration={2} /></div>
                <div className="text-muted-foreground">Customers</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary border border-border">
                <Zap className="w-4 h-4 mx-auto text-cta" />
                <div className="mt-1.5 font-bold text-base text-foreground inline-flex items-center gap-0.5 font-display">
                  <CountUp to={5} duration={1.4} /> min
                </div>
                <div className="text-muted-foreground">Approval</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Verified payout workflow
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
