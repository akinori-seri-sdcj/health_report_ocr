ご質問にお答えします。

## サーバレス化はデプロイのみに限定できるか？

**はい、可能です。** 既存の開発環境（Docker Compose + Express通常起動）はそのまま維持し、Vercelデプロイ用の設定ファイルだけを追加する方法があります。

### 推奨アプローチ：「開発は従来通り、デプロイ時のみサーバレス化」

```
health_report_ocr/
├── frontend/           # 開発: npm run dev (Vite)
├── backend/            # 開発: npm run dev (Express通常起動)
├── docker-compose.yml  # 開発環境（変更なし）
└── vercel.json         # ← 新規追加（デプロイ設定のみ）
```

**ポイント**：
- `backend/src/index.ts`（Expressの`app.listen()`）は**そのまま残す**→ローカル開発で使用
- Vercelデプロイ用に`vercel.json`を追加し、既存のExpressアプリをサーバレス関数として**リダイレクト**するだけ
- コードの二重管理は不要

---

## 「フロントエンドのみ別プロジェクト」の意味

**誤解を招く表現でした。訂正します。**

前回提案した「フロント/バックエンドを別のVercelプロジェクト」は：
- GitHubリポジトリは**1つ**（`health_report_ocr`）
- Vercel上で**2つのプロジェクト**を作成
  - プロジェクト1：フロントエンド（Root Directory = `frontend/`）
  - プロジェクト2：バックエンド（Root Directory = `backend/`）

つまり、**同じGitリポジトリを異なるRoot Directoryで2回インポート**する形です。

### しかし、より簡単な方法があります

試作品配布目的であれば、**Vercel Monorepo対応**を使い、**1つのVercelプロジェクト**でフロント+バックエンドをまとめてデプロイできます。

---

## 最適解：Monorepo構成で1プロジェクトにまとめる（開発環境は変更なし）

### 構成イメージ

```
health_report_ocr/  ← GitHubリポジトリ（既存）
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   └── index.ts    # 既存のapp.listen()はそのまま
│   └── package.json
├── api/                # ← 新規追加（Vercelデプロイ専用）
│   └── index.ts        # サーバレス化エントリ
├── vercel.json         # ← 新規追加（デプロイ設定）
├── package.json        # ← ルート用（オプション）
└── docker-compose.yml  # 開発環境（変更なし）
```

### 手順

#### 1. ルートに`vercel.json`を作成

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd backend && npm install",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 2. ルートに`api/index.ts`を作成（デプロイ専用）

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from '../backend/src/middleware/error-handler';
import healthReportRoutes from '../backend/src/routes/health-report.routes';
import auditRoutes from '../backend/src/routes/audit.routes';
import { healthCheck } from '../backend/src/controllers/health-report.controller';

// 既存のExpressアプリを再利用
const app = express();
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', healthCheck);
app.use('/api/process-health-report', healthReportRoutes);
app.use('/api/audit', auditRoutes);
app.use(errorHandler);

// Vercelサーバレス用エクスポート
export default async (req: VercelRequest, res: VercelResponse) => {
  return new Promise((resolve) => {
    app(req as any, res as any, () => {
      resolve(undefined);
    });
  });
};
```

#### 3. `backend/package.json`に型定義追加

```bash
cd backend
npm install --save-dev @vercel/node
```

#### 4. `frontend/src/api/healthReportApi.ts`の環境変数

既存コードはそのままでOK：

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? (window.location.protocol === 'https:' ? '/api' : 'http://localhost:8080')
    : '/api')
```

**動作**：
- ローカル開発：`http://localhost:8080`（Docker Composeのバックエンド）
- Vercel本番：`/api`（同じドメインの`/api/*`がサーバレス関数にルーティング）

#### 5. Vercel環境変数設定

GitHub連携後、Vercelプロジェクト設定で追加：
- `OPENAI_API_KEY`（必須）
- `CORS_ORIGIN`（例：`https://your-app.vercel.app`、省略時は`*`）

#### 6. GitHubへプッシュ＆Vercelデプロイ

