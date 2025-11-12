# 健康診断結果OCRアプリケーション
# 任意の小変更を main（Production Branch）に push。

紙媒体の健康診断結果をデジタル化し、有所見項目を効率的に抽出・管理するためのPWA（Progressive Web App）アプリケーションです。

## 📋 プロジェクト概要

- **フロントエンド**: React + TypeScript + Vite (PWA)
- **バックエンド**: Node.js + Express + TypeScript
- **LLM統合**: OpenAI Chat GPT-5 thinking API
- **開発環境**: Docker + Docker Compose
- **リバースプロキシ**: Nginx (HTTPS対応)

## 🚀 クイックスタート

### 前提条件

以下がインストールされている必要があります：

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (最新版)
- [Git](https://git-scm.com/)
- (オプション) [VS Code](https://code.visualstudio.com/) または [Cursor](https://cursor.sh/)

### セットアップ手順

#### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd health_report_ocr
```

#### 2. 環境変数の設定

```bash
# ルートディレクトリの環境変数
cp .env.example .env

# バックエンドの環境変数
cp backend/.env.example backend/.env

# フロントエンドの環境変数
cp frontend/.env.example frontend/.env
```

`backend/.env` ファイルを編集して、OpenAI APIキーを設定してください：

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

#### 3. Docker環境の起動

```bash
# Dockerコンテナのビルドと起動
docker-compose up -d

# ログの確認
docker-compose logs -f
```

#### 4. アプリケーションへのアクセス

ブラウザで以下のURLにアクセス：

- **アプリケーション (HTTPS)**: https://localhost
  - ⚠️ 自己署名証明書のため、ブラウザで警告が表示されます
  - 「詳細設定」→「続行」で進んでください

- **フロントエンド (直接アクセス)**: http://localhost:5173
- **バックエンドAPI**: http://localhost:8080

### 開発環境の停止

```bash
# コンテナの停止
docker-compose down

# コンテナとボリュームの完全削除
docker-compose down -v
```

## 🛠️ 開発方法

### VS Code / Cursor を使用する場合

1. プロジェクトをVS Code/Cursorで開く
2. 「Reopen in Container」を選択
3. コンテナ内で開発が開始されます

### ホストマシンで直接開発する場合

```bash
# フロントエンド
cd frontend
npm install
npm run dev

# バックエンド（別ターミナル）
cd backend
npm install
npm run dev
```

## 📂 プロジェクト構造

```
health_report_ocr/
├── .devcontainer/          # VS Code Dev Container設定
├── frontend/               # PWAフロントエンド
│   ├── src/
│   ├── Dockerfile.dev
│   └── package.json
├── backend/                # BFFバックエンド
│   ├── src/
│   ├── Dockerfile.dev
│   └── package.json
├── nginx/                  # Nginx設定
│   ├── nginx.conf
│   └── certs/             # SSL証明書
├── shared/                 # 共通型定義
├── docker-compose.yml      # Docker Compose設定
├── .env.example            # 環境変数テンプレート
├── spec.md                 # 詳細設計書
├── plan.md                 # 開発計画書
└── README.md               # 本ファイル
```

## 🔧 よく使うコマンド

### Docker操作

```bash
# コンテナの状態確認
docker-compose ps

# ログの確認
docker-compose logs -f [service-name]

# コンテナに入る
docker-compose exec frontend sh
docker-compose exec backend sh

# コンテナの再起動
docker-compose restart [service-name]

# イメージの再ビルド
docker-compose build --no-cache
```

### npm操作（コンテナ内）

```bash
# フロントエンド
docker-compose exec frontend npm install [package-name]
docker-compose exec frontend npm run build

# バックエンド
docker-compose exec backend npm install [package-name]
docker-compose exec backend npm test
```

## 🐛 トラブルシューティング

### ポートが既に使用されている

```bash
# 使用中のポートを確認
netstat -ano | findstr :80
netstat -ano | findstr :443
netstat -ano | findstr :5173
netstat -ano | findstr :8080

# docker-compose.yml のポート設定を変更
```

### SSL証明書エラー

```bash
# 証明書の再生成
cd nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost.key -out localhost.crt \
  -subj "//CN=localhost"
```

### node_modules の同期エラー

```bash
# コンテナを完全に削除して再構築
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### カメラAPIが動作しない

- HTTPSでアクセスしていることを確認: https://localhost
- ブラウザのカメラ権限を確認
- 自己署名証明書の警告を「続行」で許可

## 🚀 Vercelへのデプロイ（試作品配布用）

このプロジェクトはVercelモノレポ構成でデプロイできます。開発環境（Docker Compose）はそのまま維持されます。

### 前提条件

- GitHubアカウント
- Vercelアカウント（無料プランでOK）
- リポジトリがGitHubにプッシュされていること

### デプロイ手順

#### 1. 依存パッケージのインストール

```bash
# バックエンドに @vercel/node を追加
cd backend
npm install
cd ..
```

#### 2. GitHubへプッシュ

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

#### 3. Vercelでプロジェクト作成

1. [Vercel](https://vercel.com)にログイン
2. 「Add New Project」をクリック
3. GitHubリポジトリを選択（`health_report_ocr`）
4. 以下の設定を確認：
   - **Framework Preset**: `Other`
   - **Root Directory**: 空欄（リポジトリルート）
   - **Build Command**: 自動検出（`vercel.json`で設定済み）
   - **Output Directory**: 自動検出（`frontend/dist`）

#### 4. 環境変数の設定

Vercelプロジェクト設定の「Environment Variables」で以下を追加：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `OPENAI_API_KEY` | `sk-your-api-key-here` | Production, Preview, Development |
| `CORS_ORIGIN` | `https://your-app.vercel.app` | Production（デプロイ後に設定） |

**注意**: 
- `OPENAI_API_KEY`は必須です
- `CORS_ORIGIN`は初回デプロイ後、Vercelが割り当てたURLを設定してください

#### 5. デプロイ実行

「Deploy」ボタンをクリックすると自動デプロイが開始されます（約3-5分）。

#### 6. デプロイ完了後の確認

デプロイが完了したら、以下をテスト：

```bash
# ヘルスチェック
curl https://your-app.vercel.app/api/health

# レスポンス例
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "environment": "production",
  "services": {
    "llm": "healthy"
  }
}
```

#### 7. CORS設定の更新（初回のみ）

1. Vercelプロジェクト設定の「Environment Variables」を開く
2. `CORS_ORIGIN`を`https://your-app.vercel.app`（実際のURL）に更新
3. 再デプロイ（「Redeploy」）

### デプロイされるエンドポイント

- **フロントエンド**: `https://your-app.vercel.app/`
- **API**: `https://your-app.vercel.app/api/`
  - `GET /api/health` - ヘルスチェック
  - `POST /api/process-health-report` - OCR処理
  - `POST /api/audit/exports` - 監査ログ

### 自動デプロイ

- `main`ブランチへのプッシュ → 本番環境へ自動デプロイ
- PRの作成 → プレビュー環境が自動生成

### ローカル開発との共存

Vercelデプロイ設定を追加しても、ローカル開発環境は変更ありません：

```bash
# ローカル開発（従来通り）
docker-compose up -d
# → http://localhost:5173 (frontend)
# → http://localhost:8080 (backend)
```

### トラブルシューティング

#### デプロイが失敗する

- ビルドログを確認（Vercelダッシュボード）
- `backend/package.json`の依存関係を確認
- 環境変数が正しく設定されているか確認

#### APIが404エラーを返す

- `/api/health`エンドポイントでヘルスチェック
- `vercel.json`のルーティング設定を確認
- Vercelの関数ログを確認

#### CORS エラーが発生する

- `CORS_ORIGIN`環境変数が正しく設定されているか確認
- フロントエンドのURLと一致しているか確認
- 再デプロイが必要な場合があります

## 📚 ドキュメント

- [詳細設計書](spec.md) - アプリケーションの詳細仕様
- [開発計画書](plan.md) - 開発フェーズとスケジュール
- [CLAUDE.md](CLAUDE.md) - Claude Codeへの指示

## 🔐 セキュリティ

- **環境変数**: `.env` ファイルは絶対にGitにコミットしないでください
- **SSL証明書**: 自己署名証明書は開発環境のみで使用してください
- **APIキー**: 本番環境ではSecret Managerを使用してください

## 📝 ライセンス

(ライセンス情報を記載)

## 👥 コントリビューター

(コントリビューター情報を記載)
