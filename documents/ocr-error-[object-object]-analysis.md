# 健康診断OCRフロントエンドで発生した `[object Object]` エラーについて

## 概要

- 対象画面: 「画像をアップロード」→ OCR 実行 → 「確認・編集」画面
- 発生事象: OCR 実行時に、画面上に `G[` に続いて `[object Object]` と表示され、処理失敗
- 発生タイミング:
  - 以前（同じ base ブランチ）では問題なく動作していた
  - 別ブランチでの作業後、**base ブランチにコード変更はない状態**で再度起動したところ、今回初めてエラーが表面化した
- 根本原因:
  - **フロントエンドのエラー処理が「`error` は文字列」と決め打ちしていた**
  - 一方で **バックエンドは `error` にオブジェクト（`{ message, code }`）を返すケースがある**
  - これまで正常系しか踏んでおらず「潜在バグ」として埋もれていたが、**環境の変更（`.env` の `VITE_API_URL` や Docker/Nginx 側）によりエラー経路に入るようになり、初めて表面化した**

---

## 症状の詳細

### 画面上の症状

- 「画像をアップロード」画面で画像を選択 → 「OCR解析を開始」ボタン押下
- その後、「確認・編集」画面のエラー表示部分に以下のように表示された:

```text
G[
[object Object]
```

- `G[` は本来の「エラー」見出しが文字化けしたもので、  
  `[object Object]` は JavaScript のオブジェクトを文字列化したときの標準的な表現

### ブラウザコンソールのログ

- `healthReportApi.ts` / `ConfirmEditPage.tsx` から次のようなログが確認された:

  - OCR 実行開始:

    ```text
    [API] OCR処理開始: 1 枚の画像
    ```

  - API 呼び出しエラー（例）:

    ```text
    POST http://localhost:5173/api/process-health-report 403 (Forbidden)
    [API] OCR処理エラー: Error: [object Object]
    [ConfirmEditPage] OCR処理エラー: Error: [object Object]
    ```

  - `ConfirmEditPage` のレンダリングログ:

    ```text
    [ConfirmEditPage] レンダリング: { ocrResult: 'なし', 検査結果件数: 0, isProcessing: false, error: '[object Object]' }
    ```

  これにより、**Zustand の `error` 状態にも `'[object Object]'` が入っていた**ことが確認できた。

### バックエンド側の状況

- Docker で以下のコンテナが起動していた:

  ```text
  health_ocr_backend   (ポート 8080)
  health_ocr_frontend  (ポート 5173)
  health_ocr_nginx     (ポート 80 / 443)
  ```

- `npm run dev` でローカルからバックエンドを起動しようとしたところ:

  ```text
  Error: listen EADDRINUSE: address already in use :::8080
  ...
  port: 8080
  ```

  → すでに Docker の `health_ocr_backend` が 8080 を使用していたことが判明  
    （ローカルの `npm run dev` でのバックエンド起動は不要だった）

---

## 技術的背景

### フロントエンド側のコード（問題のあった部分）

- `frontend/src/api/healthReportApi.ts` のエラー処理は、当初以下のようになっていた:

```ts
if (!response.ok) {
  let errorMessage = `HTTP error! status: ${response.status}`
  try {
    const errorData: OCRErrorResponse = await response.json()
    errorMessage = errorData.error || errorMessage
    if (errorData.details) {
      errorMessage += `: ${errorData.details}`
    }
  } catch (e) {
    // JSON parse error - use default message
  }
  throw new Error(errorMessage)
}
```

- 型定義:

```ts
export interface OCRErrorResponse {
  error: string
  details?: string
}
```

- `ConfirmEditPage.tsx` 側では、`processHealthReport` の例外を次のように処理していた:

```ts
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'OCR処理に失敗しました'
  setError(errorMessage)
}
```

### バックエンド側のレスポンス形式

- `backend/src/controllers/health-report.controller.ts` などから、エラー応答として以下のような JSON を返すケースがある:

```ts
return res.status(400).json({
  success: false,
  error: {
    message: '画像ファイルが送信されていません',
    code: 'NO_FILES_UPLOADED',
  },
})
```

- この場合、`error` フィールドは **オブジェクト** であり、フロント側の「文字列前提」の扱いと噛み合わない。

---

## 原因分析

### コード上の不整合

1. フロントエンドは **「`error` は常に文字列」という前提** でパースしていた。
2. 一方バックエンドは、少なくとも一部のケースで **「`error` にオブジェクト（`{ message, code }`）を返す」** 実装になっていた。
3. その結果、
   - `errorData.error` にはオブジェクトが入り、
   - `errorMessage = errorData.error || errorMessage` によって `errorMessage` 自体がオブジェクトになる。
   - `throw new Error(errorMessage as any)` とした時点で、内部で文字列化されて `'[object Object]'` となる。

4. さらに `ConfirmEditPage.tsx` では

   ```ts
   const errorMessage = err instanceof Error ? err.message : 'OCR処理に失敗しました'
   ```

   としているため、`err.message` が `'[object Object]'` になり、そのまま画面に表示されていた。

→ これは **base ブランチに元々存在していた設計の齟齬（潜在バグ）**。

### なぜ「今日」表面化したのか

ポイントは **「エラー経路に初めて入った」** ことにある。

- 以前は、同じ base ブランチでも問題なく動いていた。
- これは「たまたま全ての OCR リクエストが HTTP 200 (success) で返っていた」ことを意味する。
- エラー処理のコードは一度も実行されておらず、`error` オブジェクトと文字列の齟齬は表面化していなかった。

今回、それが表面化した要因として、次の環境要因が重なっている。

