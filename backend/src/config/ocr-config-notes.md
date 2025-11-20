# OCR 関連環境変数メモ（設計用）

このディレクトリでは、OCR 処理に関係する環境変数・設定キーを整理する。

現時点で想定している主な設定:

- `OCR_SERVICE_ENDPOINT`  
  - 利用する OCR エンジンの HTTP エンドポイント URL
- `OCR_SERVICE_API_KEY`  
  - OCR サービス呼び出しに必要な API キー（あれば）
- `OCR_REQUEST_TIMEOUT_MS`  
  - 単一リクエストあたりのタイムアウト時間（ミリ秒）

Phase 2 以降で `backend/src/config/ocrConfig.ts` を追加し、これらの環境変数を型付きで読み込む。

