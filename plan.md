# 健康診断結果OCRアプリケーション 開発計画書（PWA版）

## 📋 プロジェクト概要

本アプリケーションは、紙媒体の健康診断結果をデジタル化し、有所見項目を効率的に抽出・管理するためのPWA（Progressive Web App）です。

### アーキテクチャ選定理由

**PWAを採用する理由：**
- ✅ **開発期間の短縮**: 4-5週間（ネイティブアプリ比で25%削減）
- ✅ **配布の容易性**: URLを共有するだけで利用開始可能
- ✅ **即座のアップデート**: バグ修正や機能追加が即座に反映
- ✅ **コスト削減**: アプリストア審査・登録費用が不要
- ✅ **クロスプラットフォーム**: iOS/Android/PCで単一コードベース
- ✅ **必要機能の実現**: カメラAPI、Excel生成、編集機能すべて実装可能

---

## 🛠️ 技術スタック

### フロントエンド（PWA）
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **状態管理**: Zustand（軽量・シンプル）
- **スタイリング**: Tailwind CSS（モバイルファーストデザイン）
- **主要ライブラリ**:
  - `exceljs`: Excel（.xlsx）ファイル生成
  - `axios`: HTTP通信
  - `react-hook-form`: フォーム管理とバリデーション
  - `vite-plugin-pwa`: PWA機能実装
  - `workbox-window`: Service Worker管理
  - `dexie`: IndexedDB操作（画像の一時保存）

### バックエンド（BFF: Backend for Frontend）
- **言語**: TypeScript（Node.js）
- **フレームワーク**: Express.js
- **実行環境**: Google Cloud Functions（第2世代）または AWS Lambda
- **主要ライブラリ**:
  - `multer`: multipart/form-dataの処理
  - `axios`: LLM APIへのリクエスト
  - `dotenv`: 環境変数管理

### 開発環境
- **仮想化**: Docker + Docker Compose
- **コンテナ構成**:
  - フロントエンド開発サーバー（Vite）
  - バックエンド開発サーバー（Node.js + Express）
- **バージョン管理**: Git + GitHub
- **CI/CD**: GitHub Actions
- **ホスティング**: Vercel（フロントエンド）+ Google Cloud Functions（バックエンド）

---

## 📁 プロジェクト構造

```
health_report_ocr/
├── .devcontainer/                      # VS Code Dev Container設定
│   ├── devcontainer.json
│   └── Dockerfile
├── docker-compose.yml                  # ローカル開発環境
├── frontend/                           # PWAアプリケーション
│   ├── public/
│   │   ├── manifest.json              # PWAマニフェスト
│   │   ├── icons/                     # アプリアイコン（各サイズ）
│   │   └── robots.txt
│   ├── src/
│   │   ├── pages/                     # 画面コンポーネント
│   │   │   ├── CameraPage.tsx        # 撮影画面
│   │   │   └── EditPage.tsx          # 確認・編集画面
│   │   ├── components/                # 再利用可能コンポーネント
│   │   │   ├── Camera.tsx
│   │   │   ├── ImagePreview.tsx
│   │   │   ├── EditableTable.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── services/                  # ビジネスロジック
│   │   │   ├── camera.service.ts     # カメラ操作
│   │   │   ├── api.service.ts        # バックエンドAPI通信
│   │   │   ├── excel.service.ts      # Excel生成
│   │   │   └── storage.service.ts    # IndexedDB操作
│   │   ├── stores/                    # Zustand状態管理
│   │   │   ├── sessionStore.ts       # 撮影セッション管理
│   │   │   └── resultStore.ts        # 抽出結果管理
│   │   ├── hooks/                     # カスタムフック
│   │   │   ├── useCamera.ts
│   │   │   └── useImageSession.ts
│   │   ├── types/                     # TypeScript型定義
│   │   │   ├── health-report.types.ts
│   │   │   └── api.types.ts
│   │   ├── utils/                     # ユーティリティ関数
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── sw.ts                      # Service Worker
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── package.json
├── backend/                            # BFFサーバー
│   ├── src/
│   │   ├── index.ts                   # エントリーポイント
│   │   ├── routes/
│   │   │   └── health-report.routes.ts
│   │   ├── controllers/
│   │   │   └── health-report.controller.ts
│   │   ├── services/
│   │   │   └── llm.service.ts        # LLM API連携
│   │   ├── middleware/
│   │   │   ├── error-handler.ts
│   │   │   └── cors.ts
│   │   ├── utils/
│   │   │   └── logger.ts
│   │   └── types/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── shared/                             # 共通型定義
│   └── types/
│       └── health-report.types.ts
├── spec.md                             # 詳細設計書
├── plan.md                             # 本開発計画書
├── CLAUDE.md                           # Claude Code用プロジェクト説明
└── README.md
```

