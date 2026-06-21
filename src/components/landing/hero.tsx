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
  ArrowRight, ShieldCheck, Zap, Home as HomeIcon, Users, BadgeCheck,
  Wallet, Lock, CheckCircle2,
} from 'lucide-react'
import { BrandLockup, TAGLINE_UR, TAGLINE_EN } from '@/components/brand/logo'
import { DownloadApp } from '@/components/landing/download-app'
import { CountUp, EASE } from '@/components/landing/motion'

const HEADLINE: { text: string; accent?: boolean }[][] = [
  [{ text: 'A' }, { text: 'brighter', accent: true }, { text: 'future', accent: true }, { text: 'starts' }],
  [{ text: 'with' }, { text: 'one' }, { text: 'easy' }, { text: 'loan.' }],
]

export function Hero() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })

  // Soft parallax on the ambient background blobs
  const blobUp = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -70])
  const blobDown = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 90])

  let wordIndex = 0

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Ambient background: aurora blobs + faint grid */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {/* outer = framer parallax (y); inner = CSS float — each element owns ONE transform */}
        <motion.div style={{ y: blobUp }} className="absolute -top-24 -left-16">
          <div className="geo-aurora geo-float w-[28rem] h-[28rem] bg-[oklch(0.8_0.12_150_/_0.55)]" />
        </motion.div>
        <motion.div style={{ y: blobDown }} className="absolute -top-10 right-[-6rem]">
          <div className="geo-aurora geo-float-slow geo-float-delay w-[26rem] h-[26rem] bg-[oklch(0.86_0.1_92_/_0.5)]" />
        </motion.div>
        <motion.div style={{ y: blobUp }} className="absolute top-64 left-1/3">
          <div className="geo-aurora geo-float-slow w-[22rem] h-[22rem] bg-[oklch(0.82_0.12_158_/_0.4)]" />
        </motion.div>
        <div className="geo-grid absolute inset-0" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
        <div className="relative max-w-3xl mx-auto text-center">
          {/* Floating trust chips (desktop only — keeps mobile light) */}
          <FloatingChips />

          {/* Glass badge */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 geo-glass text-primary text-xs font-semibold px-3.5 py-2 rounded-full mb-6"
          >
            <HomeIcon className="w-3.5 h-3.5" /> Home &amp; personal loans, made simple
          </motion.div>

          {/* Headline — word-by-word reveal */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            {HEADLINE.map((line, li) => (
              <span key={li} className="block">
                {line.map((w) => {
                  const i = wordIndex++
                  return (
                    <motion.span
                      key={`${li}-${w.text}`}
                      initial={reduce ? false : { opacity: 0, y: '0.5em' }}
                      animate={reduce ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: 0.15 + i * 0.07, ease: EASE }}
                      className={`inline-block ${w.accent ? 'text-primary' : ''}`}
                    >
                      {w.text}&nbsp;
                    </motion.span>
                  )
                })}
              </span>
            ))}
          </h1>

          {/* Bilingual tagline */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
            className="mt-6 flex flex-col items-center"
          >
            <p dir="rtl" className="font-urdu text-2xl sm:text-3xl font-semibold text-primary py-1">{TAGLINE_UR}</p>
            <p className="mt-1 text-sm font-medium text-gold-foreground">{TAGLINE_EN}</p>
            <div className="geo-rule-gold mt-4 w-40" />
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.82, ease: EASE }}
            className="mt-6 text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto"
          >
            GEO Loan.pk is a complete loan management platform with a full admin panel.
            Register, complete KYC, choose a package, and upload your payment proof —
            our team verifies it and your balance updates instantly.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.94, ease: EASE }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link
              href="/app"
              className="geo-shine inline-flex items-center gap-2 geo-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Open User App <ArrowRight className="w-4 h-4" />
            </Link>
            <DownloadApp />
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.05, ease: EASE }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500"
          >
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Bank-grade KYC</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> 2-minute approval</span>
            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Encrypted &amp; secure</span>
          </motion.div>
        </div>

        {/* App mockup */}
        <PhoneMockup />
      </div>
    </section>
  )
}

