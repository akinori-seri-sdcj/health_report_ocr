# Vercelデプロイ時の全問題と対応策（完全版）

**作成日**: 2025年11月10日  
**プロジェクト**: health_report_ocr  
**対象者**: Vercelデプロイを実施する開発者全員

---

## 📋 目次

1. [TypeScript型エラー（SharedArrayBuffer互換性）](#問題1-typescript型エラーsharedarraybuffer互換性)
2. [vercel.jsonスキーマバリデーションエラー](#問題2-verceljsonスキーマバリデーションエラー)
3. [GitHubとVercelの統合不備（Webhook未設定）](#問題3-githubとvercelの統合不備webhook未設定)
4. [古いコミットでデプロイされ続ける問題](#問題4-古いコミットでデプロイされ続ける問題)
5. [サーバーレス関数でbackendディレクトリが見つからない問題](#問題5-サーバーレス関数でbackendディレクトリが見つからない問題)
6. [環境変数の設定](#問題6-環境変数の設定)
7. [デプロイプロセス全体のチェックリスト](#デプロイプロセス全体のチェックリスト)

---

## 問題1: TypeScript型エラー（SharedArrayBuffer互換性）

### 🔍 症状

```
src/services/csv.service.ts(39,22): error TS2322: 
Type 'ArrayBuffer | SharedArrayBuffer' is not assignable to type 'BlobPart'.
  Type 'SharedArrayBuffer' is not assignable to type 'BlobPart'.
```

- ローカルではビルドが成功する
- Vercelのビルド環境でのみ型エラーが発生
- フロントエンドのビルドが失敗する

### 🎯 原因

**ローカル開発環境とVercelビルド環境のTypeScript型チェックの厳密さの違い**

`Uint8Array.buffer`プロパティは`ArrayBuffer | SharedArrayBuffer`型を返すが、`Blob`コンストラクタは`SharedArrayBuffer`を`BlobPart`として受け付けない。

**問題のあったコード**:
```typescript
const bytes = await encodeShiftJIS('\uFEFF' + content)
const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
return new Blob([buffer], { type: 'text/csv; charset=shift_jis' })
```

### ✅ 対応策

**型アサーションを使用して明示的に`ArrayBuffer`として扱う**

```typescript
const bytes = await encodeShiftJIS('\uFEFF' + content)
// Type assertion needed for strict TypeScript compatibility in build environments
const arrayBuffer = bytes.buffer.slice(0) as ArrayBuffer
return new Blob([arrayBuffer], { type: 'text/csv; charset=shift_jis' })
```

**修正ファイル**: `frontend/src/services/csv.service.ts`

### 📚 予防策

- **ローカルでも厳密な型チェックを実行**
  ```bash
  cd frontend
  npx tsc --noEmit --strict
  ```
- **package.jsonにスクリプトを追加**
  ```json
  {
    "scripts": {
      "type-check": "tsc --noEmit --strict",
      "prebuild": "npm run type-check"
    }
  }
  ```

---

## 問題2: vercel.jsonスキーマバリデーションエラー

### 🔍 症状

```
Build Failed

The 'vercel.json' schema validation failed with the following message: 
'functions.api/index.ts' should NOT have additional property 'maxRequestBodySize'
```

- ビルドが開始される前にバリデーションエラーで失敗
- Build Logsが表示されない
- エラー率100%

### 🎯 原因

**Vercelの`vercel.json`スキーマでサポートされていないプロパティを使用**

`maxRequestBodySize`は、Vercelの`vercel.json`スキーマで許可されていない（または古いバージョンで削除された）プロパティ。

**問題のあった設定**:
```json
{
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 30,
      "maxRequestBodySize": "10mb"  // ← これがエラーの原因
    }
  }
}
```

### ✅ 対応策

**未サポートのプロパティを削除**

```json
{
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**修正ファイル**: `vercel.json`

### 📚 注意事項

- **デフォルトのリクエストボディサイズ制限**: 4.5MB（Hobby/Pro共通）
- **画像サイズが大きい場合の対処**:
  1. フロントエンドで画像を圧縮（推奨）
  2. 長辺を1200px程度にリサイズ
  3. JPEG品質を80%程度に設定

### 🔗 参考資料

- [Vercel Functions Configuration](https://vercel.com/docs/functions/serverless-functions/runtimes)
- [Vercel Limits](https://vercel.com/docs/functions/serverless-functions/limits)

---

## 問題3: GitHubとVercelの統合不備（Webhook未設定）

### 🔍 症状

- GitHubにコミットをプッシュしても、Vercelで新しいデプロイが自動的に開始されない
- 手動で「Redeploy」を実行しても、常に古いコミットでデプロイされる
- 最新のコミットが反映されない
- GitHubのSettings → Webhooksページに、Vercelのwebhookが存在しない

### 🎯 原因

**GitHubリポジトリにVercelのWebhookが設定されていない**

#### Webhookとは？
GitHubでコミットやプッシュなどのイベントが発生した際に、外部サービス（Vercel）に通知を送る仕組み。この通知により、Vercelは自動的に最新のコードでデプロイを開始する。

#### なぜWebhookが設定されないのか？
- Vercelプロジェクトを手動で作成した場合
- GitHubのVercel Appアクセス権限が不足している
- 古いVercelプロジェクトで統合が壊れている

### ✅ 対応策

#### 方法1: GitHubのVercel App権限を確認・修正

1. **GitHubの右上のプロフィールアイコン**をクリック
2. 「**Settings**」を選択
3. 左メニューから「**Applications**」→「**Installed GitHub Apps**」
4. 「**Vercel**」アプリを探して「**Configure**」をクリック
5. **Repository access**セクションで：
   - 「**All repositories**」または
   - 「**Only select repositories**」で対象リポジトリを選択
6. 対象リポジトリが含まれているか確認
7. 「**Save**」をクリック

#### 方法2: VercelでGit連携を再接続

1. **Vercelダッシュボード**を開く
2. プロジェクトを開く
3. 「**Settings**」タブ → 左メニュー「**Git**」
4. 「**Connected Git Repository**」セクションで「**Disconnect**」をクリック
5. 再度「**Connect Git Repository**」をクリック
6. GitHubを選択し、リポジトリを接続

#### 方法3: Vercelプロジェクトを作り直す（最も確実）

**これが最も確実で推奨される方法です。**

##### ステップ1: 現在のプロジェクトを削除または名前変更

1. Vercelダッシュボード → プロジェクト → 「**Settings**」タブ
2. 左メニュー「**General**」
3. 下にスクロールして：
   - **オプションA**: 「**Project Name**」を変更（例：`project_name_old`）
   - **オプションB**: 「**Delete Project**」で削除

##### ステップ2: 新しいプロジェクトを作成

1. Vercelダッシュボードのトップページ
2. 「**Add New...**」→「**Project**」
3. 「**Import Git Repository**」セクションで：
   - リポジトリが表示されない場合：「**Adjust GitHub App Permissions**」をクリック
   - リポジトリを見つけて「**Import**」をクリック
4. プロジェクト設定画面：
   - **Framework Preset**: Other
   - **Build Command**: 空欄（`vercel.json`を使用）
   - **Output Directory**: 空欄（`vercel.json`を使用）
   - **Install Command**: 空欄（`vercel.json`を使用）
5. 環境変数を設定：
   - `OPENAI_API_KEY`: OpenAI APIキー
6. 「**Deploy**」をクリック

##### ステップ3: Webhookが設定されたか確認

1. GitHubの「**Settings**」→「**Webhooks**」ページをリフレッシュ
2. `https://vercel.com/...` のようなURLのWebhookが追加されているか確認

### 📚 確認方法

#### GitHubでWebhookを確認：
```
GitHubリポジトリ → Settings → Webhooks
→ Vercelのwebhook（https://vercel.com/...）が存在するか確認
```

#### Webhookの動作確認：
1. Webhookの「**Edit**」をクリック
2. 「**Recent Deliveries**」タブで最新のリクエストを確認
3. 緑のチェックマーク ✓ = 成功
4. 赤いXマーク ✗ = 失敗（エラー内容を確認）

### ⚠️ Webhookなしで運用する場合

Webhookが設定できない場合、手動デプロイで運用することも可能：

1. コードをGitHubにプッシュ
2. Vercelダッシュボードで「**Deployments**」タブを開く
3. 最新のデプロイを開いて「**Redeploy**」をクリック
4. 「**Use existing Build Cache**」のチェックを外す
5. 「**Redeploy**」をクリック

---

## 問題4: 古いコミットでデプロイされ続ける問題

### 🔍 症状

```
Build Logs:
Cloning github.com/.../health_report_ocr (Branch: main, Commit: 756d628)
```

- 最新のコミット（例：`12dcfaa`）をGitHubにプッシュ済み
- 手動で「Redeploy」を実行しても、常に古いコミット（例：`756d628`）でビルドされる
- `vercel.json`の変更が一切反映されない
- 最新のコード変更が動作しない

### 🎯 原因

**Webhookが設定されていないため、Vercelが古いコミット参照に固定されている**

#### 技術的な詳細：
- Webhookがない場合、Vercelは手動でRedeployする際に「最後に成功したデプロイのコミット」を参照し続ける
- GitHubの最新のコミットを取得する仕組みが動作しない
- `vercel.json`や他のファイルの変更も反映されない（古いコミットの内容を使用）

### ✅ 対応策

#### 方法1: GitHubとVercelの統合を修正

「**問題3: GitHubとVercelの統合不備（Webhook未設定）**」の対応策を実施してください。

#### 方法2: 空のコミットで強制的に再プッシュ

Webhook設定後、空のコミットをプッシュして自動デプロイをトリガー：

```bash
git commit --allow-empty -m "trigger: Vercel再デプロイ（最新コミットを使用）"
git push origin main
```

#### 方法3: 新しいVercelプロジェクトを作成

最も確実な方法。「**問題3**」の「方法3」を参照。

### 📚 デバッグ方法

#### 現在デプロイされているコミットを確認：

1. Vercelダッシュボード → 「**Deployments**」タブ
2. 最新のデプロイ（Currentと表示）をクリック
3. 「**Source**」セクションでコミットハッシュを確認
4. ローカルで確認：
   ```bash
   git log --oneline -5
   ```
5. 最新のコミットハッシュと一致しているか確認

---

## 問題5: サーバーレス関数でbackendディレクトリが見つからない問題

### 🔍 症状

```
Runtime Logs:
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/backend/src/middleware/error-handler' 
imported from /var/task/api/index.js
```

- APIエンドポイント（`/api`）が404または500エラー
- フロントエンドは正常に動作
- Runtime Logsで`Cannot find module`エラー
- `backend/`ディレクトリ内のファイルがインポートできない

### 🎯 原因

**Vercelのサーバーレス関数は、デフォルトで関数ファイル（`api/index.ts`）と同じディレクトリ内のファイルしかバンドルしない**

#### モノレポ構成の問題：
```
プロジェクト/
├── api/
│   └── index.ts          ← サーバーレス関数（Vercelがバンドル）
├── backend/
│   └── src/
│       ├── controllers/  ← これらが含まれない！
│       ├── services/
│       └── middleware/
└── frontend/
```

`api/index.ts`が`../backend/src/...`をインポートしているが、Vercelは`backend/`ディレクトリをサーバーレス関数のバンドルに含めない。

### ✅ 対応策

#### 対応策1: vercel.jsonで`includeFiles`を設定

**最も推奨される方法**

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

**修正ファイル**: `vercel.json`

#### 対応策2: backendの必要なファイルをapi/ディレクトリにコピー

ビルド時に必要なファイルをコピーするスクリプトを作成：

**`scripts/copy-backend.js`を作成**:
```javascript
const fs = require('fs-extra');

// backendの必要なファイルをapi/にコピー
fs.copySync('backend/src', 'api/backend-src', {
  overwrite: true,
  filter: (src) => !src.includes('node_modules')
});

console.log('Backend files copied to api/backend-src');
```

**`vercel.json`を修正**:
```json
{
  "buildCommand": "node scripts/copy-backend.js && cd frontend && npm install && npm run build",
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**`api/index.ts`のインポートパスを修正**:
```typescript
// 修正前
import { errorHandler } from '../backend/src/middleware/error-handler';

// 修正後
import { errorHandler } from './backend-src/middleware/error-handler';
```

#### 対応策3: backendロジックをapi/内に統合（リファクタリング）

**最も確実だが、作業量が多い方法**

```
api/
├── index.ts
├── controllers/
├── services/
├── middleware/
├── routes/
└── types/
```

バックエンドのロジックを`api/`ディレクトリ内に移動し、一つのサーバーレス関数として動作させる。

### 📚 デバッグ方法

#### Runtime Logsでエラーを確認：

1. Vercelダッシュボード → プロジェクト → 「**Logs**」または「**Runtime Logs**」タブ
2. 最新の500エラーを探す
3. `Cannot find module`エラーが表示されているか確認
4. 見つからないモジュールのパスを確認

#### Build Logsでバンドル内容を確認：

1. 「**Deployments**」タブ → 最新のデプロイ → 「**Build Logs**」
2. `Functions`セクションで以下を確認：
   ```
   Packaging function "api/index.ts"...
   ```
3. どのファイルがバンドルされているか確認

### ⚠️ 既知の制限事項

- **`includeFiles`の動作**:
  - すべてのVercelアカウントタイプで動作するとは限らない
  - Proプランでより確実に動作する可能性がある
- **ファイルサイズ制限**:
  - サーバーレス関数のバンドルサイズには上限がある（50MB圧縮後）
  - `node_modules`は自動的に含まれる

---

## 問題6: 環境変数の設定

### 🔍 症状

- OCR処理が500エラーで失敗
- Runtime Logsに以下のようなエラー：
  ```
  Error: OpenAI API key is not set
  Error: The api_key client option must be set
  ```
- APIは起動するが、OpenAI APIへのリクエストが失敗

### 🎯 原因

**環境変数が設定されていない、または変数名が間違っている**

#### よくある間違い：
- `OPEN_API_KEY` （間違い）
- `OPENAI_API_KEY` （正しい）

### ✅ 対応策

#### ステップ1: 環境変数を設定

1. **Vercelダッシュボード**を開く
2. プロジェクトを開く
3. 「**Settings**」タブ → 左メニュー「**Environment Variables**」
4. 「**Add New**」または「**+ Add Variable**」をクリック
5. 以下を入力：
   - **Key**: `OPENAI_API_KEY` （正確に入力）
   - **Value**: （あなたのOpenAI APIキー、`sk-`で始まる文字列）
   - **Environments**: すべてにチェック（Production、Preview、Development）
6. 「**Save**」をクリック

#### ステップ2: Redeployを実行（重要！）

**環境変数を追加・変更した後は、必ずRedeployが必要です。**

1. 「**Deployments**」タブを開く
2. 最新のデプロイを開く
3. 「**Redeploy**」ボタンをクリック
4. 「**Use existing Build Cache**」のチェックを外す
5. 「**Redeploy**」をクリック

### 📚 環境変数の確認方法

#### Vercelダッシュボードで確認：
```
Settings → Environment Variables → 変数名と環境を確認
```

#### Runtime Logsで確認（デバッグ用）:

**注意**: APIキーの値は表示されません。存在確認のみ。

`api/index.ts`に以下のデバッグコードを一時的に追加（本番環境では削除すること）：

```typescript
console.log('Environment check:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7)
});
```

### ⚠️ セキュリティ注意事項

- **APIキーをコードに直接書かない**
- **APIキーをGitHubにコミットしない**
- **`.env`ファイルを`.gitignore`に追加**
- **Vercelの環境変数機能を使用**

---

## デプロイプロセス全体のチェックリスト

### 📋 初回デプロイ時

#### 1. ローカルでのビルド確認
- [ ] `cd frontend && npm install && npm run build` が成功
- [ ] `cd backend && npm install && tsc` が成功
- [ ] `npx tsc --noEmit --strict` で型エラーがない

#### 2. vercel.json の設定確認
- [ ] `buildCommand`が正しい
- [ ] `outputDirectory`が正しい
- [ ] `installCommand`が正しい
- [ ] `rewrites`でAPIルーティングが設定されている
- [ ] `functions`で必要な設定が含まれている
- [ ] スキーマバリデーションエラーがない

#### 3. 環境変数の設定
- [ ] Vercelダッシュボードで環境変数を設定
- [ ] 変数名が正確（例：`OPENAI_API_KEY`）
- [ ] すべての環境（Production、Preview、Development）にチェック

#### 4. GitHubとVercelの統合確認
- [ ] VercelプロジェクトがGitHubリポジトリに接続されている
- [ ] GitHubのSettings → WebhooksにVercelのwebhookが存在する
- [ ] Production Branchが`main`に設定されている

#### 5. デプロイ実行
- [ ] Vercelで「Deploy」ボタンをクリック
- [ ] Build Logsでエラーがないことを確認
- [ ] デプロイが「Ready」ステータスになる

#### 6. 動作確認
- [ ] フロントエンドのURLにアクセスできる
- [ ] `/api`エンドポイントが正常に応答する
- [ ] OCR機能が正常に動作する

---

### 📋 コード変更後のデプロイ

#### Webhookあり（自動デプロイ）:
1. [ ] コードを変更
2. [ ] ローカルでビルドテスト
3. [ ] GitHubにプッシュ
4. [ ] Vercelで自動デプロイが開始されることを確認
5. [ ] デプロイ完了を待つ
6. [ ] 動作確認

#### Webhookなし（手動デプロイ）:
1. [ ] コードを変更
2. [ ] ローカルでビルドテスト
3. [ ] GitHubにプッシュ
4. [ ] Vercelダッシュボードで「Redeploy」を実行
5. [ ] 「Use existing Build Cache」のチェックを外す
6. [ ] デプロイ完了を待つ
7. [ ] 動作確認

---

### 📋 環境変数変更時

1. [ ] Vercelダッシュボードで環境変数を変更
2. [ ] 「Save」をクリック
3. [ ] **必ずRedeployを実行**（環境変数の変更は自動的に反映されない）
4. [ ] デプロイ完了を待つ
5. [ ] 動作確認

---

## トラブルシューティングフローチャート

### ビルドが失敗する場合

```
Build Logsにエラーがある
├─ TypeScriptエラー
│  └─ → 問題1の対応策を参照
├─ vercel.jsonバリデーションエラー
│  └─ → 問題2の対応策を参照
└─ npm installエラー
   └─ → package.jsonの依存関係を確認
```

### デプロイは成功するがAPIが動作しない場合

```
Runtime Logsを確認
├─ Cannot find module エラー
│  └─ → 問題5の対応策を参照
├─ OpenAI API key エラー
│  └─ → 問題6の対応策を参照
└─ その他のエラー
   └─ → エラーメッセージで検索
```

### 新しいデプロイが開始されない場合

```
GitHubにプッシュしても反応がない
└─ → 問題3の対応策を参照（Webhook確認）

Redeployしても古いコミットでビルドされる
└─ → 問題4の対応策を参照
```

---

## 参考資料

### Vercel公式ドキュメント

- [Vercel Functions](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Git Integration](https://vercel.com/docs/deployments/git)
- [Build Configuration](https://vercel.com/docs/build-step)
- [Troubleshooting](https://vercel.com/docs/errors)

### TypeScript

- [TypeScript Strict Type Checking](https://www.typescriptlang.org/tsconfig#strict)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

### GitHub

- [GitHub Webhooks](https://docs.github.com/en/webhooks)
- [GitHub Apps](https://docs.github.com/en/apps)

---

## よくある質問（FAQ）

### Q1: Webhookがなくてもデプロイできますか？

**A**: はい、手動でRedeployを実行することで可能です。ただし、自動デプロイの利便性は失われます。

---

### Q2: 環境変数を変更したらすぐに反映されますか？

**A**: いいえ。環境変数を変更した後は、**必ずRedeployを実行する必要があります**。

---

### Q3: Hobby プランでも問題なくデプロイできますか？

**A**: 基本的には可能ですが、以下の制限があります：
- サーバーレス関数の実行時間：10秒
- サーバーレス関数のメモリ：1024MB
- リクエストボディサイズ：4.5MB

大きな画像を処理する場合や、LLMのレスポンスが遅い場合は、Pro プランが必要になる可能性があります。

---

### Q4: `includeFiles`が効かない場合はどうすればいいですか？

**A**: 以下の順で試してください：
1. `vercel.json`の構文が正しいか確認
2. 別のデプロイを実行して確認
3. 対応策2（ファイルコピー）または対応策3（リファクタリング）を検討

---

### Q5: デプロイは成功するのにアプリが動作しません

**A**: 以下を順に確認：
1. Runtime Logsでエラーを確認
2. 環境変数が設定されているか確認
3. `/api`エンドポイントが404または500エラーでないか確認
4. フロントエンドのブラウザコンソールでエラーを確認

---

## まとめ

### 重要なポイント

1. **ローカルとVercelの環境差異に注意**
   - 型チェックの厳密さ
   - ファイルシステムの構造
   - 環境変数の扱い

2. **GitHubとVercelの統合は必須**
   - Webhookが正しく設定されているか確認
   - うまくいかない場合は、プロジェクトを作り直す

3. **環境変数変更後は必ずRedeploy**
   - 自動的には反映されない

4. **モノレポ構成は要注意**
   - `includeFiles`で依存ファイルを含める
   - または、ファイル構成を見直す

5. **エラーログを必ず確認**
   - Build Logs（ビルド時）
   - Runtime Logs（実行時）
   - Browser Console（フロントエンド）

---

**最終更新**: 2025年11月10日  
**バージョン**: 1.0

