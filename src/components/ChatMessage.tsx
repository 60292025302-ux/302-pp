import type { Message, HorrorPhase } from '../types'

interface Props {
  message: Message
  phase: HorrorPhase
}

export default function ChatMessage({ message, phase }: Props) {
  const isUser = message.role === 'user'
  const isGhost = message.ghost === true
  const isCorrupted = message.corrupted === true

  // ── Ghost message (noise injected by horror engine) ──────────────────────
  if (isGhost) {
    return (
      <div className="flex justify-start msg-enter">
        <div
          className={`
            max-w-[70%] px-3 py-2 rounded-xl text-xs
            ${phase >= 3
              ? 'bg-transparent text-red-600 border border-red-900/30 corrupted'
              : 'bg-transparent text-zinc-600 border border-zinc-800'}
          `}
        >
          {message.content}
        </div>
      </div>
    )
  }

  // ── User bubble ─────────────────────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end msg-enter">
        <div
          className={`
            max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed
            ${phase >= 3
              ? 'bg-zinc-800 border border-zinc-700 text-zinc-300'
              : phase >= 2
              ? 'bg-zinc-800 border border-zinc-700 text-zinc-300'
              : 'bg-zinc-800 border border-zinc-700 text-zinc-200'}
          `}
        >
          {message.content}
        </div>
      </div>
    )
  }

  // ── AI bubble ────────────────────────────────────────────────────────────
  return (
    <div className="flex items-start gap-2 msg-enter">
      {/* Avatar */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 select-none
          ${phase >= 3
            ? 'bg-red-950 border border-red-800 text-red-300'
            : phase >= 2
            ? 'bg-zinc-900 border border-red-900/60 text-red-500'
            : phase >= 1
            ? 'bg-zinc-800 border border-zinc-700 text-zinc-400'
            : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}
        `}
      >
        {phase >= 3 ? '👁' : phase >= 2 ? '⚠' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed
          ${phase >= 3
            ? 'bg-zinc-950 border border-red-900/50 text-red-200/90 shadow-lg shadow-red-950/30'
            : phase >= 2
            ? 'bg-zinc-900 border border-red-900/30 text-zinc-200'
            : phase >= 1
            ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
            : 'bg-zinc-900 border border-zinc-800 text-zinc-200'}
          ${isCorrupted ? 'corrupted' : ''}
        `}
      >
        {/* For corrupted messages render with a glitch overlay hint */}
        {isCorrupted ? (
          <span className="corrupted">{message.content}</span>
        ) : (
          <MessageText content={message.content} phase={phase} />
        )}
      </div>
    </div>
  )
}

// ── Inline renderer: highlight horror keywords in phase 2+ ──────────────────
function MessageText({ content, phase }: { content: string; phase: HorrorPhase }) {
  if (phase < 2) return <>{content}</>

  // Split on newlines so we preserve paragraph breaks
  const lines = content.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}