---

## 🐳 仮想開発環境の構築

### Docker Compose構成

```yaml
# docker-compose.yml
version: '3.8'

services:
  # フロントエンド開発サーバー
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"  # Vite開発サーバー
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8080
    command: npm run dev -- --host

  # バックエンド開発サーバー
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - PORT=8080
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    command: npm run dev

  # リバースプロキシ（HTTPS対応、カメラAPI使用のため）
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/certs:/etc/nginx/certs
    depends_on:
      - frontend
      - backend
```

### VS Code Dev Container設定

```json
// .devcontainer/devcontainer.json
{
  "name": "Health Report OCR Development",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "frontend",
  "workspaceFolder": "/workspace",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "ms-azuretools.vscode-docker"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
      }
    }
  },
  "forwardPorts": [5173, 8080],
  "postCreateCommand": "cd /workspace/frontend && npm install && cd /workspace/backend && npm install"
}
```

### 環境構築手順

```bash
# 1. リポジトリのクローン
git clone <repository-url>
cd health_report_ocr

# 2. 環境変数の設定
cp backend/.env.example backend/.env
# backend/.env を編集して OPENAI_API_KEY を設定

# 3. Dockerコンテナの起動
docker-compose up -d

# 4. フロントエンドにアクセス
# https://localhost (HTTPSでアクセス、カメラAPIのため)

# 5. コンテナのログ確認
docker-compose logs -f frontend
docker-compose logs -f backend

# 6. コンテナの停止
docker-compose down
```

### ホストマシンでの開発（オプション）

```bash
# Node.js v18以上が必要

# フロントエンド
cd frontend
npm install
npm run dev  # http://localhost:5173

# バックエンド（別ターミナル）
cd backend
npm install
npm run dev  # http://localhost:8080
```

---

## 📅 開発フェーズとスケジュール

### フェーズ1: 基盤構築（1週間）

#### 1.1 仮想開発環境のセットアップ
- **作業内容**:
  - Docker Compose設定ファイルの作成
  - フロントエンド/バックエンド用Dockerfileの作成
  - VS Code Dev Container設定
  - HTTPS対応のためのNginx設定（自己署名証明書）
  - 環境変数管理の仕組み構築
- **成果物**:
  - `docker-compose.yml`
  - `.devcontainer/devcontainer.json`
  - `nginx/nginx.conf`
  - セットアップ手順書（README.md更新）

#### 1.2 PWAプロジェクトの初期化
- **作業内容**:
  - Vite + React + TypeScriptプロジェクト作成
  - PWAプラグイン（vite-plugin-pwa）設定
  - Tailwind CSS導入
  - ESLint + Prettier設定
  - 基本的なフォルダ構造の作成
  - manifest.jsonの作成
- **成果物**:
  - 動作する最小限のPWA
  - アプリアイコン一式
  - Lighthouse PWAスコア90以上

#### 1.3 バックエンド（BFF）の初期セットアップ
- **作業内容**:
  - Express + TypeScriptプロジェクト作成
  - CORS設定
  - ロギング機構（Winston）
  - エラーハンドリングミドルウェア
  - ヘルスチェックエンドポイント（`/health`）
