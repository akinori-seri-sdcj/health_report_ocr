# フロントエンド変更が反映されない時の再起動・再読込チェックリスト

作成日: 2025-11-06

## 目的
- コード修正がブラウザに反映されない問題の切り分けと復旧手順を、実装や環境が異なるケースでも使える形でまとめる。

## 最短チェック（まずはこれだけ）
- URL確認: 期待するルート（例: `/confirm-edit`）を開いているか。
- ハードリロード: Ctrl/Cmd+Shift+R（キャッシュの消去とハード再読み込み）。
- Sources検索: DevTools → Sources 全文検索で修正文字列（例: `OCR処理中`, `animate-blink`）が見えるか。

## 典型パターン別の手順と注意
- Vite/React（開発サーバ）
  - 再起動: 実行中の `npm run dev` を停止→再起動。
  - HMR固着: 反映されない時はブラウザをフルリロード。必要に応じて dev サーバ再起動。
  - 多重起動: 複数ポートで古いサーバを見ていないか確認。
- 静的配信/本番（Nginx など）
  - 再ビルド: `npm run build` → 配信ディレクトリを差し替え。
  - キャッシュ制御: `Cache-Control`/`ETag` を確認。ファイル名にコンテンツハッシュを付与する運用を推奨。
  - 配信確認: Network タブで最新の `index.css`/`index.js` が取得されているか。
- Docker（開発/本番）
  - 再ビルド/再起動: `docker compose build` → `docker compose up -d`。
  - ボリューム: ホストの変更がコンテナ内へ反映されるマウント設定か確認。
- Service Worker/PWA
  - 症状: `(from ServiceWorker)` で古いアセットが返る。
  - 対処: DevTools → Application → Service Workers → Unregister or Update on reload → ハードリロード。
- Tailwind JIT/Purge
  - 症状: 新クラス（例: `.animate-blink`）が効かない。
  - 対処: 直接CSSに定義されているか、ビルド後の CSS に `@keyframes`/クラスが含まれるか Sources で確認。

## 原因の見分け方（最小セット）
- ソース不一致: Sources 検索で修正文字列が無ければ古いバンドル。
- イベント未発火: 期待ログ（例: `[API] OCR処理開始:`）が出ない → クリック未発火/別ページ。
- 状態不整合: 期待フラグ（例: `isProcessing`）が変わらない → ストア実装と使用箇所が不一致。
- SW/キャッシュ: Network の `Size` が `(from disk cache)/(from ServiceWorker)` ばかり → キャッシュ無効化が必要。

## 最小診断操作（ブラウザ/サーバ）
- ブラウザ
  - ハードリロード: Ctrl/Cmd+Shift+R。
  - DOM有無: `document.querySelector('[role="status"]')`。
  - CSS適用: `getComputedStyle(el).animationName` でアニメーション名を確認。
- サーバ
  - Dev: `npm run dev` を停止→再実行。
  - Prod: `npm run build` 後に差し替え/デプロイ。

## 本リポジトリの具体例（今回）
- 修正箇所
  - バナーDOM: `frontend/src/pages/ConfirmEditPage.tsx:275`（中央固定の点滅バナー）
  - バナーCSS: `frontend/src/index.css:53`（`@keyframes blink`）/`frontend/src/index.css:58`（`.animate-blink`）
  - 状態修正: `frontend/src/store/ocrResultStore.ts:89`（`setError` 分岐）/`frontend/src/store/ocrResultStore.ts:101`（`clearError`）
- 症状: `[API] OCR処理開始:` は出るが、`isProcessing` が true にならずバナー非表示。
- 原因: `setError(null)` で `isProcessing` を false に戻していた／一時的に古いバンドルを参照。
- 対応: ストアに `clearError()` を追加し、開始時はそれを使用。Dev サーバ再起動とハードリロードで最新コードを反映。

## 再発防止
- 運用
  - 役割分離: 「エラーのクリア」と「処理終了」を別関数に分ける（今回の `clearError`）。
  - UI変更後は Sources 検索で修正文字列を確認する習慣化。
  - Dev サーバ再起動/ハードリロードを作業チェックリストに追加。
- 技術
  - 本番はアセットにコンテンツハッシュを付与しキャッシュ更新を自動化。
  - PWA導入時は SW の更新戦略（`skipWaiting`/`clientsClaim`/更新通知）を明確化。

---
環境に合わせて具体的なコマンド/URL/ポート番号を追記してください。