```bash
git add vercel.json api/
git commit -m "Add Vercel deployment config"
git push origin main
```

Vercel側：
1. プロジェクト作成 → GitHubリポジトリ連携
2. Root Directory：**空欄**（リポジトリルート）
3. Framework Preset：**Other**
4. 自動デプロイ開始

---

## 開発フロー（変更なし）

```bash
# ローカル開発（従来通り）
docker-compose up -d
# → http://localhost:5173 (frontend)
# → http://localhost:8080 (backend)

# コード編集
# → frontend/src/**, backend/src/**

# コミット＆プッシュ
git push
# → Vercel自動デプロイ
# → https://your-app.vercel.app
```

---

## まとめ

| 項目 | ローカル開発 | Vercel本番 |
|------|------------|-----------|
| **フロント** | Vite dev server (5173) | 静的ファイル配信 |
| **バックエンド** | Express通常起動 (8080) | サーバレス関数 (`/api/*`) |
| **コード** | `backend/src/index.ts`使用 | `api/index.ts`使用（既存コード再利用） |
| **変更点** | **なし** | `vercel.json` + `api/index.ts`のみ追加 |

**サーバレスはデプロイのみに限定可能**です。開発は既存の構成のまま、試作品配布用にVercel設定を追加するだけで対応できます。



完了しました！以下、あなたが行う作業手順をまとめます。

## 📋 デプロイまでの作業手順

### ステップ1: 依存パッケージのインストール

```bash
# バックエンドに @vercel/node を追加
cd backend
npm install
cd ..
```

### ステップ2: GitHubへプッシュ

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

**追加されたファイル**:
- `vercel.json` - Vercelデプロイ設定
- `api/index.ts` - サーバレス関数エントリポイント
- `.gitignore` - Vercel関連を除外
- `backend/package.json` - `@vercel/node`を追加
- `README.md` - デプロイ手順を追記

### ステップ3: Vercelでプロジェクト作成

1. **[Vercel](https://vercel.com)にログイン**
2. **「Add New Project」をクリック**
3. **GitHubリポジトリを選択**（`health_report_ocr`）
4. **設定を確認**：
   - Framework Preset: **Other**
   - Root Directory: **空欄**（リポジトリルート）
   - Build Command: 自動検出
   - Output Directory: 自動検出

### ステップ4: 環境変数の設定

Vercelプロジェクト設定の「**Environment Variables**」タブで追加：

| 変数名 | 値 | 適用環境 |
|--------|-----|---------|
| `OPENAI_API_KEY` | `sk-your-api-key-here` | Production, Preview, Development |

**注意**: `CORS_ORIGIN`は初回デプロイ後に設定します（次のステップ）

### ステップ5: デプロイ実行

**「Deploy」ボタンをクリック** → 約3-5分で完了

### ステップ6: デプロイ完了後の確認

ブラウザまたはターミナルで確認：

```bash
# デプロイされたURLにアクセス（例）
https://health-report-ocr.vercel.app/

# APIヘルスチェック
curl https://health-report-ocr.vercel.app/api/health
```

### ステップ7: CORS設定の更新（初回のみ）

1. Vercelが割り当てた実際のURLをコピー（例: `https://health-report-ocr.vercel.app`）
2. Vercelプロジェクト設定 → **Environment Variables**
3. 新規追加:
   - 変数名: `CORS_ORIGIN`
   - 値: `https://your-actual-url.vercel.app`
   - 環境: Production
4. **「Redeploy」**で再デプロイ

---

## ✅ 完了！

これでユーザーは以下のURLでアプリを試せます：
- **アプリ**: `https://your-app.vercel.app/`
- **API**: `https://your-app.vercel.app/api/`

## 🔄 今後の更新方法

```bash
# コード修正後
git add .
git commit -m "機能追加"
git push origin main
# → 自動で本番環境が更新されます
```

## 🛠️ ローカル開発（変更なし）

```bash
# 従来通りDocker Composeで開発可能
docker-compose up -d
# → http://localhost:5173 (frontend)
# → http://localhost:8080 (backend)
```

何か質問や問題があればお知らせください！