- **成果物**:
  - 起動可能なバックエンドサーバー
  - API仕様書（OpenAPI/Swagger）

---

### フェーズ2: コア機能実装（2週間）

#### 2.1 カメラ撮影機能の実装
- **作業内容**:
  - Media Capture API実装
  - カメラプレビュー表示
  - 撮影ボタンとキャプチャ処理
  - カメラ権限リクエスト処理
  - エラーハンドリング（カメラ未対応、権限拒否）
- **技術詳細**:
  ```typescript
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment',  // 背面カメラ
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  });
  ```
- **成果物**:
  - `CameraPage.tsx`
  - `useCamera.ts` カスタムフック
  - カメラ操作のユニットテスト

#### 2.2 画像セッション管理とプレビュー
- **作業内容**:
  - 複数ページ撮影のワークフロー実装
  - IndexedDBへの画像一時保存（Dexie.js使用）
  - サムネイルプレビュー表示
  - 画像の削除・並び替え機能
  - セッション状態管理（Zustand）
- **成果物**:
  - `ImagePreview.tsx` コンポーネント
  - `sessionStore.ts` 状態管理
  - `storage.service.ts` IndexedDB操作

#### 2.3 バックエンドAPI実装
- **作業内容**:
  - `/process-health-report` エンドポイント実装
  - multipart/form-data処理（Multer）
  - 画像データの検証（サイズ、形式）
  - LLM APIへのプロキシ処理
  - レスポンスのJSONスキーマ検証
- **API仕様**:
  ```
  POST /api/process-health-report
  Content-Type: multipart/form-data

  Request:
  - images: File[] (複数の画像ファイル)

  Response:
  {
    "受診者情報": { "氏名": string, "受診日": string },
    "検査結果": [{ "項目名": string, "値": string, "単位": string, "判定": string }],
    "総合所見": { "総合判定": string, "医師の所見": string }
  }
  ```
- **成果物**:
  - `health-report.controller.ts`
  - `llm.service.ts`
  - API統合テスト

#### 2.4 LLM API統合
- **作業内容**:
  - Chat GPT-5 thinking API連携実装
  - プロンプトエンジニアリング（spec.md記載内容を基に）
  - 画像エンコーディング（Base64変換）
  - APIレート制限対応（リトライロジック）
  - タイムアウト処理
- **プロンプト最適化ポイント**:
  - 項目の順序維持を明確に指示
  - 全項目抽出の徹底
  - null値の扱いを明示
  - JSON形式の厳格化
- **成果物**:
  - 実際の健診結果サンプルでの抽出精度検証
  - プロンプトテンプレート

#### 2.5 確認・編集画面の実装
- **作業内容**:
  - 抽出結果のテーブル表示
  - インライン編集機能（react-hook-form使用）
  - 行の追加・削除機能
  - データバリデーション
  - 編集状態の保存（ブラウザストレージ）
- **UI要件**:
  - モバイルフレンドリーな編集UI
  - タッチ操作対応
  - リアルタイムバリデーション表示
- **成果物**:
  - `EditPage.tsx`
  - `EditableTable.tsx` コンポーネント
  - フォームバリデーションルール

#### 2.6 Excel/CSV生成・ダウンロード機能
- **作業内容**:
  - ExcelJS統合
  - 縦持ち形式でのデータ整形
  - ファイル名自動生成（`健康診断結果_{氏名}_{受診日}.xlsx`）
  - Blob生成とダウンロードトリガー
  - CSV出力オプション実装
- **Excel出力仕様**:
  ```
  列: 氏名 | 受診日 | 検査項目 | 値 | 単位 | 判定
  各行: 1つの検査項目に対応
  ```
- **技術詳細**:
  ```typescript
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('健康診断結果');
  // データ追加...
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);
  // ダウンロードトリガー
  ```
