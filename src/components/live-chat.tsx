'use client'

import { useEffect } from 'react'

// Loads the Tawk.to live-chat widget ONLY when the super admin has it enabled
// (Setting.chatEnabled). Reads the public /api/settings flag on mount, so toggling
// it off in the super-admin panel removes the widget for anyone who reloads.
const TAWK_SRC = 'https://embed.tawk.to/6a37106caf26101d489dc77b/1jrjhgarp'

export default function LiveChat() {
  useEffect(() => {
    let cancelled = false
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d?.settings?.chatEnabled === false) return // disabled by super admin
        const w = window as unknown as { Tawk_API?: unknown; Tawk_LoadStart?: Date }
        if (w.Tawk_API) return // already loaded
        w.Tawk_API = {}
        w.Tawk_LoadStart = new Date()
        const s = document.createElement('script')
        s.async = true
        s.src = TAWK_SRC
        s.charset = 'UTF-8'
        s.setAttribute('crossorigin', '*')
        document.head.appendChild(s)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return null
}
