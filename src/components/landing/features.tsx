'use client'

import { Wallet, ShieldCheck, BadgeCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal, RevealGroup, RevealItem } from '@/components/landing/motion'

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Wallet, title: 'Instant Wallet', text: 'Approved loan amount is credited to your in-app wallet instantly after verification.' },
  { icon: ShieldCheck, title: 'KYC Verification', text: 'Submit CNIC and a selfie. Our team reviews your KYC before you can apply for a loan.' },
  { icon: BadgeCheck, title: 'Verified Approvals', text: 'Every down payment and installment screenshot is verified before unlock.' },
]

export function Features() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-20">
      <Reveal className="mb-10 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Everything you need to lend with confidence
        </h2>
        <div className="geo-rule-gold mt-3 w-24 mx-auto" />
        <p className="mt-3 text-slate-600">
          A verified, end-to-end workflow from KYC to payout — built for trust.
        </p>
      </Reveal>

      <RevealGroup className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <RevealItem key={f.title}>
            <div className="geo-card geo-hover-card group h-full p-6 rounded-2xl">
              <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:-rotate-6">
                <f.icon className="w-5 h-5" />
              </span>
              <div className="font-bold text-lg mt-4 text-slate-900">{f.title}</div>
              <div className="text-slate-600 text-sm mt-1.5 leading-relaxed">{f.text}</div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}
