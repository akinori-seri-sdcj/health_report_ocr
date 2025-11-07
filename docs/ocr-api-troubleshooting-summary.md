# 健診OCR 開発環境トラブルシュート要約

最終更新: 2025-11-07

## 発生した問題

- フロントの開発サーバーが HTTPS/WSS を強制し、ブラウザで自己署名証明書エラーが発生。
  - コンソールに `ERR_CERT_AUTHORITY_INVALID` と `wss://localhost` への接続失敗が連発し、HMR の再接続待ちでページ表示が遅延。
- OCR 実行時の API が 404。
  - `POST http://localhost:5173/api/process-health-report` が Vite 側で 404（フロント開発サーバーに `/api` のプロキシ未設定）。
  - バックエンドの実エンドポイントは `POST /process-health-report`（ポート 8080）。
- バックエンド起動時の環境変数エラー。
  - `OPENAI_API_KEY` 未設定/未読込で OpenAI SDK 初期化に失敗。
- ポート競合。
  - `EADDRINUSE: 8080`（既に別プロセスが使用中）。

## 原因

- `frontend/vite.config.ts` で `origin: 'https://localhost'` と `hmr: { protocol: 'wss', clientPort: 443 }` を設定し、開発環境でも HTTPS/WSS を強制していた。
- Vite の `server.proxy` に `/api` のプロキシが無く、`/api/*` がフロント側で 404 に。
- バックエンドで `.env` の読込タイミングが遅く、OpenAI クライアント生成時にキーが空。
- 既存プロセスが 8080 を占有。

## 実施した対応

- フロントの HTTPS/WSS 強制を解除。
  - `frontend/vite.config.ts` の `server` / `preview` から `origin` と `hmr` 設定を削除し、開発時は `http://localhost:5173` + `ws://` HMR に統一。
- Vite にバックエンドへのプロキシを追加。
  - `server.proxy` に `'/api' -> 'http://localhost:8080'` を設定（`rewrite` で `/api` を剥がして `/process-health-report` へ到達）。
- バックエンドの環境変数読込を前倒し。
  - `backend/src/index.ts` の先頭で `import 'dotenv/config'` を追加し、OpenAI 初期化前に `.env` を確実に読込。
- 運用手順を整備。
  - `backend/.env` に `OPENAI_API_KEY` を設定。
  - 8080 が埋まっている場合は該当プロセス停止（`netstat` / `taskkill`）またはポート変更（例：8081）とフロントのプロキシ先更新を案内。
  - 以前の PWA/SW キャッシュが影響する場合は Service Worker の解除を案内。

## 検証手順（要点）

### バックエンド

1. 起動

```
cd backend
npm run dev
```

2. ヘルスチェック（200 を期待）

```
# ブラウザ: http://localhost:8080/health
# もしくは PowerShell:
iwr http://localhost:8080/health | Select-Object -Expand Content
```

### フロントエンド（プロキシ確認）

1. 起動

```
cd frontend
npm run dev
```

2. プロキシの動作確認（404 でないこと）

```
# ブラウザ: http://localhost:5173/api/health
# もしくは PowerShell:
iwr http://localhost:5173/api/health | Select-Object -Expand Content
```

3. コンソール確認

- `ERR_CERT_AUTHORITY_INVALID` や `wss://localhost` エラーが消えていること。

### OCR 実行（エンドツーエンド）

1. アプリ（http://localhost:5173）で画像をアップロードし、OCR を開始。
2. DevTools → Network → `process-health-report` を確認。
   - リクエスト URL: `http://localhost:5173/api/process-health-report`
   - ステータス:
     - 200（正常; JSON `{ success: true, data: ... }`）
     - 500（バックエンド由来のエラー JSON）。
   - 以前の 404（フロント側未到達）にならないことが確認ポイント。

補助テスト（PowerShell で直接 POST）

```
iwr http://localhost:5173/api/process-health-report -Method Post -Form @{ images = Get-Item "C:\\path\\to\\image.jpg" }
```

## 補足

- 開発時は `VITE_API_URL=/api` を使うと、環境に依存せず常に `/api` 経由で呼べるため、Vite プロキシ（dev）やリバプロ（prod）に素直に乗ります。
- HTTPS が必要な本番相当の検証は、自己署名ではなく信頼済み証明書（例：mkcert）を用いて `server.https` を設定するのが安全です。

