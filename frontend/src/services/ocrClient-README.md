# OCR API クライアント配置メモ

目的: フロントエンドから OCR API を呼び出す処理の配置場所を明確にする。

- OCR 関連の API 呼び出し処理は `frontend/src/services/ocrClient/` 配下に配置する。
- 主な責務:
  - `POST /api/ocr` にファイルを送信する関数
  - `GET /api/ocr/{requestId}` で状態・結果を取得する関数（必要に応じて）

Phase 3 以降で、実際のクライアント実装を `frontend/src/services/ocrClient/index.ts` に追加する。

