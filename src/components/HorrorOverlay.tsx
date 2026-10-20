import type { HorrorPhase } from '../types'

interface Props {
  phase: HorrorPhase
  invertFlash: boolean
}

/**
 * Renders purely decorative horror overlays on top of everything:
 * - vignette darkening
 * - scanlines (phase 1+)
 * - static noise (phase 2+)
 * - red corner bleeds (phase 3)
 */
export default function HorrorOverlay({ phase, invertFlash }: Props) {
  return (
    <>
      {/* Vignette */}
      <div
        className={`
          fixed inset-0 pointer-events-none z-[98] transition-all duration-[2000ms]
          ${phase === 0 ? '' : phase === 1 ? 'vignette phase-1' : phase === 2 ? 'vignette phase-2' : 'vignette phase-3'}
        `}
      />

      {/* Scanlines — appear from phase 1 */}
      {phase >= 1 && (
        <div
          className="fixed inset-0 pointer-events-none z-[97]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
            opacity: phase >= 2 ? 0.7 : 0.35,
            transition: 'opacity 1.5s ease',
          }}
        />
      )}

      {/* Static noise — phase 2+ */}
      {phase >= 2 && (
        <div
          className="fixed inset-0 pointer-events-none z-[96]"
          style={{
            opacity: phase >= 3 ? 0.06 : 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            animation: 'staticNoise 0.12s steps(1) infinite',
          }}
        />
      )}

      {/* Corner red bleeds — phase 3 */}
      {phase >= 3 && (
        <>
          <div
            className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-[95]"
            style={{
              background: 'radial-gradient(circle at top left, rgba(139,0,0,0.35) 0%, transparent 70%)',
            }}
          />
          <div
            className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none z-[95]"
            style={{
              background: 'radial-gradient(circle at bottom right, rgba(139,0,0,0.35) 0%, transparent 70%)',
            }}
          />
        </>
      )}

      {/* Invert flash */}
      {invertFlash && (
        <div
          className="fixed inset-0 pointer-events-none z-[200]"
          style={{ background: 'rgba(255,0,0,0.15)', mixBlendMode: 'difference' }}
        />
      )}
    </>
  )
}
