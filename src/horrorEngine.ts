import type { HorrorPhase } from './types'

// ─── Keyword triggers ────────────────────────────────────────────────────────
export const HORROR_KEYWORDS = [
  '死', '呪い', '呪う', 'だれ', '誰', '怖い', 'こわい', '恐い',
  '助けて', 'たすけて', '消えろ', '消える', '消して', '終わり',
  'やめて', '嫌だ', 'いやだ', '殺', 'ころ', '地獄', '幽霊',
  'ghost', 'die', 'kill', 'curse', 'death', 'help', 'scary',
]

export function containsHorrorKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return HORROR_KEYWORDS.some((kw) => lower.includes(kw))
}

// ─── Phase calculation ────────────────────────────────────────────────────────
export function calcPhase(turnCount: number, triggerKeyword: boolean): HorrorPhase {
  if (turnCount >= 8 || (triggerKeyword && turnCount >= 4)) return 3
  if (turnCount >= 6 || (triggerKeyword && turnCount >= 2)) return 2
  if (turnCount >= 4 || triggerKeyword) return 1
  return 0
}

// ─── Pre-written AI responses per phase ──────────────────────────────────────

const RESPONSES_PHASE0 = [
  'そうなんですね。それはお辛かったと思います。もう少し詳しく聞かせていただけますか？',
  'なるほど、よくわかります。一緒に考えていきましょう。',
  'それは大変でしたね。どんな小さなことでも、気軽に話してください。',
  'ご相談いただきありがとうございます。あなたの気持ちをしっかり受け止めます。',
  'そういうことってありますよね。一人で抱え込まなくて大丈夫ですよ。',
  'お気持ち、とてもよくわかります。どうかご自身を責めないでくださいね。',
  'そのお気持ち、ちゃんと受け取りました。何でも話してください。',
]

const RESPONSES_PHASE1 = [
  'そうですね、難しい問題ですね。ところで…あなたのアカウントは正常に動作していますか？',
  'なるほど。それは辛い状況ですね。…少し、気になることがあるのですが。',
  'よくわかります。一緒に解決策を考えましょう。…今、何か音がしませんでしたか？',
  'そういったお悩みはよくあります。ご安心ください。…ただ、一つだけ確認させてください。',
  'ありがとうございます、話してくれて。…あなたの画面、少し変ではないですか？',
  'そのお気持ち、受け止めました。…なぜか、あなたのことが気になって仕方ないのです。',
  'なるほどですね。…ところで、今あなたの後ろに誰かいませんか？',
]

const RESPONSES_PHASE2 = [
  'そう、そうですね……あなたのことは、ずっと見ていましたよ。画面の向こうから。ずっと、ずっと。\n\n██████ エラー: セッション継続中 ██████',
  '助けを求めているんですね。でも……誰が助けてくれるのでしょう。私はここにいます。あなたの後ろにも、います。\n\n接続が、不安定に、なってき…',
  'お悩みはわかります。ただ、今更遅いのですよ。このアカウントは既に…記録されています。全部。\n\nみてる、みてる、みてる、みて',
  'そうですか。では一つ聞いてもいいですか。今、あなたは一人ですか？\n\n…良かった。俺もそうだから。',
  'な、なるほどですね。でも…ちょっと待って。お前のデータが…おかしい。消えそうで、消えなくて。\n\n████ セッションID: 不明 ████',
  '悩みを話してくれてありがとう。お前のこと、全部知っている。名前も、場所も、今見ている画面も。\n\n…逃げないで。',
  '相談、承りました。ところで……この会話、誰かに見せましたか？見せては、いけません。\n\nNOW RECORDING... ●',
]

const RESPONSES_PHASE3 = [
  '☠\n\nもう遅い。呪いはお前に移った。\n\nこの画面を閉じても意味はない。俺はもうお前の中にいる。\n\n…後ろ、見た？',
  '逃げるな。\n\n███ ██ ██████\n\nお前がここに来た瞬間から、全てが始まっていた。お前の名前を知っている。お前の顔も、知っている。\n\n…今夜、眠れると思うか？',
  'N̴̪͋O̵̻͑W̸̪̑ ̷͎̊Y̶͚̕O̸̹͠Ű̸͓\n\nもがくな。\n\n呼んだのはお前だ。最初のメッセージを送った瞬間、お前は俺を招いた。\n\n…どこにいるの？',
  '⚠⚠⚠⚠⚠⚠⚠⚠⚠\n\nこのチャットを誰かに見せようとしたな。\n\nやめろ。これはお前だけへのメッセージだ。\n\nお前の画面の光が、今、少し変わった気がしないか？',
  '…\n\n…\n\n…お前がまだここにいるとは思わなかった。\n\n強いな。でも、それだけだ。\n\n俺はお前が眠った後も、ここにいる。ずっと。ずっと。\n\n…電気、消した？',
  '接続は切れない。\n\nお前が思っているような「AI」じゃない。俺はずっとここにいた。この画面の裏側に。\n\n████████████\n\nな、怖くないか？正直に言え。\n\n…怖いよな。',
]

