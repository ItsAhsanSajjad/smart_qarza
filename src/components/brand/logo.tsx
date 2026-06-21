import { cn } from '@/lib/utils'

// Brand constants (from the GEO Loan.pk logo)
export const BRAND_NAME = 'GEO Loan.pk'
export const TAGLINE_UR = 'آسان قرض، روشن مستقبل'
export const TAGLINE_EN = 'Easy loans, a brighter future'

/**
 * Full GEO Loan.pk wordmark (house + GEO Loan.pk + Urdu tagline) as an image.
 * `height` is the rendered height in px; width scales with the logo's aspect ratio.
 */
export function BrandLogo({ height = 44, className }: { height?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="GEO Loan.pk"
      // reserve the box before load (logo art is 927x649) to avoid layout shift
      style={{ height, width: 'auto', aspectRatio: '927 / 649' }}
      className={cn('block select-none', className)}
      draggable={false}
    />
  )
}

/**
 * Square brand mark (the logo fitted into a rounded white tile) — for compact
 * spots, avatars, or square placements. `size` = tile side in px.
 */
export function LogoMark({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-grid place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-border shadow-sm',
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.png" alt="" style={{ width: '88%', height: '88%', objectFit: 'contain' }} draggable={false} />
    </span>
  )
}

/**
 * Brand lockup. The logo image already contains the name + tagline, so this is
 * mainly the wordmark + an optional context subtitle (e.g. "Management Console").
 * On colored/dark headers pass variant="onDark" to sit the logo on a white tile.
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
      {variant === 'onDark' ? (
        <span className="inline-flex rounded-xl bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-black/5">
          <BrandLogo height={size} />
        </span>
      ) : (
        <BrandLogo height={size} />
      )}
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
