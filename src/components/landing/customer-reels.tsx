'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { Reveal } from '@/components/landing/motion'

interface Reel { id: string; title: string; subtitle: string | null; videoPath: string }

export function CustomerReels() {
  const [reels, setReels] = useState<Reel[]>([])
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/reels', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setReels(d.reels || []))
      .catch(() => {})
  }, [])

  if (reels.length === 0) return null

  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  return (
    <section className="max-w-6xl mx-auto px-4 pb-20">
      <Reveal className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Play className="w-3.5 h-3.5" /> Our Customers
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Our Satisfied Customers</h2>
        <div className="geo-rule-gold mt-3 w-24 mx-auto" />
        <p className="mt-3 text-muted-foreground">Real stories from people who got their loan with Smart Qarz.</p>
      </Reveal>

      <div className="relative">
        <button onClick={() => scroll(-1)} aria-label="Previous"
          className="hidden sm:grid absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 place-items-center rounded-full bg-card border border-border shadow hover:bg-muted hover:scale-105 transition">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <button onClick={() => scroll(1)} aria-label="Next"
          className="hidden sm:grid absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 place-items-center rounded-full bg-card border border-border shadow hover:bg-muted hover:scale-105 transition">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

        <Reveal>
          <div ref={scroller} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            {reels.map((r) => <ReelCard key={r.id} reel={r} />)}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function ReelCard({ reel }: { reel: Reel }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => { const v = ref.current; if (!v) return; v.play().catch(() => {}); setPlaying(true) }

  return (
    <div className="group relative shrink-0 snap-start w-[240px] sm:w-[260px] rounded-2xl overflow-hidden border border-border bg-black shadow-sm geo-hover-card">
      <video
        ref={ref}
        src={reel.videoPath + '#t=0.1'}
        className="w-full aspect-[9/16] object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        playsInline
        controls={playing}
        preload="metadata"
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <>
          <button onClick={play} aria-label={`Play ${reel.title}`} className="absolute inset-0 grid place-items-center bg-black/10 group-hover:bg-black/25 transition">
            <span className="w-14 h-14 rounded-full geo-gradient grid place-items-center shadow-lg ring-4 ring-white/20 transition-transform duration-300 group-hover:scale-110">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </span>
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/85 to-transparent pointer-events-none">
            <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" /> Smart Qarz
            </div>
            <div className="text-white font-semibold text-sm mt-0.5 leading-tight">{reel.title}</div>
            {reel.subtitle && <div className="text-white/75 text-xs">{reel.subtitle}</div>}
          </div>
        </>
      )}
    </div>
  )
}
