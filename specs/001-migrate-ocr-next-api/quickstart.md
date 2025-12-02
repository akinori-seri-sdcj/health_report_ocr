# Quickstart: 健康診断OCR API Routes移行

## 前提
- Node 18+ / Next 14 環境
- 環境変数: `OPENAI_API_KEY` (必須), `MOCK_OCR` (任意; `1`でモック応答)
- 依存インストール済み (`npm install`)

## 起動
```bash
npm run dev   # localhost:3000, APIは /api/ocr
# or
npm run build && npm run start
```

## 動作確認 (ローカル)
```bash
curl -X POST http://localhost:3000/api/ocr \
  -F "images=@/path/to/health-report.jpg"
```
- 期待: `{"success":true,"data":{...}}` が返る。入力不備は 400, 失敗は 500 系。

### ヘルスチェック
```bash
curl http://localhost:3000/api/ocr/health
```
- 期待: `{ status: "ok", services.openai: "configured"|"missing-api-key", mock: "enabled"|"disabled" }`

## Vercel設定
- Project Settings > Environment Variables に `OPENAI_API_KEY` を設定。
- 大きな画像/多枚数で遅延する場合、Vercelのサーバーレス実行時間制限に注意（目標: 10s以内で応答）。必要に応じて画像数/サイズ制限やモックで切り分ける。

## フロントエンド接続
- `frontend/src/api/healthReportApi.ts` が `/api/ocr` を呼び出す。`VITE_API_URL` を設定しない限り同一オリジンを使用。
