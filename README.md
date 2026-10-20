# 呪われたAIチャット

## 起動手順

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開き、OpenAI APIキーを入力するとすぐに遊べます。

APIキーは [platform.openai.com/api-keys](https://platform.openai.com/api-keys) で取得できます。
キーはブラウザの localStorage にのみ保存されます（サーバーには送信されません）。

## ゲームの遊び方

- AIと普通の会話をスタート
- 会話が進むにつれてAIが変化していく
- 「死」「呪い」「怖い」などのキーワードを入力するとホラー演出が早期に発動
- フェーズ3まで進むとAIが完全に覚醒する

## ビルド

```bash
npm run build
```

## 補足

.env ファイルを作成して `VITE_OPENAI_API_KEY=sk-...` を設定すれば、
ブラウザでの入力をスキップすることもできます。
