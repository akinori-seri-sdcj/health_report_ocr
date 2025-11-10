# Vercelデプロイ問題の引き継ぎドキュメント

**作成日**: 2025年11月10日  
**プロジェクト**: health_report_ocr  
**目的**: 別のチャットセッションへの問題引き継ぎ

---

## 📋 現在の状況サマリー

### ✅ 達成できたこと

1. ✅ フロントエンドのTypeScript型エラーを修正（SharedArrayBuffer互換性）
2. ✅ vercel.jsonのスキーマバリデーションエラーを修正
3. ✅ 新しいVercelプロジェクトを作成してデプロイ成功（Status: Ready）
4. ✅ 環境変数`OPENAI_API_KEY`を設定済み

### ❌ 未解決の問題

**APIエンドポイント（`/api`）が500エラーで動作しない**

- フロントエンドは正常にデプロイされている
- `/api`にアクセスすると500エラー
- Runtime Logsで`Cannot find module`エラーが発生

---

## 🔴 現在の問題の詳細

### エラー内容

**Runtime Logs**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/backend/src/middleware/error-handler' 
imported from /var/task/api/index.js
    at finalizeResolution (node:internal/modules/esm/resolve:280:11)
    at moduleResolve (node:internal/modules/esm/resolve:865:10)
    at moduleResolveWithNodePath (node:internal/modules/esm/resolve:989:14)
    at defaultResolve (node:internal/modules/esm/resolve:1032:79)
    at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:783:12)
    ...
Node.js process exited with exit status: 1.
```

### 問題のコード構造

```
プロジェクト構造:
health_report_ocr/
├── api/
│   ├── index.ts          ← サーバーレス関数（Vercelがデプロイ）
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── controllers/  ← これらが見つからない
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    ├── package.json
    └── tsconfig.json
```

**`api/index.ts`の依存関係**:
```typescript
import { errorHandler } from '../backend/src/middleware/error-handler';
import healthReportRoutes from '../backend/src/routes/health-report.routes';
import auditRoutes from '../backend/src/routes/audit.routes';
import { healthCheck } from '../backend/src/controllers/health-report.controller';
```

### ブラウザでのアクセス結果

**URL**: `https://health-report-ocr.vercel.app/api`

**結果**:
- 何も表示されない（空白ページ）
- Browser Console: `Failed to load resource: the server responded with a status of 500 ()`
- エラーID: `hnd1::n8m26-1762771085015-68e5ed9b1a0c`

---

## 🎯 推測される原因

### 主要な原因

**Vercelのサーバーレス関数は、デフォルトで関数ファイル（`api/index.ts`）と同じディレクトリ内のファイルしかバンドルしない**

#### 詳細説明：

1. `api/index.ts`は`../backend/src/...`をインポートしている
2. Vercelは`api/`ディレクトリのみをサーバーレス関数としてバンドル
3. `backend/`ディレクトリは含まれない
4. 実行時に`Cannot find module`エラーが発生

#### アーキテクチャの問題：

- **モノレポ構成**: フロントエンド、バックエンド、APIが分離されている
- **相互依存**: `api/index.ts`が`backend/`の複数のファイルに依存
- **Vercelの制限**: サーバーレス関数は単一ディレクトリを前提としている

---

## 🔬 立てた仮説と実施した対応策

### 仮説1: `includeFiles`で解決できる

#### 仮説の内容：
`vercel.json`の`functions`設定で`includeFiles`プロパティを使用すれば、`backend/`ディレクトリもサーバーレス関数のバンドルに含められる。

#### 実施した対応策：

**コミット**: `b1773cd`

**`vercel.json`を修正**:
```json
{
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 30,
      "includeFiles": "backend/**"
    }
  }
}
```

#### 実施日時：
2025年11月10日 17:49頃

#### 検証状況：
**未確認** - 以下の理由で検証が完了していない：

1. GitHubにプッシュ済み（コミット: `b1773cd`）
2. **Webhookが設定されていない**ため、自動デプロイが実行されていない
3. 手動Redeployの実行を依頼したが、結果の報告がない

