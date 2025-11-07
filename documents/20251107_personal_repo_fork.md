個人アカウントにフォークする方法を、最初から順番に説明します。

## 🔀 個人アカウントへのフォーク＆Vercelデプロイ手順

### ステップ1: GitHubでリポジトリをフォーク

#### 1-1. Organizationのリポジトリページを開く

ブラウザで以下にアクセス：

```
https://github.com/Systems-Design-Co-Ltd/health_report_ocr
```

#### 1-2. フォークボタンをクリック

右上の **「Fork」** ボタンをクリック

```
┌─────────────────────────────────────────┐
│  Systems-Design-Co-Ltd / health_report_ocr │
│  [⭐ Star] [👁 Watch] [🔀 Fork]  ← ここ   │
└─────────────────────────────────────────┘
```

#### 1-3. フォーク先を選択

```
┌─────────────────────────────────────────┐
│  Create a new fork                      │
├─────────────────────────────────────────┤
│  Owner *                                │
│  [your-username ▼]  ← 個人アカウント選択 │
│                                         │
│  Repository name *                      │
│  [health_report_ocr]  ← そのままでOK     │
│                                         │
│  Description (optional)                 │
│  [健康診断結果OCRアプリケーション]          │
│                                         │
│  ☑ Copy the main branch only           │
│                                         │
│  [Create fork]  ← クリック               │
└─────────────────────────────────────────┘
```

**設定**：
- Owner: **あなたの個人アカウント**
- Repository name: **health_report_ocr**（変更不要）
- ✅ Copy the main branch only: **チェックを入れる**

**「Create fork」** をクリック

#### 1-4. フォーク完了を確認

数秒後、以下のURLに自動的にリダイレクトされます：

```
https://github.com/your-username/health_report_ocr
```

---

### ステップ2: ローカルのGit設定を更新

#### 2-1. 現在のリモート設定を確認

```powershell
# リモートURL確認
git remote -v
```

**出力例**：
```
origin  https://github.com/Systems-Design-Co-Ltd/health_report_ocr.git (fetch)
origin  https://github.com/Systems-Design-Co-Ltd/health_report_ocr.git (push)
```

#### 2-2. リモートURLを個人アカウントに変更

```powershell
# あなたのGitHubユーザー名に置き換えてください
git remote set-url origin https://github.com/your-username/health_report_ocr.git

# 変更確認
git remote -v
```

**出力例**（変更後）：
```
origin  https://github.com/your-username/health_report_ocr.git (fetch)
origin  https://github.com/your-username/health_report_ocr.git (push)
```

#### 2-3. GitHubにプッシュ

```powershell
# すでにコミット済みの変更をプッシュ
git push origin main
```

**初回プッシュ時の認証**：
- GitHubのログイン画面が表示される場合があります
- ユーザー名とパスワード（またはPersonal Access Token）を入力

---

### ステップ3: Vercelでプロジェクト作成

#### 3-1. Vercelにログイン

```
https://vercel.com
```

「Continue with GitHub」でログイン

#### 3-2. 新規プロジェクト作成

1. **「Add New...」** → **「Project」** をクリック
2. 「Import Git Repository」画面が表示されます

#### 3-3. 個人リポジトリを選択

```
┌─────────────────────────────────────────┐
│  Import Git Repository                  │
├─────────────────────────────────────────┤
│  your-username (Personal Account)       │
│  ├─ health_report_ocr      [Import]    │ ← これをクリック
│  └─ other-repos...                      │
└─────────────────────────────────────────┘
```

**「Import」** をクリック

#### 3-4. プロジェクト設定

```
┌─────────────────────────────────────────┐
│  Configure Project                      │
├─────────────────────────────────────────┤
│  Project Name:                          │
│  [health-report-ocr]                    │
│                                         │
│  Framework Preset:                      │
│  [Other ▼]                              │
│                                         │
│  Root Directory:                        │
│  [./  ▼]  ← そのまま                    │
└─────────────────────────────────────────┘
```

**設定内容**：
- Project Name: `health-report-ocr`
- Framework Preset: **Other**
- Root Directory: **./（変更しない）**

#### 3-5. 環境変数を追加

**「Environment Variables」** セクションを展開して **「Add」** をクリック：

```
Name:  OPENAI_API_KEY
Value: sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

すべての環境（Production / Preview / Development）にチェックを入れる

#### 3-6. デプロイ実行

**「Deploy」** ボタンをクリック → 約3-5分待つ

---

### ステップ4: デプロイ完了後の確認

#### 4-1. デプロイURLを確認

デプロイが完了すると、以下のようなURLが発行されます：

```
https://health-report-ocr-your-username.vercel.app
```

または

```
https://health-report-ocr.vercel.app
```

#### 4-2. 動作確認

```bash
# ヘルスチェック
curl https://your-deployed-url.vercel.app/api/health
```

**期待するレスポンス**：
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "environment": "production",
  "services": {
    "llm": "healthy"
  }
}
```

#### 4-3. CORS設定の追加（初回のみ）

1. Vercelプロジェクト設定 → **「Settings」** → **「Environment Variables」**
2. **「Add」** をクリック：

```
Name:  CORS_ORIGIN
Value: https://your-deployed-url.vercel.app
Environment: Production のみチェック
```

3. **「Save」** をクリック
4. **「Deployments」** タブ → 最新デプロイの右側 **「⋯」** → **「Redeploy」**

---

### ステップ5: ブラウザでアプリを開く

```
https://your-deployed-url.vercel.app
```

にアクセスして、カメラページが表示されればOKです！

---

## 📋 今後の運用

### ローカル開発（変更なし）

```powershell
# Docker Composeで開発
docker-compose up -d
# → http://localhost:5173
```

### 変更をデプロイ

```powershell
# コード修正後
git add .
git commit -m "機能追加"
git push origin main
# → 自動的にVercelが再デプロイ
```

### Organization版との同期（必要な場合）

元のOrganizationリポジトリから最新の変更を取り込む場合：

```powershell
# 元のリポジトリをupstreamとして追加（初回のみ）
git remote add upstream https://github.com/Systems-Design-Co-Ltd/health_report_ocr.git

# 最新の変更を取得
git fetch upstream
git merge upstream/main

# 個人リポジトリにプッシュ
git push origin main
```

---

## ✅ 完了チェックリスト

- [ ] GitHubで個人アカウントにフォーク完了
- [ ] ローカルのリモートURLを個人アカウントに変更
- [ ] `git push origin main` 成功
- [ ] Vercelでプロジェクト作成・Import完了
- [ ] 環境変数 `OPENAI_API_KEY` 設定完了
- [ ] デプロイ成功・URLが発行される
- [ ] `/api/health` でヘルスチェックOK
- [ ] `CORS_ORIGIN` 設定＆再デプロイ完了
- [ ] ブラウザでアプリが動作することを確認

---

これで個人アカウントでのデプロイが完了します！何か不明点があればお知らせください。