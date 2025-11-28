# 健康診断OCR (API Routes版)

## セットアップ
```bash
npm install
npm run dev   # http://localhost:3000
```

## 環境変数
- `OPENAI_API_KEY` (必須) — OpenAI Vision利用
- `MOCK_OCR` (任意) — `1` でモック応答を返す

## API
- OCR: `POST /api/ocr` (multipart/form-data, images up to 10MB each, max 10 files)
- ヘルスチェック: `GET /api/ocr/health` (キー有無とモック状態を返却)

詳細な手順・curl例は `specs/001-migrate-ocr-next-api/quickstart.md` を参照。
