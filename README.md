# 健康診断OCR (API Routes版)

## セットアップ
```bash
npm install
npm run dev           # Next.js dev server → http://localhost:3000
# Viteフロント単体の開発サーバー
npm run dev:frontend  # http://localhost:5173
```

## 環境変数
- `OPENAI_API_KEY` (必須) → OpenAI Vision利用
- `MOCK_OCR` (任意) → `1` でモック応答を返す

## フロントエンド (Vite) を同梱して配信
- `npm run build` は Vite をビルド → `public/ui/` にコピー → Next.js をビルドする流れ
- 配信パス: `/ui/`（BrowserRouter は `basename` でサブパス配信に対応）
- API はデフォルトで同一オリジン `/api/ocr` を呼び出す（必要に応じて `VITE_API_URL` を指定）

## API
- OCR: `POST /api/ocr` (multipart/form-data, images up to 10MB each, max 10 files)
- ヘルスチェック: `GET /api/ocr/health` (キー有無とモック状態を返却)

詳細な手順・curl例は `specs/001-migrate-ocr-next-api/quickstart.md` を参照。
