import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type FormEvent,
} from 'react'
import { Send } from 'lucide-react'
import type { Message, HorrorPhase } from './types'
import {
  calcPhase,
  containsHorrorKeyword,
  getGhostMessages,
  getTypingDelay,
  getTypewriterSpeed,
  pickRandom,
  pickResponse,
} from './horrorEngine'
import ChatMessage from './components/ChatMessage'
import TypingIndicator from './components/TypingIndicator'
import HorrorOverlay from './components/HorrorOverlay'

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'こんにちは！「心のよりそいホットラインAI」です。\n今日はどんなことでも気軽にお話しください。どんなお悩みでも、一緒に考えますよ。',
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [turnCount, setTurnCount] = useState(0)
  const [triggerKeyword, setTriggerKeyword] = useState(false)
  const [phase, setPhase] = useState<HorrorPhase>(0)
  const [shaking, setShaking] = useState(false)
  const [invertFlash, setInvertFlash] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const usedIndices = useRef<Set<number>>(new Set())
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Phase 3 shake ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase >= 3) {
      setShaking(true)
      const t = setTimeout(() => setShaking(false), 2000)
      return () => clearTimeout(t)
    }
  }, [phase])

  // ── Flash ──────────────────────────────────────────────────────────────────
  const triggerFlash = useCallback(() => {
    setInvertFlash(true)
    setTimeout(() => setInvertFlash(false), 150)
  }, [])

  // ── Ghost message ──────────────────────────────────────────────────────────
  const injectGhost = useCallback(
    (currentPhase: HorrorPhase) => {
      const pool = getGhostMessages(currentPhase)
      if (!pool.length) return
      const chance = currentPhase === 1 ? 0.3 : currentPhase === 2 ? 0.55 : 0.8
      if (Math.random() > chance) return

      const ghost: Message = {
        id: `ghost-${Date.now()}`,
        role: 'assistant',
        content: pickRandom(pool),
        ghost: true,
      }
      setTimeout(() => {
        setMessages((prev) => [...prev, ghost])
        if (currentPhase >= 3) triggerFlash()
      }, 400 + Math.random() * 800)
    },
    [triggerFlash]
  )

  // ── Typewriter effect ──────────────────────────────────────────────────────
  const runTypewriter = useCallback(
    (msgId: string, fullText: string, currentPhase: HorrorPhase, onDone: () => void) => {
      let i = 0
      const speed = getTypewriterSpeed(currentPhase)

      const tick = () => {
        i++
        // Phase 2: occasional speed stutter
        let delay = speed
        if (currentPhase === 2 && Math.random() < 0.08) delay = speed * 8
        if (currentPhase === 3 && Math.random() < 0.05) delay = speed * 15

        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, content: fullText.slice(0, i) } : m
          )
        )

        if (i < fullText.length) {
          typewriterRef.current = setTimeout(tick, delay)
        } else {
          onDone()
        }
      }

      typewriterRef.current = setTimeout(tick, speed)
    },
    []
  )

  // ── Core send ──────────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return

      // Clear any running typewriter
      if (typewriterRef.current) clearTimeout(typewriterRef.current)

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInput('')

      // Update horror state
      const newTurn = turnCount + 1
      const newKeyword = triggerKeyword || containsHorrorKeyword(text)
      const newPhase = calcPhase(newTurn, newKeyword)

      setTurnCount(newTurn)
      setTriggerKeyword(newKeyword)
      setPhase(newPhase)

      if (!triggerKeyword && newKeyword) triggerFlash()

      // Show typing indicator
      setIsTyping(true)
      await sleep(getTypingDelay(newPhase))
      setIsTyping(false)

      // Pick response
      const responseText = pickResponse(newPhase, text, usedIndices.current)

      // Add empty bubble, then typewrite into it
      const aiMsgId = `ai-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: 'assistant', content: '', corrupted: newPhase >= 3 },
      ])

      runTypewriter(aiMsgId, responseText, newPhase, () => {
        injectGhost(newPhase)
        if (newPhase >= 3 && Math.random() > 0.5) {
          setTimeout(() => injectGhost(newPhase), 2500 + Math.random() * 2000)
        }
      })
    },
    [isTyping, turnCount, triggerKeyword, triggerFlash, runTypewriter, injectGhost]
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  // ── Dynamic styles ─────────────────────────────────────────────────────────
  const containerClass = [
    'flex flex-col h-full w-full max-w-lg mx-auto relative transition-all duration-1000',
    phase >= 3 ? 'pulse-red final-border' : '',
    shaking ? 'screen-shake' : '',
  ].filter(Boolean).join(' ')

  const headerBg =
    phase >= 3 ? 'bg-zinc-950 border-b border-red-900/60'
    : phase >= 2 ? 'bg-zinc-950 border-b border-zinc-800/80'
    : 'bg-zinc-950 border-b border-zinc-800'

  const inputBg =
    phase >= 3 ? 'bg-zinc-950 border-t border-red-900/50'
    : 'bg-zinc-950 border-t border-zinc-800'

  const headerTitle =
    phase >= 3 ? '██ 接続エラー ██'
    : phase >= 2 ? '心のよりそいAI ⚠'
    : '心のよりそいホットラインAI'

  const headerTitleClass =
    phase >= 3 ? 'text-sm font-semibold text-red-400 corrupted'
    : phase >= 2 ? 'text-sm font-semibold text-zinc-300'
    : 'text-sm font-semibold text-zinc-200'

  const statusDotClass =
    phase >= 3 ? 'w-2 h-2 rounded-full bg-red-600 animate-pulse'
    : phase >= 2 ? 'w-2 h-2 rounded-full bg-orange-700 animate-pulse'
    : 'w-2 h-2 rounded-full bg-emerald-600'

  const statusText =
    phase >= 3 ? '応答異常' : phase >= 2 ? '不安定' : 'オンライン'

  const statusTextClass =
    phase >= 3 ? 'text-xs text-red-500'
    : phase >= 2 ? 'text-xs text-orange-500'
    : 'text-xs text-emerald-600'

  return (
    <div
      className={`h-screen w-screen bg-zinc-950 flex items-center justify-center overflow-hidden ${invertFlash ? 'invert-flash' : ''}`}
    >
      <HorrorOverlay phase={phase} invertFlash={invertFlash} />

      <div className={containerClass} style={{ height: '100dvh', maxHeight: '100dvh' }}>
        {/* Header */}
        <header className={`flex items-center gap-3 px-4 py-3 flex-shrink-0 ${headerBg}`}>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0
              ${phase >= 3 ? 'bg-red-950 border border-red-800' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            {phase >= 3 ? '👁' : phase >= 2 ? '⚠' : '🤖'}
          </div>
          <div className="flex-1 min-w-0">
            <div className={headerTitleClass}>{headerTitle}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={statusDotClass} />
              <span className={statusTextClass}>{statusText}</span>
            </div>
          </div>
          {phase >= 1 && (
            <div className="text-xs text-zinc-700 flex-shrink-0 tabular-nums">
              {sessionId(turnCount)}
            </div>
          )}
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 bg-zinc-950">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} phase={phase} />
          ))}
          {isTyping && <TypingIndicator phase={phase} />}
          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <footer className={`px-4 py-3 flex-shrink-0 ${inputBg}`}>
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                phase >= 3 ? '…入力しても意味はない'
                : phase >= 2 ? 'メッセージを入力…'
                : 'メッセージを入力してください'
              }
              rows={1}
              disabled={isTyping}
              className={`
                flex-1 resize-none rounded-xl px-4 py-2.5 text-sm leading-relaxed
                placeholder:text-zinc-600 outline-none transition-all duration-700
                max-h-32 overflow-y-auto
                ${phase >= 3
                  ? 'bg-zinc-900 border border-red-900/50 text-zinc-300 focus:border-red-800/70'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-200 focus:border-zinc-500'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed
                ${phase >= 3
                  ? 'bg-red-900 hover:bg-red-800 text-red-200'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'}
              `}
            >
              <Send size={16} />
            </button>
          </form>
          <p className="text-center text-[10px] text-zinc-800 mt-2 select-none">
            {phase >= 3 ? '逃げられない'
            : phase >= 2 ? '…まだここにいますか'
            : 'Enter で送信 / Shift+Enter で改行'}
          </p>
        </footer>
      </div>
    </div>
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function sessionId(turn: number): string {
  return 'SID-' + (turn * 13337 + 0xdead).toString(16).toUpperCase().slice(0, 6)
}