#### 次に確認すべきこと：

1. Vercelで手動Redeployを実行
   - 「Deployments」タブ → 最新のデプロイ → 「Redeploy」
   - 「Use existing Build Cache」のチェックを外す
2. 新しいデプロイのコミットハッシュが`b1773cd`であることを確認
3. デプロイ完了後、Runtime Logsを確認
4. `/api`エンドポイントにアクセスして動作確認

---

### 仮説2: `includeFiles`が効かない可能性

#### 仮説の内容：
`includeFiles`プロパティがVercelの一部のプランや設定で正しく動作しない可能性がある。

#### 根拠：
- Vercelの公式ドキュメントで`includeFiles`の記載が限定的
- 一部のユーザーレポートで動作しないケースがある
- Hobbyプランでの動作保証が不明

#### 代替案A: ファイルコピースクリプト

**実装案**:

1. **`scripts/copy-backend.js`を作成**:
   ```javascript
   const fs = require('fs-extra');
   
   // backendの必要なファイルをapi/にコピー
   fs.copySync('backend/src', 'api/backend-src', {
     overwrite: true,
     filter: (src) => !src.includes('node_modules')
   });
   
   console.log('Backend files copied to api/backend-src');
   ```

2. **`vercel.json`を修正**:
   ```json
   {
     "buildCommand": "node scripts/copy-backend.js && cd frontend && npm install && npm run build"
   }
   ```

3. **`api/index.ts`のインポートパスを修正**:
   ```typescript
   // 修正前
   import { errorHandler } from '../backend/src/middleware/error-handler';
   
   // 修正後
   import { errorHandler } from './backend-src/middleware/error-handler';
   ```

**メリット**:
- 確実に動作する
- Vercelの制限を回避

**デメリット**:
- ビルド時間が増加
- ファイル重複が発生
- コードの保守性が若干低下

#### 代替案B: アーキテクチャのリファクタリング

**実装案**:

`backend/`のロジックを`api/`ディレクトリ内に移動：

```
api/
├── index.ts
├── controllers/
│   ├── health-report.controller.ts
│   └── audit.controller.ts
├── services/
│   └── llm.service.ts
├── middleware/
│   ├── error-handler.ts
│   └── upload.ts
├── routes/
│   ├── health-report.routes.ts
│   └── audit.routes.ts
├── types/
│   └── health-report.schema.ts
├── utils/
│   └── logger.ts
├── package.json
└── tsconfig.json
```

**メリット**:
- Vercelのサーバーレス関数の構造に完全に適合
- 最も確実に動作
- `includeFiles`などの回避策が不要

**デメリット**:
- 大規模なリファクタリングが必要
- 既存のコード構造を大きく変更
- テストとデバッグの時間が必要

---

## 🔧 その他の試した対応策（成功したもの）

### 1. TypeScript型エラーの修正

**問題**: `ArrayBuffer | SharedArrayBuffer`型の互換性エラー

**対応**: `frontend/src/services/csv.service.ts`に型アサーション追加
```typescript
const arrayBuffer = bytes.buffer.slice(0) as ArrayBuffer
return new Blob([arrayBuffer], { type: 'text/csv; charset=shift_jis' })
```

**コミット**: `756d628`  
**結果**: ✅ 成功

---

### 2. vercel.jsonスキーマエラーの修正

**問題**: `maxRequestBodySize`プロパティがスキーマで許可されていない

**対応**: `vercel.json`から`maxRequestBodySize`を削除
```json
{
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 30
      // "maxRequestBodySize": "10mb" ← 削除
    }
  }
}
```

**コミット**: `0096cf2`  
**結果**: ✅ 成功（ビルドエラーが解消）

---

### 3. 新しいVercelプロジェクトの作成

**問題**: GitHubとVercelの統合不備（Webhook未設定）

**対応**: 既存プロジェクトを削除し、新規プロジェクトをGitHubからImport