- **成果物**:
  - `excel.service.ts`
  - サンプル出力ファイルでの検証

---

### フェーズ3: PWA機能と最適化（1週間）

#### 3.1 Service Workerとオフライン対応
- **作業内容**:
  - Workbox設定
  - 静的アセットのキャッシング戦略
  - APIレスポンスのキャッシュ（オプション）
  - オフライン時のフォールバック画面
- **キャッシュ戦略**:
  - HTML/CSS/JS: Cache First
  - 画像: Cache First
  - API: Network First（オフライン時はキャッシュ）
- **成果物**:
  - `sw.ts` Service Worker
  - オフライン動作テスト

#### 3.2 Add to Home Screen機能
- **作業内容**:
  - manifest.jsonの完全な設定
  - インストールプロンプトの実装
  - アプリアイコンの最適化（各サイズ生成）
  - スプラッシュスクリーン設定
- **成果物**:
  - iOS/Androidでのホーム画面追加動作確認

#### 3.3 レスポンシブデザインとモバイル最適化
- **作業内容**:
  - モバイルファーストUIの実装
  - タブレット/デスクトップレイアウト調整
  - タッチジェスチャー対応
  - パフォーマンス最適化（画像遅延読み込み、コード分割）
- **対応ブレークポイント**:
  - モバイル: 320px - 767px
  - タブレット: 768px - 1023px
  - デスクトップ: 1024px以上
- **成果物**:
  - Lighthouse パフォーマンススコア90以上
  - 各デバイスでの動作確認

---

### フェーズ4: 品質保証（1週間）

#### 4.1 エラーハンドリングとバリデーション
- **作業内容**:
  - ネットワークエラーハンドリング
  - LLM APIエラー処理
  - 画像品質チェック（ファイルサイズ、解像度）
  - ユーザー向けエラーメッセージ整備
  - エラーログ収集（Sentry等の導入検討）
- **成果物**:
  - 包括的なエラーハンドリング
  - ユーザーフレンドリーなエラー表示

#### 4.2 テスト環境構築と単体テスト
- **作業内容**:
  - Vitest環境セットアップ
  - React Testing Libraryでのコンポーネントテスト
  - Service層のユニットテスト
  - モック実装（LLM API、カメラAPI）
- **カバレッジ目標**: 80%以上
- **成果物**:
  - 各コンポーネント/サービスの単体テスト
  - テストカバレッジレポート

#### 4.3 E2Eテストとクロスブラウザテスト
- **作業内容**:
  - Playwright導入
  - E2Eテストシナリオ作成
    - 撮影 → 抽出 → 編集 → ダウンロード の全フロー
    - エラーケース
  - クロスブラウザテスト
    - Chrome/Edge（Chromium）
    - Safari（iOS/macOS）
    - Firefox
- **成果物**:
  - E2Eテストスイート
  - ブラウザ互換性レポート

---

### フェーズ5: デプロイメント（2-3日）

#### 5.1 本番環境セットアップ
- **フロントエンド**: Vercel
  - 自動HTTPS
  - グローバルCDN
  - 自動プレビューデプロイ
- **バックエンド**: Google Cloud Functions
  - サーバーレス実行
  - 自動スケーリング
  - Secret ManagerでのAPIキー管理
- **ドメイン設定**: カスタムドメイン（オプション）

#### 5.2 CI/CDパイプライン構築
- **作業内容**:
  - GitHub Actionsワークフロー作成
  - 自動テスト実行（PR時）
  - 自動デプロイ（mainブランチマージ時）
  - ビルド成果物の検証
- **ワークフロー**:
  ```yaml
  name: CI/CD
  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    test:
      - リント
      - 単体テスト
      - E2Eテスト

    deploy:
      - フロントエンド → Vercel
      - バックエンド → Google Cloud Functions
  ```
- **成果物**:
  - `.github/workflows/ci-cd.yml`
  - デプロイ手順書