/* ---- Floating decorative trust chips (desktop) ---- */
function FloatingChips() {
  const chips = [
    { icon: ShieldCheck, label: 'KYC Verified', cls: 'left-[-4rem] top-8', float: 'geo-float' },
    { icon: Wallet, label: 'Instant Wallet', cls: 'right-[-5rem] top-24', float: 'geo-float-slow geo-float-delay' },
    { icon: BadgeCheck, label: 'Fast Approval', cls: 'left-[-3rem] bottom-[-1.5rem]', float: 'geo-float-slow' },
    { icon: Lock, label: 'Encrypted', cls: 'right-[-3.5rem] bottom-4', float: 'geo-float geo-float-delay' },
  ]
  return (
    <>
      {chips.map((c) => (
        // outer = CSS float (no backdrop-filter); inner = glass surface (static) — avoids per-frame backdrop re-blur
        <div key={c.label} className={`hidden lg:block ${c.float} absolute ${c.cls}`} aria-hidden>
          <div className="flex items-center gap-2.5 geo-glass rounded-xl pl-2 pr-3.5 py-2 shadow-sm">
            <span className="grid place-items-center w-6 h-6 rounded-lg bg-primary/10 text-primary shrink-0">
              <c.icon className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{c.label}</span>
          </div>
        </div>
      ))}
    </>
  )
}

/* ---- 3D-tilt phone mockup with count-up balance + stats ---- */
function PhoneMockup() {
  const reduce = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)

  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, { stiffness: 150, damping: 18 })
  const rotateY = useSpring(ry, { stiffness: 150, damping: 18 })

  // Headline balance = highest loan package from admin settings (live; polls every 15s)
  const [balance, setBalance] = useState(24000)
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
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 9)
    rx.set(-py * 9)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
      className="relative mt-16 flex justify-center"
      style={{ perspective: 1000 }}
    >
      {/* glow behind device */}
      <div className="absolute inset-0 -z-10 geo-gradient-gold opacity-15 blur-3xl rounded-full" aria-hidden />

      <div className={reduce ? '' : 'geo-float-slow'}>
        <motion.div
          ref={cardRef}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d', minHeight: 0 }}
          className="phone-shell max-w-[340px]"
        >
            <div className="geo-gradient text-white p-5 flex flex-col items-center text-center">
              <BrandLockup variant="onDark" size={32} />
              <div className="mt-3" dir="rtl">
                <span className="font-urdu text-sm font-semibold text-white/95">{TAGLINE_UR}</span>
              </div>
              <div className="text-xs text-white/80">{TAGLINE_EN}</div>
            </div>
            <div className="p-5">
              <div className="geo-gradient-emerald text-white rounded-2xl p-5 text-center shadow-sm">
                <div className="text-xs text-white/85">Available Balance</div>
                <div className="text-3xl font-bold my-2">
                  <CountUp key={balance} to={balance} prefix="PKR " duration={1.8} />
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs bg-white/15 px-2.5 py-1 rounded-full">
                  <BadgeCheck className="w-3.5 h-3.5" /> Loan Status: Active
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-card border border-border">
                  <Users className="w-4 h-4 mx-auto text-primary" />
                  <div className="mt-1.5 font-bold text-base text-slate-900"><CountUp to={5200} suffix="+" duration={2} /></div>
                  <div className="text-slate-500">Users</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Zap className="w-4 h-4 mx-auto text-emerald-600" />
                  <div className="mt-1.5 font-bold text-base text-emerald-700 inline-flex items-center gap-0.5">
                    <CountUp to={2} duration={1.4} /> min
                  </div>
                  <div className="text-slate-500">Approval</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Verified payout workflow
              </div>
            </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