**手順**:
1. 既存プロジェクトを削除
2. Vercelダッシュボードで「Add New... → Project」
3. GitHubから`health_report_ocr`をImport
4. 環境変数`OPENAI_API_KEY`を設定
5. デプロイ実行

**結果**: ✅ デプロイ自体は成功（Status: Ready）  
**残存問題**: APIが500エラー（現在の問題）

---

## 📊 現在のシステム状態

### Vercelデプロイ情報

**プロジェクト名**: health-report-ocr  
**デプロイURL**: `https://health-report-ocr.vercel.app`  
**最新デプロイ**: コミット `21b7b79`（Status: Ready）  
**環境変数**: `OPENAI_API_KEY` 設定済み

### Git情報

**ブランチ**: main  
**最新コミット（ローカル）**: `83878fd`
- `docs: Vercelデプロイ時の全問題と対応策の完全版ドキュメントを追加`

**未検証のコミット**: `b1773cd`
- `fix: サーバーレス関数にbackendディレクトリを含めるよう設定`
- このコミットでVercelの再デプロイが必要

### Webhook状態

**GitHubのWebhooks**: ❌ 設定されていない
- 自動デプロイが動作しない
- 手動Redeployが必要

### ファイル構成

**重要なファイル**:

1. **`vercel.json`** (最新)
   ```json
   {
     "buildCommand": "cd frontend && npm install && npm run build",
     "outputDirectory": "frontend/dist",
     "installCommand": "npm install --prefix backend && npm install --prefix api",
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "/api"
       }
     ],
     "functions": {
       "api/index.ts": {
         "memory": 1024,
         "maxDuration": 30,
         "includeFiles": "backend/**"
       }
     },
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           }
         ]
       }
     ]
   }
   ```

2. **`api/index.ts`** (依存関係)
   ```typescript
   import { errorHandler } from '../backend/src/middleware/error-handler';
   import healthReportRoutes from '../backend/src/routes/health-report.routes';
   import auditRoutes from '../backend/src/routes/audit.routes';
   import { healthCheck } from '../backend/src/controllers/health-report.controller';
   ```

3. **`api/package.json`** (依存関係)
   ```json
   {
     "dependencies": {
       "@vercel/node": "^3.0.0",
       "express": "^4.18.2",
       "cors": "^2.8.5",
       "helmet": "^7.1.0",
       "compression": "^1.7.4",
       "dotenv": "^16.3.1",
       "multer": "^1.4.5-lts.2",
       "winston": "^3.11.0",
       "zod": "^3.22.4",
       "openai": "^4.20.1",
       "axios": "^1.6.2"
     }
   }
   ```

---

## 🎯 次に実施すべきアクション（優先順位順）

### 【最優先】ステップ1: 最新コミットでのRedeploy検証

**目的**: `includeFiles: "backend/**"`が効いているか確認

**手順**:
1. Vercelダッシュボードで「Deployments」タブを開く
2. 最新のデプロイを開いて「Redeploy」をクリック
3. 「Use existing Build Cache」のチェックを**外す**
4. 「Redeploy」を実行
5. デプロイ完了を待つ（数分）
6. **Source**セクションでコミットハッシュが`b1773cd`であることを確認

**確認項目**:
- [ ] デプロイのStatus: Ready
- [ ] コミットハッシュ: `b1773cd`
- [ ] `/api`へのアクセス結果
- [ ] Runtime Logsのエラー内容

**期待される結果**:
- ✅ エラーが解消され、APIが正常に動作
- ❌ まだ同じ`Cannot find module`エラー → ステップ2へ

---

### ステップ2: Runtime Logsの詳細確認

**目的**: `includeFiles`が効いていない場合の詳細確認

**手順**:
1. Vercelダッシュボードで「Logs」または「Runtime Logs」タブを開く
2. 最新の500エラーを探す
3. エラーメッセージ全体をコピー

**確認すべき点**:
- まだ`Cannot find module '/var/task/backend/...'`エラーか？
- 別のエラーメッセージに変わっているか？（進展の可能性）
- エラースタックトレースに新しい情報はないか？

