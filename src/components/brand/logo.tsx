import { cn } from '@/lib/utils'

// Brand constants (Smart Qarz)
export const BRAND_NAME = 'Smart Qarz'
export const TAGLINE_UR = 'آسان قرض، روشن مستقبل'
export const TAGLINE_EN = 'Easy loans, a brighter future'

/**
 * Geometric split-diamond mark — emerald half + graphite half — echoing the
 * Smart Qarz logo. Inline SVG so it scales crisply, stays transparent, and
 * re-colors with the theme. `size` = side in px.
 */
export function BrandMark({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Smart Qarz"
      className={cn('block select-none shrink-0', className)}
    >
      <defs>
        <linearGradient id="sq-em" x1="6" y1="42" x2="24" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="oklch(0.6 0.15 160)" />
          <stop offset="1" stopColor="oklch(0.82 0.18 152)" />
        </linearGradient>
        <linearGradient id="sq-gr" x1="24" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="oklch(0.42 0.012 214)" />
          <stop offset="1" stopColor="oklch(0.26 0.01 214)" />
        </linearGradient>
      </defs>
      {/* left (emerald) half of the diamond */}
      <path d="M24 3 L24 45 L3 24 Z" fill="url(#sq-em)" />
      {/* right (graphite) half */}
      <path d="M24 3 L45 24 L24 45 Z" fill="url(#sq-gr)" />
      {/* bright emerald separator edge */}
      <path d="M24 3 L24 45" stroke="oklch(0.9 0.16 156)" strokeWidth="1.4" strokeLinecap="round" />
      {/* angular "S" cut on the emerald half */}
      <path
        d="M18.5 15.5 H11.5 L15.5 20 H10.5"
        stroke="oklch(0.17 0.02 200)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* angular "Q" arrow on the graphite half */}
      <path
        d="M31 20 H37 V27"
        stroke="oklch(0.9 0.14 156)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M33.5 24.5 L38 29" stroke="oklch(0.9 0.14 156)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Full Smart Qarz wordmark: geometric mark + "Smart Qarz" lockup, inline.
 * `height` = mark height in px; text scales with it. Pass `onDark` on
 * saturated/colored surfaces to switch the wordmark to solid white.
 */
export function BrandLogo({
  height = 44,
  className,
  onDark = false,
}: {
  height?: number
  className?: string
  onDark?: boolean
}) {
  return (
    <span
      className={cn('inline-flex items-center select-none', className)}
      style={{ gap: height * 0.26 }}
      aria-label="Smart Qarz"
    >
      <BrandMark size={height} />
      <span
        className="font-display font-bold tracking-tight leading-none whitespace-nowrap"
        style={{ fontSize: height * 0.5 }}
      >
        {onDark ? (
          <span className="text-white">Smart Qarz</span>
        ) : (
          <>
            <span className="text-foreground">Smart</span>
            <span className="sq-emerald-text">&nbsp;Qarz</span>
          </>
        )}
      </span>
    </span>
  )
}

/**
 * Square brand mark — for compact spots, avatars, or square placements.
 * `size` = tile side in px.
 */
export function LogoMark({ size = 44, className }: { size?: number; className?: string }) {
  return <BrandMark size={size} className={className} />
}

/**
 * Brand lockup: the wordmark + an optional context subtitle
 * (e.g. "Management Console"). Pass variant="onDark" on colored surfaces.
 */
export function BrandLockup({
  size = 40,
  subtitle,
  variant = 'default',
  className,
}: {
  size?: number
  subtitle?: string
  variant?: 'default' | 'onDark'
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <BrandLogo height={size} onDark={variant === 'onDark'} />
      {subtitle && (
        <span
          className={cn(
            'border-l pl-3 text-sm font-medium',
            variant === 'onDark' ? 'border-white/30 text-white/90' : 'border-border text-muted-foreground'
          )}
        >
          {subtitle}
        </span>
      )}
    </div>
  )
}
