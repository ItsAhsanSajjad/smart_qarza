'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, Lock, Clock } from 'lucide-react'
import { TAGLINE_UR } from '@/components/brand/logo'
import { Reveal } from '@/components/landing/motion'
import { DownloadApp } from '@/components/landing/download-app'

export function CtaBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-20">
      <Reveal>
        <div className="geo-gradient-animated geo-shine-loop relative overflow-hidden rounded-3xl px-8 py-10 sm:px-12 sm:py-14 text-center text-white shadow-[0_30px_60px_-30px_oklch(0.45_0.12_152_/_0.6)]">
          {/* soft inner glow */}
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: 'radial-gradient(600px 240px at 50% 0%, rgba(255,255,255,0.35), transparent 70%)' }} aria-hidden />

          <div className="relative">
            <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-white/20 mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-gold" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to build a brighter future with GEO Loan.pk?
            </h2>
            <p dir="rtl" className="font-urdu mt-2 text-lg font-semibold text-white/95">{TAGLINE_UR}</p>
            <p className="mt-2 text-white/80 max-w-xl mx-auto">
              Create your account, complete KYC, and pick a package in minutes.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/app"
                className="geo-shine inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Open User App <ArrowRight className="w-4 h-4" />
              </Link>
              <DownloadApp />
            </div>

            {/* Trust strip */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Bank-grade KYC</span>
              <span className="inline-flex items-center gap-1.5"><Lock className="w-4 h-4" /> Encrypted &amp; private</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> 2-minute approval</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