#### 5.3 監視とログ設定
- **作業内容**:
  - エラートラッキング（Sentry）
  - アクセス解析（Google Analytics）
  - パフォーマンス監視（Vercel Analytics）
  - ログ集約（Cloud Logging）
- **成果物**:
  - 監視ダッシュボード
  - アラート設定

---

## 📊 スケジュールサマリー

| フェーズ | 期間 | 主要成果物 |
|---------|------|-----------|
| フェーズ1: 基盤構築 | 1週間 | Docker環境、PWA初期化、BFF基盤 |
| フェーズ2: コア機能実装 | 2週間 | カメラ、編集画面、Excel出力、LLM統合 |
| フェーズ3: PWA機能と最適化 | 1週間 | Service Worker、レスポンシブUI |
| フェーズ4: 品質保証 | 1週間 | テスト、エラーハンドリング |
| フェーズ5: デプロイメント | 2-3日 | 本番環境、CI/CD |
| **合計** | **約5週間** | **本番稼働可能なPWA** |

---

## 🔒 セキュリティ考慮事項

### APIキー管理
- バックエンドで一元管理（フロントエンドには露出しない）
- 環境変数による管理
- Secret Manager使用（本番環境）

### データ保護
- HTTPS通信の徹底
- 画像データの一時保存のみ（処理後は削除）
- IndexedDBのセキュアな利用

### CORS設定
- 許可オリジンの明示的な設定
- 本番環境では厳格なCORS制御

---

## 📈 成功指標（KPI）

- **開発速度**: 5週間以内に本番リリース
- **品質**: テストカバレッジ80%以上
- **パフォーマンス**: Lighthouse スコア全項目90以上
- **PWA適合性**: Lighthouse PWA チェック全項目合格
- **ブラウザ対応**: Chrome、Safari、Firefoxで動作確認済み
- **抽出精度**: 実際の健診結果で95%以上の項目を正確に抽出

---

## 🚀 今後の拡張可能性

### フェーズ2以降の機能追加候補
- **バッチ処理**: 複数人分の健診結果を一括処理
- **データ管理**: 過去の処理結果の保存・検索機能
- **役所提出フォーマット**: 特定様式への自動変換
- **OCR精度向上**: カスタムモデルのファイン��ューニング
- **多言語対応**: UI/出力ファイルの英語対応
- **クラウド同期**: 複数デバイス間でのデータ共有

---

## 📝 開発時の注意事項

### カメラAPI使用の制約
- **HTTPS必須**: カメラAPIはHTTPSまたはlocalhostでのみ動作
- **権限要求**: 初回アクセス時にユーザーの明示的な許可が必要
- **iOS Safari制約**: フルスクリーンモード、一部API制限あり

### PWAの制約
- **ファイル保存先**: ブラウザのダウンロードフォルダに限定（任意の場所を選択不可）
- **iOS制約**:
  - Service Workerキャッシュ上限50MB
  - Add to Home Screenは手動操作のみ（プロンプト表示不可）
- **ストレージ制限**: IndexedDBの容量制限（ブラウザにより異なる）

### 開発環境の考慮点
- **HTTPSローカル環境**: 自己署名証明書使用時のブラウザ警告対応
- **ホットリロード**: Dockerボリュームマウントでの開発体験最適化
- **クロスプラットフォームテスト**: BrowserStackやLambdaTest等の検討

---

## 🎯 まとめ

本開発計画は、仮想開発環境（Docker + Dev Container）を基盤とし、PWAアーキテクチャを採用することで、**迅速かつ低コストで高品質な健康診断結果OCRアプリケーション**を実現します。

**開発期間5週間**で、カメラ撮影からExcel出力までの全機能を実装し、クロスプラットフォーム対応・即座のアップデート・容易な配布を実現します。

仮想開発環境により、チーム全体で統一された開発環境を維持し、開発効率とコード品質を最大化します。
