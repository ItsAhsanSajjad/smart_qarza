import type { MetadataRoute } from 'next'

// PWA / TWA web app manifest — served at /manifest.webmanifest
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Smart Qarz',
    short_name: 'Smart Qarz',
    description: 'Easy loans, a brighter future — apply, complete KYC, and manage your loan.',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    background_color: '#12161a',
    theme_color: '#12161a',
    orientation: 'portrait',
    icons: [
      { src: '/logo-sq.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/logo-sq.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
