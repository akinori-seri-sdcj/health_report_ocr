# Webアプリ開発トラブルシューティング集（フロント/バックエンド共通）

最終更新: 2025-11-07

本ドキュメントは、ローカル開発で遭遇しやすい問題の症状・原因・対応策・検証方法を汎用化してまとめたものです。特定プロジェクトに依存しない形で、再発防止と初動対応の質を上げることを目的としています。

---

## 1) 開発時 HTTPS/HMR の接続エラー

- 症状
  - ブラウザコンソールに `ERR_CERT_AUTHORITY_INVALID`、`wss://localhost` 接続失敗が出続ける
  - HMR 再接続待ちでページ表示や更新が遅い
- 主因
  - 開発環境で自己署名証明書の HTTPS/WSS を強制している（`origin: 'https://...'`、HMR `protocol: 'wss'`, `clientPort: 443` など）
- 対策
  - 開発は原則 `http://` + `ws://` に戻す（本番のみ HTTPS）
  - どうしても HTTPS が必要なら、信頼済みローカル証明書（例: mkcert）を発行して `server.https` に設定
- 例: Vite の最小構成

```ts
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // https: { key, cert } // ← 本当に必要な時だけ。通常は未設定
  },
})
```

---

## 2) API が 404（フロント → バックの経路未設定）

- 症状
  - `POST http://localhost:5173/api/...` が 404（フロント開発サーバーに API ルートがない）
- 主因
  - フロント側（Vite）にバックエンドへのプロキシが無い／誤設定
- 対策
  - Vite `server.proxy` で `/api` をバックエンドへ中継
  - フロントの API ベース URL は `/api` を優先（dev: プロキシ、本番: 逆プロキシで同一路径）
- 例: Vite プロキシ

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
```

- 検証
  - `http://localhost:8080/health` が 200
  - `http://localhost:5173/api/health` でも同じ JSON（404 ではない）

---

## 3) バックエンドの環境変数読み込みエラー

- 症状
  - 起動時に「API キー未設定」などの例外（例: `OPENAI_API_KEY`）
- 主因
  - `.env` を読み込む前にクライアントを初期化している
- 対策
  - エントリポイント最上部で `import 'dotenv/config'`（または即時 `dotenv.config()`）
  - `.env.example` を整備し、実行環境で `.env` を必ず作成
- 例: Node/Express エントリ

```ts
// src/index.ts
import 'dotenv/config'
import express from 'express'
// ... 以降で process.env を参照
```

---

## 4) ポート競合（EADDRINUSE）

- 症状
  - `Error: listen EADDRINUSE: address already in use :::<PORT>`
- 対策（Windows）
  - 使用プロセス特定: `netstat -ano | findstr :8080`
  - プロセス確認: `tasklist /FI "PID eq <PID>"`
  - 強制終了: `taskkill /PID <PID> /F`
  - もしくは一時的に別ポートで起動し、フロントのプロキシ先も合わせて変更

---

## 5) PWA/Service Worker によるキャッシュ残り

- 症状
  - 設定変更しても古い挙動が残る／API パターンが SW にキャッシュされる
- 対策
  - 開発時は SW を無効化、または DevTools → Application → Service Workers → Unregister
  - Clear Storage でサイトデータをクリア
  - Workbox のキャッシュ戦略は本番のみ有効化を検討

---

## 6) 日本語の文字化け（モジバケ）

- 症状
  - 画面上に `�`（U+FFFD）などの置換文字が表示
- 主因
  - ファイルの文字エンコーディング不一致（UTF-8 以外）
- 対策
  - すべて UTF-8（BOM なし）で保存する
  - エディタ設定で既定エンコーディングを UTF-8 に固定
  - CI で文字化け検知や i18n 管理（翻訳キー化）を検討
- 応急措置
  - ランタイムで置換（MutationObserver 等）により UI 表示のみ補正（恒久対応ではない）

---

## 7) UI の可読性（背景/文字色）

- 症状
  - 入力欄が濃いグレーで、黒文字とのコントラストが低い
- 対策
  - 入力に `bg-white` を明示、ラベル/ボタンに `text-black` を付与
  - Chrome のオートフィルやダークモードでの反転も想定し、フォーカス/オートフィル時の色指定を含める
- 例: Tailwind の入力

```tsx
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white" />
```

---

## 8) 日付入力のアクセシビリティ（選択可能性の明示）

- 症状
  - `type="date"` は右端クリックでカレンダーが開くが、気づかれにくい
- 対策
  - カレンダーアイコンを表示し、クリックで `showPicker()`（対応ブラウザ）か `focus()` にフォールバック
- 例: シンプルな JSX パターン

```tsx
<div className="relative">
  <input ref={ref} type="date" className="w-full pr-10 ..." />
  <button
    type="button"
    aria-label="カレンダーから選択"
    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
    onClick={() => {
      const el = ref.current
      if (!el) return
      // @ts-ignore
      if (typeof el.showPicker === 'function') el.showPicker(); else el.focus()
    }}
  >
    {/* calendar icon svg */}
  </button>
  
</div>
```

---

## 9) 検証チェックリスト

- API 経路
  - `http://localhost:<API_PORT>/health` が 200
  - `http://localhost:5173/api/health` でも同じ JSON（Vite プロキシ OK）
- HMR/HTTPS
  - コンソールに `ERR_CERT_AUTHORITY_INVALID` が出ない
  - HMR は `ws://` で接続
- OCR/バックエンド動作
  - 画像 POST 時に 200（成功）または 4xx/5xx（バックエンド由来）の応答が返る
  - 404（フロント未到達）は解消
- UI
  - 日付アイコンでピッカーが開く
  - 入力欄背景は白、ラベル/ボタンは黒系文字で視認性良好

---

## 10) 再発防止のベストプラクティス

- 設定
  - `VITE_API_URL=/api` を標準化し、環境差はプロキシ/リバプロ側で吸収
  - Vite プロキシ設定のテンプレートをチーム共有
- 環境変数
  - `.env.example` を更新し、起動前チェックをタスク化
  - エントリで `import 'dotenv/config'` を徹底
- エンコーディング
  - UTF-8 固定（BOM なし）、エディタ設定/PR チェックで担保
- PWA/SW
  - 開発時は SW を無効化 or 明示的に Unregister する手順を README に明記
- UI/アクセシビリティ
  - 主要入力に `bg-white`、重要ラベル/ボタンに `text-black`
  - 日付/時刻入力はアイコンやヒントテキストで操作性を明示

---

## 付録: よく使うコマンド（Windows）

```powershell
# 使われているポートを調査
netstat -ano | findstr :8080

# PID からプロセス確認
tasklist /FI "PID eq <PID>"

# 強制終了
taskkill /PID <PID> /F
```

```powershell
# API 到達性の確認（PowerShell）
iwr http://localhost:8080/health | Select-Object -Expand Content

iwr http://localhost:5173/api/health | Select-Object -Expand Content
```

```ts
// Node.js での .env 先読み
import 'dotenv/config'
```

