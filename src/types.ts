export type HorrorPhase = 0 | 1 | 2 | 3

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  corrupted?: boolean
  ghost?: boolean
}
