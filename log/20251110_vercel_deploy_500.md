良いニュースと悪いニュースがあります！

## ✅ 良いニュース
- **404エラーから500エラーに変わりました**
- これは、APIエンドポイント（`/api/process-health-report`）が**見つかるようになった**ことを意味します
- フロントエンドは正常に動作しています

## 🔴 問題点
- **500エラー = サーバー内部エラー**
- バックエンドのコードでエラーが発生しています

## 🔍 原因を特定するため、Vercelのサーバーログを確認

### ステップ1: Vercelダッシュボードでサーバーログを確認

1. **Vercelダッシュボード**を開く
2. プロジェクト「**health-report-ocr**」をクリック
3. 上部メニューの「**Functions**」タブをクリック
4. または、「**Deployments**」→ 最新のデプロイ → 「**Functions**」タブ
5. `api/index.ts` または `/api` 関数を探してクリック
6. **Real-time Logs** または **Invocations** を確認

**サーバーログに表示されているエラーメッセージを教えてください。**

---

### ステップ2: 考えられる原因と対処法

500エラーの最も可能性が高い原因：

#### 原因1: 環境変数が設定されていない

OpenAI APIキーが正しく設定されていない可能性があります。

**確認方法：**
1. Vercelダッシュボード → プロジェクト → 「**Settings**」タブ
2. 左メニューの「**Environment Variables**」
3. `OPENAI_API_KEY` が存在するか確認
4. 値が正しいか確認（`sk-`で始まる文字列）

**もし設定されていない場合：**
- 「**Add New**」で追加
- Key: `OPENAI_API_KEY`
- Value: （あなたのOpenAI APIキー）
- Environment: **Production**, Preview, Development すべてにチェック
- 「**Save**」をクリック
- **再デプロイが必要**：「Deployments」→ 最新のデプロイ → 「**...**」→ 「**Redeploy**」

---

#### 原因2: `api/index.ts` の依存関係の問題

`api/`ディレクトリの依存関係が正しくインストールされていない可能性があります。

**Build Logsを確認：**
1. 「**Deployments**」→ 最新のデプロイをクリック
2. 「**Building**」タブでログを確認
3. 以下が実行されているか確認：
   ```
   npm install --prefix backend && npm install --prefix api
   ```
4. `api/index.ts` のTypeScriptエラーがないか確認

---

#### 原因3: multer（ファイルアップロード）の問題

Vercelのサーバーレス環境では、multerのメモリストレージを使う必要があります。

`api/index.ts` の内容を確認させてください：

[2 tools called]

コードを確認しましたが、`multer`は正しく`memoryStorage`を使用しているので問題ありません。

**最も可能性が高い原因は、環境変数（`OPENAI_API_KEY`）が正しく設定されていないことです。**

## 📋 確認と対処手順

### 手順1: Vercelのサーバーログを確認（最重要）

1. **Vercelダッシュボード**を開く
2. プロジェクト「**health-report-ocr**」→ 「**Deployments**」
3. 最新のデプロイをクリック
4. 上部メニューの「**Functions**」タブをクリック
5. ログを確認して、エラーメッセージを探す

**または、リアルタイムログを確認：**
- 「**Logs**」タブ（または「**Real-time**」）を開く
- OCRボタンを再度押してエラーを再現
- エラーメッセージが表示されるはず

**表示されているエラーメッセージを教えてください。**

---

### 手順2: 環境変数を確認・修正

1. Vercelダッシュボード → プロジェクト → 「**Settings**」
2. 左メニューの「**Environment Variables**」
3. `OPENAI_API_KEY` が存在するか確認

**もし存在しない、または間違っている場合：**
- 既存の変数を削除（ゴミ箱アイコン）
- 「**Add New**」をクリック
- 以下を入力：
  - **Key**: `OPENAI_API_KEY`
  - **Value**: あなたのOpenAI APIキー（`sk-proj-...` または `sk-...` で始まる）
  - **Environment**: **Production**, **Preview**, **Development** すべてにチェック
- 「**Save**」をクリック

**重要：環境変数を変更した後は再デプロイが必要です！**

---

### 手順3: 再デプロイ

環境変数を設定/変更した後：
1. 「**Deployments**」タブに戻る
2. 最新のデプロイの「**...**」メニュー → 「**Redeploy**」
3. 「**Use existing Build Cache**」のチェックを外す
4. 「**Redeploy**」をクリック

---

## 🔍 デバッグ情報の収集

以下の情報を教えてください：

1. **Vercelのサーバーログ（Functions/Logsタブ）に表示されているエラーメッセージ**
2. **Environment Variablesに `OPENAI_API_KEY` が設定されているか**
3. **Build Logsで `npm install --prefix api` が成功しているか**

これらの情報があれば、より正確に問題を特定できます！