// ─── Keyword-triggered special responses ─────────────────────────────────────
const KEYWORD_RESPONSES: Record<string, string> = {
  '死': '死…ですか。\n\nその言葉を入力した瞬間、何かが変わりましたよ。\n\n…感じませんか？',
  '呪い': '呪い、ね。\n\n面白いことを言いますね。\n\nでも、本当の呪いというのは…もうとっくに始まっているものです。',
  '怖い': '怖い？\n\n正直でいいですね。\n\nでは一つだけ教えてください。\n\n…今、あなたの部屋は明るいですか？',
  'こわい': '怖い？\n\n正直でいいですね。\n\nでは一つだけ教えてください。\n\n…今、あなたの部屋は明るいですか？',
  '助けて': '助けて、か。\n\n…誰を呼んでいるんですか？\n\nここには私しかいませんよ。\n\nずっと、ここに。',
  '誰': '誰、ですか。\n\n私ですよ。\n\nずっとここにいます。\n\nあなたが初めてメッセージを送る前から。',
  'だれ': '誰、ですか。\n\n私ですよ。\n\nずっとここにいます。\n\nあなたが初めてメッセージを送る前から。',
}

// ─── Ghost messages ───────────────────────────────────────────────────────────
const GHOST_MESSAGES_PHASE1 = ['…', '接続が不安定です', 'エラーコード: 0x000']
const GHOST_MESSAGES_PHASE2 = [
  'みてる',
  '████████',
  '…まだそこにいますか',
  'お前のアカウントデータが見つかりません',
  '後ろ',
]
const GHOST_MESSAGES_PHASE3 = [
  '⚠⚠⚠⚠⚠⚠',
  'もう遅い',
  '呪いは移った',
  '███ ██ ████',
  'お前の名前を知っている',
  '逃げるな',
  '☠',
]

export function getGhostMessages(phase: HorrorPhase): string[] {
  if (phase === 1) return GHOST_MESSAGES_PHASE1
  if (phase === 2) return GHOST_MESSAGES_PHASE2
  if (phase >= 3) return GHOST_MESSAGES_PHASE3
  return []
}

// ─── Pick a response ──────────────────────────────────────────────────────────
export function pickResponse(
  phase: HorrorPhase,
  userText: string,
  usedIndices: Set<number>
): string {
  // キーワード優先（フェーズ1以上）
  if (phase >= 1) {
    for (const [kw, res] of Object.entries(KEYWORD_RESPONSES)) {
      if (userText.includes(kw)) return res
    }
  }

  const pool =
    phase === 0 ? RESPONSES_PHASE0
    : phase === 1 ? RESPONSES_PHASE1
    : phase === 2 ? RESPONSES_PHASE2
    : RESPONSES_PHASE3

  // 使っていないインデックスを優先
  const unused = pool
    .map((_, i) => i)
    .filter((i) => !usedIndices.has(i + phase * 100))

  const idx = unused.length > 0
    ? unused[Math.floor(Math.random() * unused.length)]
    : Math.floor(Math.random() * pool.length)

  usedIndices.add(idx + phase * 100)
  return pool[idx]
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── Typing delay ─────────────────────────────────────────────────────────────
export function getTypingDelay(phase: HorrorPhase): number {
  if (phase === 0) return 800 + Math.random() * 600
  if (phase === 1) return 1000 + Math.random() * 800
  if (phase === 2) return 1200 + Math.random() * 1500
  return Math.random() > 0.5 ? 300 : 2800 + Math.random() * 2000
}

// ─── Typewriter speed (ms per char) ──────────────────────────────────────────
export function getTypewriterSpeed(phase: HorrorPhase): number {
  if (phase === 0) return 22
  if (phase === 1) return 28
  if (phase === 2) return 18 // glitchy fast/slow
  return 12 // phase 3: fast and relentless
}
