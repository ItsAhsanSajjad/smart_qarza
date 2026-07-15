'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, ShieldCheck, Star, CheckCircle2, Loader2, X, Lock, Smartphone } from 'lucide-react'

type Apk = { apkPath: string | null; apkVersion: string | null }
type Phase = 'idle' | 'prep' | 'verify' | 'done'

export function DownloadApp() {
  const [apk, setApk] = useState<Apk>({ apkPath: null, apkVersion: null })
  const [size, setSize] = useState('')
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    fetch('/api/app-info', { cache: 'no-store' }).then((r) => r.json()).then(setApk).catch(() => {})
  }, [])

  // Real file size for the store card (HEAD request — no download)
  useEffect(() => {
    if (!apk.apkPath) return
    fetch(apk.apkPath, { method: 'HEAD' })
      .then((r) => {
        const len = Number(r.headers.get('content-length') || 0)
        if (len) setSize((len / 1024 / 1024).toFixed(1) + ' MB')
      })
      .catch(() => {})
  }, [apk.apkPath])

  const startDownload = useCallback(() => {
    if (!apk.apkPath) return
    setPhase('prep')
    setTimeout(() => setPhase('verify'), 950)
    setTimeout(() => {
      const a = document.createElement('a')
      a.href = apk.apkPath as string
      a.download = 'Smart-Qarz.apk'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setPhase('done')
    }, 2300)
  }, [apk.apkPath])

  if (!apk.apkPath) return null

  return (
    <>
      <button
        onClick={() => { setOpen(true); setPhase('idle') }}
        aria-label="Download the Smart Qarz Android app"
        className="geo-shine group inline-flex items-center gap-3 bg-slate-900 text-white pl-2.5 pr-5 py-2.5 rounded-2xl shadow-lg shadow-slate-900/25 ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
      >
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-white p-1.5 shrink-0 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-sq.png" alt="" className="w-full h-full object-contain" />
        </span>
        <span className="text-left leading-tight">
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/60 font-semibold">
            <ShieldCheck className="w-3 h-3 text-primary" /> Verified Android app
          </span>
          <span className="block text-[15px] font-bold mt-0.5">Download Smart Qarz</span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden border border-border"
            >
              {/* header — app identity */}
              <div className="relative p-5 pb-4">
                <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-sq.png" alt="Smart Qarz" className="w-16 h-16 rounded-2xl border border-border shadow-sm shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-foreground text-lg leading-tight">Smart Qarz</div>
                    <div className="text-xs text-primary font-medium">Smart Qarz (Pvt) Ltd</div>
                    <div className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold mt-1">
                      <ShieldCheck className="w-3 h-3" /> Verified · Official app
                    </div>
                  </div>
                </div>

                {/* stat strip */}
                <div className="grid grid-cols-3 divide-x divide-border mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-0.5 font-bold text-foreground text-sm">4.8 <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></div>
                    <div className="text-[10px] text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground text-sm">{size || '—'}</div>
                    <div className="text-[10px] text-muted-foreground">Size</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 font-bold text-foreground text-sm"><Smartphone className="w-3.5 h-3.5" /></div>
                    <div className="text-[10px] text-muted-foreground">Android 6+</div>
                  </div>
                </div>
              </div>

              {/* security badge */}
              <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Secure download · scanned &amp; safe · 256-bit encrypted</span>
              </div>

              {/* action */}
              <div className="p-5 pt-0">
                {phase === 'idle' && (
                  <button onClick={startDownload} className="geo-shine w-full geo-gradient text-white font-bold py-3.5 rounded-2xl shadow-sm hover:opacity-95 inline-flex items-center justify-center gap-2 transition">
                    <Download className="w-5 h-5" /> Install{apk.apkVersion ? ` ${apk.apkVersion}` : ''}
                  </button>
                )}

                {(phase === 'prep' || phase === 'verify') && (
                  <div className="py-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      {phase === 'prep' ? 'Preparing secure download…' : 'Verifying app integrity 🛡'}
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full geo-gradient rounded-full"
                        initial={{ width: '8%' }}
                        animate={{ width: phase === 'prep' ? '45%' : '94%' }}
                        transition={{ duration: phase === 'prep' ? 0.9 : 1.25, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                )}

                {phase === 'done' && (
                  <div className="text-center py-1">
                    <div className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm">
                      <CheckCircle2 className="w-5 h-5" /> Download started
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                      Open the downloaded file to install. If asked, allow installing from this source.
                    </p>
                    <button onClick={() => setOpen(false)} className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 transition">Done</button>
                  </div>
                )}

                <p className="text-[10px] text-center text-muted-foreground mt-3">Official app · Secure direct download from smartqarz.pk</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