---

### ステップ3: Build Logsの確認

**目的**: `includeFiles`設定が正しく認識されているか確認

**手順**:
1. 「Deployments」タブ → 最新のデプロイ → 「Build Logs」タブ
2. 以下を確認：
   - `npm install --prefix backend && npm install --prefix api` が実行されているか
   - `Packaging function "api/index.ts"...` のセクションを確認
   - エラーメッセージの有無

---

### ステップ4A: `includeFiles`が効いていない場合の対応

**代替案Aの実装**（ファイルコピースクリプト）

1. **`scripts/copy-backend.js`を作成**
2. **`vercel.json`の`buildCommand`を修正**
3. **`api/index.ts`のインポートパスを修正**
4. コミット、プッシュ、Redeploy
5. 動作確認

---

### ステップ4B: 根本的な解決（リファクタリング）

**代替案Bの実装**（アーキテクチャ変更）

1. `backend/src/`のファイルを`api/`に移動
2. インポートパスを修正
3. `vercel.json`から`includeFiles`を削除
4. テスト実行
5. コミット、プッシュ、Redeploy

---

## 📝 重要な注意事項

### Webhookについて

**現状**: GitHubにWebhookが設定されていない

**影響**:
- GitHubにプッシュしても、自動デプロイが実行されない
- 毎回、手動でRedeployが必要

**対処**:
- 問題解決後、Webhookの設定を試みる
- または、手動Redeploy運用を継続

### 環境変数

**設定済み**: `OPENAI_API_KEY`

**注意事項**:
- 環境変数を変更した場合、必ずRedeployが必要
- 自動的には反映されない

### デプロイの確認方法

毎回のデプロイ後、以下を確認：
1. デプロイのStatus: Ready
2. コミットハッシュ: 期待通りか
3. `/api`エンドポイント: 正常に応答するか
4. Runtime Logs: エラーがないか

---

## 📚 関連ドキュメント

### プロジェクト内ドキュメント

1. **完全版トラブルシューティング**:
   - `documents/20251110_vercel_deploy_all_issues_solutions.md`
   - すべての問題と対応策を網羅

2. **初期のトラブルシューティング**:
   - `documents/20251110_vercel_deploy_troubleshooting.md`
   - 初期に発生した問題のまとめ

### 外部リソース

- [Vercel Functions Documentation](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Build Configuration](https://vercel.com/docs/build-step)
- [Vercel Functions Configuration Options](https://vercel.com/docs/functions/serverless-functions/runtimes)

---

## 🔄 引き継ぎ時の質問リスト

新しいチャットセッションで最初に確認すべきこと：

1. **最新のデプロイ状況**:
   - コミット`b1773cd`でRedeployを実行したか？
   - デプロイのStatusは？
   - コミットハッシュは正しいか？

2. **エラーの状態**:
   - `/api`エンドポイントの応答は？
   - Runtime Logsの最新エラーメッセージは？
   - エラー内容に変化はあったか？

3. **次のアクション**:
   - `includeFiles`が効いているか？
   - 効いていない場合、どの代替案を試すべきか？

---

## ✅ チェックリスト（引き継ぎ時に確認）

### 現状確認
- [ ] 最新のデプロイのコミットハッシュを確認
- [ ] `/api`エンドポイントへのアクセス結果を確認
- [ ] Runtime Logsのエラー内容を確認
- [ ] 環境変数`OPENAI_API_KEY`が設定されているか確認

### 未実施の対応策
- [ ] コミット`b1773cd`でのRedeploy検証
- [ ] `includeFiles`の効果確認
- [ ] 代替案A（ファイルコピー）の実装
- [ ] 代替案B（リファクタリング）の実装

### 長期的な対応
- [ ] GitHubとVercelのWebhook設定
- [ ] 自動デプロイの動作確認

---

**作成者**: AI Assistant  
**最終更新**: 2025年11月10日 18:00頃  
**次の担当者へ**: このドキュメントを参照して、ステップ1から順に実施してください。

