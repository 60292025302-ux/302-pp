import type { HorrorPhase } from '../types'

interface Props {
  phase: HorrorPhase
}

export default function TypingIndicator({ phase }: Props) {
  const dotClass = `dot ${phase >= 2 ? 'dot-horror' : ''}`

  return (
    <div className="flex items-start gap-2 msg-enter">
      {/* AI avatar */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0
          ${phase >= 2
            ? 'bg-red-950 border border-red-800 text-red-400'
            : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}
        `}
      >
        {phase >= 3 ? '👁' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={`
          px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5
          ${phase >= 2
            ? 'bg-zinc-900 border border-red-900/40'
            : 'bg-zinc-900 border border-zinc-800'}
        `}
      >
        <span className={dotClass} />
        <span className={dotClass} />
        <span className={dotClass} />
      </div>
    </div>
  )
}