1. `.env` の `VITE_API_URL` 設定

   - 途中のタイミングで、フロントからの API 呼び出し先が **Nginx 経由の `/api`** に切り替わっていた:

     ```env
     #VITE_API_URL=https://localhost/api
     VITE_API_URL=http://localhost:8080
     ```

   - 一時的に `https://localhost/api` を使っていた時期もあり、この間に
     - Nginx 経由のルーティング/認証
     - CORS や証明書
     などの影響で、`403` / `400` / その他のエラー応答が返る状況が増えた可能性が高い。

   - つまり、「以前は成功レスポンスしか返っていなかったが、`VITE_API_URL` の変更や Nginx 側の状態によって**初めてエラー応答が返るケースが増えた**」と考えられる。

2. Docker コンテナの状態・バージョン

   - `health_ocr_backend` / `health_ocr_nginx` / `health_ocr_frontend` コンテナは、
     別ブランチや別コミットからビルドされたイメージである可能性がある。
   - それにより、
     - バックエンドのエラーレスポンス形式だけが微妙に変わった
     - base ブランチのフロントコードとバックエンドの実装バージョンが完全には一致していない
   - といった状況になっていた可能性がある。

**結論として:**

- **バグ自体（`error` を文字列前提で扱う設計）は、元々 base に存在していた。**
- ただし、エラー経路に入らなかったため「潜在バグ」として眠っていた。
- `.env` と Docker/Nginx を含む環境の変化により、初めてエラー経路に入るようになり、`[object Object]` が表面化した。

---

## 対応内容（フロントエンド側の修正）

### 1. `healthReportApi.ts` のエラー処理を全面的に見直し

ファイル: `frontend/src/api/healthReportApi.ts`

- `OCRErrorResponse` を「柔軟な型」として再定義:

```ts
export interface OCRErrorResponse {
  error?: unknown
  details?: unknown
}
```

- `processHealthReport` のエラー処理を以下の方針で再設計:

  1. **HTTPエラー時 (`!response.ok`) の処理**
     - `errorData.error` が
       - 文字列 → そのまま `errorMessage` として採用
       - オブジェクトで `message` を持つ → `message` を採用
       - それ以外のオブジェクト → `JSON.stringify` で文字列化して採用
     - `details` も、文字列なら追記／オブジェクトなら JSON 文字列として追記
     - **最終的に `throw errorMessage`（文字列）する**  
       （`new Error(...)` ではなく、生の文字列を投げる）

  2. **外側の `catch` の処理**
     - すでに文字列ならそのまま再スロー
     - `Error` オブジェクトなら `error.message` を投げ直す
     - それ以外のオブジェクトなら、`message` プロパティか `JSON.stringify` の結果を投げる
     - 最後の手段として `"OCR処理中にエラーが発生しました"` を投げる

  → これにより、**API 呼び出し側（`ConfirmEditPage.tsx`）が受け取るエラーは、最終的に常に「文字列」** になるようにした。

### 2. `ConfirmEditPage.tsx` のエラー表示ロジック（オプション）

ファイル: `frontend/src/pages/ConfirmEditPage.tsx`

- `handleStartOCR` 内の `catch` について、エラーが文字列でも安全に扱えるようにする方針:

```ts
} catch (err) {
  const errorMessage =
    typeof err === 'string'
      ? err
      : err instanceof Error
      ? err.message
      : 'OCR処理に失敗しました'
  setError(errorMessage)
  console.error('[ConfirmEditPage] OCR処理エラー:', err)
}
```

- 現時点でも `healthReportApi.ts` 側で「必ず文字列を投げる」ようにしたため、`err` は文字列になり、`[object Object]` にはならない。

---

## 再発防止と教訓

1. **API エラー構造の仕様化と型定義の整合**

   - バックエンド側のエラー構造（`{ error: string | { message, code }, details? }`など）は、フロントと共有するスキーマ（TypeScript 型 or JSON Schema）として明示する。
   - フロントでは「文字列」「オブジェクト」両方に耐えられるパーサーを用意し、**UI に渡す直前のレイヤーで必ず「プレーンな文字列」に正規化**する。

2. **正常系だけでなくエラー系の動作確認**

   - 開発・テスト時に、意図的にバックエンドからエラーを返すモックやテストケースを用意し、
     - HTTP 400 / 403 / 500
     - `error` が文字列の場合
     - `error` がオブジェクトの場合
   - などを通して「エラー表示の UI」が期待どおりになるか確認する。

3. **環境変更時の影響範囲の把握**

   - `.env` の `VITE_API_URL` など、**通信経路を変える設定**を変更したときは、
     - ルーティング（Nginx 経由か、直接バックエンドか）
     - 認証／CORS／TLS
     - エラーレスポンスの形式
   - の挙動が変わりうることを前提に、「成功時」と「代表的なエラー時」の両方で簡易確認を行う。

4. **Docker + ローカル dev の二重起動に注意**

   - `docker compose up` でバックエンドが 8080 で起動している状態で、さらにローカルから `npm run dev` すると `EADDRINUSE` が発生する。
   - どちらのバックエンドを使うか（Docker or ローカル）を明確に決め、**片方だけを起動する運用**にする。

---

## 結論

- 今回の `G[\n[object Object]` エラーは、
  - **元々 base ブランチにあった「エラー構造の扱いミスマッチ」という潜在バグ** と、
  - **`.env` や Docker/Nginx を含む環境の変更によって、初めてエラー経路に入ったこと**
- この2つが組み合わさって表面化した事象だった。

- 対応として、
  - `healthReportApi.ts` のエラー処理を全面的に見直し、「必ず文字列を投げる」ように修正した。
  - これにより、今後同様の環境変化があっても、`[object Object]` のような読めないメッセージではなく、**人間が読めるエラーテキスト**が表示されるようになった。

このドキュメントは、今後同種の「潜在バグが環境変更で顕在化した」ケースを振り返るための記録とする。

