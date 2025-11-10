# Vercelデプロイ失敗の根本原因と対応策

**作成日**: 2025年11月10日  
**プロジェクト**: health_report_ocr  
**対象者**: 開発チーム全員

---

## 📋 概要

本プロジェクトをVercelにデプロイする際、複数の技術的問題により繰り返しデプロイが失敗しました。本ドキュメントでは、発生した問題の根本原因と対応策を詳細に記録し、今後の類似問題の予防と迅速な解決に役立てることを目的としています。

---

## 🔴 発生した問題の一覧

### 1. TypeScriptビルドエラー（型の互換性問題）
### 2. GitHubとVercelの統合不備（Webhook未設定）
### 3. vercel.json設定の不足
### 4. 古いコミットでデプロイされ続ける問題

---

## 問題1: TypeScriptビルドエラー（型の互換性問題）

### 🔍 症状

```
src/services/csv.service.ts(39,22): error TS2307: 
Type 'ArrayBuffer | SharedArrayBuffer' is not assignable to type 'BlobPart'.
  Type 'SharedArrayBuffer' is not assignable to type 'BlobPart'.
```

フロントエンドのビルドは成功するが、Vercelのビルド環境では型エラーが発生。

### 🎯 根本原因

**ローカル開発環境とVercelビルド環境のTypeScript型チェックの厳密さの違い**

```typescript
// 問題のあったコード（frontend/src/services/csv.service.ts:39）
const bytes = await encodeShiftJIS('\uFEFF' + content)
const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
return new Blob([buffer], { type: 'text/csv; charset=shift_jis' })
```

- `Uint8Array.buffer`プロパティは`ArrayBuffer | SharedArrayBuffer`型を返す
- `Blob`コンストラクタは`SharedArrayBuffer`を`BlobPart`として受け付けない
- Vercelの厳密なTypeScript環境でのみエラーとなる

### ✅ 対応策

**型アサーションを使用して明示的に`ArrayBuffer`として扱う**

```typescript
// 修正後のコード
const bytes = await encodeShiftJIS('\uFEFF' + content)
// Type assertion needed for strict TypeScript compatibility in build environments
const arrayBuffer = bytes.buffer.slice(0) as ArrayBuffer
return new Blob([arrayBuffer], { type: 'text/csv; charset=shift_jis' })
```

**ポイント**:
- `slice(0)`で新しいArrayBufferを作成
- `as ArrayBuffer`で型アサーションを追加
- Vercelの厳密な型チェックをパス

### 📚 学び

- **ローカルでビルドが成功してもCI/CD環境で失敗する可能性がある**
- **型の互換性は環境によって異なる場合がある**
- **本番ビルド前に厳密な型チェック（`tsc --strict`）を実行すべき**

---

## 問題2: GitHubとVercelの統合不備（Webhook未設定）

### 🔍 症状

- GitHubにコミットをプッシュしても、Vercelで新しいデプロイが自動的に開始されない
- 手動で「Redeploy」を実行しても、常に古いコミット（`756d628`）でデプロイされる
- 最新のコミット（`3677935`、`b035905`、`12dcfaa`）が反映されない

### 🎯 根本原因

**GitHubリポジトリにVercelのWebhookが設定されていなかった**

#### Webhookとは？
- GitHubでコミットやプッシュなどのイベントが発生した際に、外部サービス（Vercel）に通知を送る仕組み
- この通知により、Vercelは自動的に最新のコードでデプロイを開始する

#### 確認方法
```
GitHubリポジトリ → Settings → Webhooks
```
→ Vercelのwebhook（`https://vercel.com/...`）が存在しない

### ✅ 対応策

**新しいVercelプロジェクトを作成し、GitHubとの統合を正しく設定**

#### 手順：
1. **既存プロジェクトの削除または名前変更**
   - 古いプロジェクトを削除、または名前を変更（例：`health_report_ocr_old`）

2. **新規プロジェクトのインポート**
   - Vercelダッシュボード → 「Add New...」→「Project」
   - GitHubから`health_report_ocr`リポジトリをインポート
   - **この時点で自動的にWebhookが設定される**

3. **Webhook設定の確認**
   ```
   GitHubリポジトリ → Settings → Webhooks
   ```
   - `https://vercel.com/...`のURLが追加されていることを確認
   - Recent Deliveriesで正常に動作していることを確認

### 📚 学び

- **Vercelプロジェクトを手動で作成した場合、GitHub統合が不完全になる可能性がある**
- **デプロイの自動化にはWebhookが必須**
- **プロジェクト作成後は必ずWebhookの存在を確認すべき**
- **GitHubとVercelの統合は「Import from GitHub」機能を使用するのが最も確実**

---

## 問題3: vercel.json設定の不足

### 🔍 症状

```
api/index.ts(1,47): error TS2307: Cannot find module '@vercel/node'
api/index.ts(3,21): error TS2307: Cannot find module 'express'
...
backend/src/controllers/health-report.controller.ts(62,45): 
  error TS2307: Cannot find module '../services/llm.service'
```

- APIエンドポイント（`/api/process-health-report`）が404エラー
- `api/`ディレクトリの依存関係がインストールされない

### 🎯 根本原因

**`vercel.json`の設定が不完全で、モノレポ構成に対応していなかった**

#### 問題のあった設定：
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd backend && npm install"
}
```

**不足していた設定**:
1. APIルーティングの設定（`rewrites`）
2. サーバーレス関数の設定（`functions`）
3. `api/`ディレクトリの依存関係インストール

### ✅ 対応策

**完全な`vercel.json`設定**

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
      "maxDuration": 30
    }
  }
}
```

#### 各設定の役割：

