'use client'

import { useEffect } from 'react'

// Loads the Tawk.to live-chat widget only when chat is enabled in Settings.
const TAWK_SRC = 'https://embed.tawk.to/6a37106caf26101d489dc77b/1jrjhgarp'
const TAWK_SCRIPT_ID = 'quickloan-tawk-script'

type TawkApi = {
  hideWidget?: () => void
  showWidget?: () => void
}

type TawkWindow = Window & {
  Tawk_API?: TawkApi
  Tawk_LoadStart?: Date
}

export default function LiveChat() {
  useEffect(() => {
    let cancelled = false
    const w = window as TawkWindow

    const hideChat = () => {
      w.Tawk_API?.hideWidget?.()
      document.getElementById(TAWK_SCRIPT_ID)?.remove()
    }

    const showChat = () => {
      if (w.Tawk_API?.showWidget) {
        w.Tawk_API.showWidget()
        return
      }
      if (document.getElementById(TAWK_SCRIPT_ID)) return
      w.Tawk_API = w.Tawk_API || {}
      w.Tawk_LoadStart = new Date()
      const s = document.createElement('script')
      s.id = TAWK_SCRIPT_ID
      s.async = true
      s.src = TAWK_SRC
      s.charset = 'UTF-8'
      s.setAttribute('crossorigin', '*')
      document.head.appendChild(s)
    }

    const syncChat = async () => {
      try {
        const r = await fetch('/api/settings', { cache: 'no-store' })
        const d = await r.json()
        if (cancelled) return
        if (d?.settings?.chatEnabled === false) hideChat()
        else showChat()
      } catch {}
    }

    syncChat()
    const t = setInterval(syncChat, 10000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  return null
}
