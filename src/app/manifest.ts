import type { MetadataRoute } from 'next'

// PWA / TWA web app manifest — served at /manifest.webmanifest
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GEO Loan.pk',
    short_name: 'GEO Loan',
    description: 'Easy loans, a brighter future — apply, complete KYC, and manage your loan.',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#15783a',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