1. **`installCommand`の修正**
   ```json
   "installCommand": "npm install --prefix backend && npm install --prefix api"
   ```
   - `backend/`と`api/`の両方の依存関係をインストール
   - `--prefix`を使用して各ディレクトリで`npm install`を実行

2. **`rewrites`の追加**
   ```json
   "rewrites": [
     {
       "source": "/api/:path*",
       "destination": "/api"
     }
   ]
   ```
   - すべての`/api/*`リクエストを`api/index.ts`にルーティング
   - これにより`/api/process-health-report`が正しく動作

3. **`functions`の追加**
   ```json
   "functions": {
     "api/index.ts": {
       "memory": 1024,
       "maxDuration": 30
     }
   }
   ```
   - サーバーレス関数のメモリと実行時間を設定
   - デフォルト値では不足する場合に対応

### 📚 学び

- **モノレポ構成では、各ディレクトリの依存関係を個別にインストールする必要がある**
- **Vercelのサーバーレス関数を使用する場合、明示的なルーティング設定が必須**
- **`vercel.json`は段階的に設定を追加し、各ステップでビルドログを確認すべき**

---

## 問題4: 古いコミットでデプロイされ続ける問題

### 🔍 症状

```
Build Logs:
Cloning github.com/akinori-seri-sdcj/health_report_ocr (Branch: main, Commit: 756d628)
```

- 最新のコミット（`12dcfaa`）をGitHubにプッシュ済み
- 手動で「Redeploy」を実行しても、常に古いコミット（`756d628`）でビルドされる
- `vercel.json`の変更が一切反映されない

### 🎯 根本原因

**Webhookが設定されていないため、Vercelが古いコミット参照に固定されていた**

#### 技術的な詳細：
- Webhookがない場合、Vercelは手動でRedeployする際に「最後に成功したデプロイのコミット」を参照し続ける
- GitHubの最新のコミットを取得する仕組みが動作しない
- `vercel.json`の変更も反映されない（古いコミットの`vercel.json`を使用）

### ✅ 対応策

**新規プロジェクトを作成してWebhookを正しく設定**

前述の「問題2」の対応策と同じ手順で解決。

### 📚 学び

- **デプロイが古いコミットに固定される場合、Webhook設定を最初に確認すべき**
- **手動Redeployは最新のコードをプルする保証がない**
- **問題が続く場合は、プロジェクトを作り直すのが最も早い解決策**

---

## 🎯 今後の予防策

### 1. **開発環境の統一**
```bash
# package.jsonに厳密な型チェックスクリプトを追加
{
  "scripts": {
    "type-check": "tsc --noEmit --strict",
    "build": "tsc --strict && vite build"
  }
}
```

### 2. **デプロイ前チェックリスト**
- [ ] ローカルで`npm run build`が成功することを確認
- [ ] `tsc --strict`で型エラーがないことを確認
- [ ] `vercel.json`の設定が完全であることを確認
- [ ] GitHubにWebhookが設定されていることを確認
- [ ] 環境変数が正しく設定されていることを確認

### 3. **プロジェクト作成時のベストプラクティス**
- Vercelプロジェクトは必ず「Import from GitHub」機能を使用
- 手動でプロジェクトを作成しない
- 作成後、GitHubのWebhook設定を確認

### 4. **モニタリングと通知**
- Vercelのデプロイ失敗通知をSlackやメールに連携
- Build Logsを定期的に確認
- デプロイ時のコミットハッシュを必ず確認

---

## 📊 問題解決のタイムライン

| 時刻 | 問題 | 対応 | 結果 |
|------|------|------|------|
| 10:53 | TypeScriptビルドエラー | `csv.service.ts`で型アサーションを追加 | ビルド成功 |
| 11:48 | 404エラー（APIが動作しない） | `vercel.json`にAPIルーティングと`api/`インストール追加 | まだ反映されず |
| 12:03 | 古いコミットでデプロイされる | 空のコミットをプッシュして再デプロイ試行 | 失敗（Webhook未設定） |
| 12:33 | Webhook未設定を発見 | 新規プロジェクトを作成し、GitHub統合を正しく設定 | **解決** |

---

## 🔧 最終的な正しい構成

### プロジェクト構造
```
health_report_ocr/
├── api/
│   ├── index.ts          # Vercelサーバーレス関数
│   ├── package.json      # API用の依存関係
│   └── tsconfig.json
├── backend/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── vercel.json           # Vercel設定ファイル
```

### vercel.json（最終版）
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
      "maxDuration": 30
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

### 必要な環境変数
- `OPENAI_API_KEY`: OpenAI APIキー（必須）
- `CORS_ORIGIN`: フロントエンドのURL（オプション）

---

## 📚 参考資料

- [Vercel Documentation - Monorepos](https://vercel.com/docs/monorepos)
- [Vercel Documentation - Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Documentation - Build Configuration](https://vercel.com/docs/build-step)
- [GitHub Webhooks Documentation](https://docs.github.com/en/webhooks)
- [TypeScript Strict Type Checking](https://www.typescriptlang.org/tsconfig#strict)

---

## ✅ 結論

本プロジェクトのデプロイ失敗は、以下の3つの主要な問題が複合的に発生したことが原因でした：

1. **TypeScript型の互換性問題**（コード修正で解決）
2. **GitHubとVercelの統合不備**（Webhook未設定）
3. **vercel.json設定の不足**（モノレポ対応不足）

最終的には、**新しいVercelプロジェクトを作成し、正しい設定でGitHub統合を行う**ことで解決しました。

今後の開発では、このドキュメントの教訓を活かし、同様の問題を未然に防ぐことができます。

---

**作成者**: AI Assistant  
**レビュー**: 開発チーム  
**最終更新**: 2025年11月10日

