'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  ShieldCheck, CheckCircle2, Loader2, Clock, Lock, IdCard, Camera,
  BadgeCheck, Fingerprint, UserRound,
} from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const STEPS = [
  { label: 'Scanning your documents', icon: IdCard, at: 0 },
  { label: 'Verifying CNIC with NADRA', icon: ShieldCheck, at: 4, nadra: true },
  { label: 'Matching your selfie', icon: Camera, at: 9 },
  { label: 'Running security checks', icon: Lock, at: 14 },
  { label: 'Final review by our team', icon: BadgeCheck, at: 19 },
]

/**
 * Premium KYC "verifying" experience — animated ID-document scanner + staggered
 * step checklist. Purely presentational; the parent owns the timer + status poll.
 * Honours prefers-reduced-motion. (The NADRA step is a simulated review stage, not
 * a live Verisys call — the authoritative gate remains admin review.)
 */
export function KycVerifying({ userName, elapsed }: { userName: string; elapsed: number }) {
  const reduce = useReducedMotion()

  let stepIdx = 0
  for (let i = 0; i < STEPS.length; i++) if (elapsed >= STEPS[i].at) stepIdx = i
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')
  const progress = Math.min(96, 16 + elapsed * 3)

  return (
    <div className="py-4">
      {/* ===== Animated ID-document scanner ===== */}
      <div className="relative mx-auto w-64">
        <div className="absolute -inset-5 geo-gradient opacity-[0.12] blur-2xl rounded-[2rem]" aria-hidden />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative rounded-2xl border border-primary/20 bg-card shadow-[0_22px_45px_-22px_oklch(0.45_0.12_152_/_0.55)] overflow-hidden"
        >
          {/* header strip */}
          <div className="geo-gradient px-3 py-1.5 flex items-center justify-between">
            <span className="text-[8px] font-bold tracking-[0.14em] text-white/90">ISLAMIC REPUBLIC OF PAKISTAN</span>
            <span className="inline-flex items-center gap-1 text-[8px] font-bold text-white/90"><ShieldCheck className="w-2.5 h-2.5" /> NADRA</span>
          </div>
          {/* body: photo + data lines */}
          <div className="p-3 flex gap-3">
            <div className="relative w-14 h-16 rounded-md bg-muted border border-border grid place-items-center overflow-hidden shrink-0">
              <UserRound className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-1.5 w-3/4 rounded-full bg-muted animate-pulse" />
              <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" style={{ animationDelay: '.2s' }} />
              <div className="h-1.5 w-2/3 rounded-full bg-muted animate-pulse" style={{ animationDelay: '.4s' }} />
              <div className="mt-2 h-1.5 w-1/2 rounded-full bg-primary/30" />
              <div className="text-[8px] font-mono text-muted-foreground tracking-wider pt-0.5">42101-•••••••-•</div>
            </div>
          </div>
          {/* sweeping scan beam */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0"
              initial={{ top: '-25%' }}
              animate={{ top: ['-25%', '100%'] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-primary shadow-[0_0_10px_2px_oklch(0.51_0.14_151_/_0.6)]" />
            </motion.div>
          )}
          {/* viewfinder corner brackets */}
          <div className="pointer-events-none absolute inset-1.5" aria-hidden>
            <span className="absolute w-4 h-4 top-0 left-0 border-t-2 border-l-2 border-primary/50 rounded-tl-md" />
            <span className="absolute w-4 h-4 top-0 right-0 border-t-2 border-r-2 border-primary/50 rounded-tr-md" />
            <span className="absolute w-4 h-4 bottom-0 left-0 border-b-2 border-l-2 border-primary/50 rounded-bl-md" />
            <span className="absolute w-4 h-4 bottom-0 right-0 border-b-2 border-r-2 border-primary/50 rounded-br-md" />
          </div>
        </motion.div>
      </div>

      {/* ===== heading + secure-connection indicator ===== */}
      <div className="text-center mt-5">
        <h2 className="font-bold text-lg text-foreground">Verifying your identity</h2>
        <p className="text-sm text-muted-foreground mt-1">Hi {userName}, our team is reviewing your documents.</p>
        <div className="mt-2.5 inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Secure connection · 256-bit encrypted
        </div>
      </div>

      {/* ===== timer + progress ===== */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-primary font-mono text-sm font-semibold">
          <Clock className="w-4 h-4" /> {mm}:{ss}
        </span>
        <span className="text-xs font-bold text-primary tabular-nums">{Math.round(progress)}%</span>
      </div>
      <div className="mt-3 relative h-2 rounded-full bg-muted overflow-hidden geo-shine-loop max-w-xs mx-auto">
        <motion.div
          className="h-full geo-gradient rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>

      {/* ===== steps ===== */}
      <motion.div
        className="mt-5 space-y-2 max-w-xs mx-auto"
        initial={reduce ? false : 'hidden'}
        animate={reduce ? undefined : 'show'}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {STEPS.map((s, i) => {
          const done = i < stepIdx
          const active = i === stepIdx
          return (
            <motion.div
              key={s.label}
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } } }}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors ${
                done ? 'border-emerald-200 bg-emerald-50/60' : active ? 'border-primary/30 bg-primary/5' : 'border-transparent'
              }`}
            >
              <span className="relative w-6 h-6 shrink-0 grid place-items-center">
                {done ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </motion.span>
                ) : active ? (
                  <>
                    <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-border" />
                )}
              </span>
              <span className={`grid place-items-center w-7 h-7 rounded-lg shrink-0 transition-colors ${done ? 'bg-emerald-100 text-emerald-600' : active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <s.icon className="w-4 h-4" />
              </span>
              <span className={`flex-1 text-sm ${done ? 'text-emerald-700' : active ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{s.label}</span>
              {s.nadra && (
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${done ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Fingerprint className="w-2.5 h-2.5" /> NADRA
                </span>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* ===== status ===== */}
      <div className="mt-5 max-w-xs mx-auto p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 text-center">
        Status: <span className="font-semibold">PENDING ADMIN REVIEW</span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 text-center">Please keep this page open — it updates automatically.</p>
    </div>
  )
}
