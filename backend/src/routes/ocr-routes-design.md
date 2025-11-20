# OCR API ルーティング設計メモ

目的: フロントエンドから「サーバ側で責任を持つ OCR API」を一貫した形で提供する。

検討中のエンドポイント案:

- `POST /api/ocr`
  - 単一の健康診断レポート画像/PDFを受け付けて OCR を開始する
- `GET /api/ocr/{requestId}`
  - OCR 依頼の状態と結果（完了時）を返す

実装方針:

- 新規ルートファイル `backend/src/routes/ocr.routes.ts` を追加し、既存の `index.ts` からマウントする。
- 既存の `health-report.routes.ts` との関係は、健康診断レポート全体の処理フローから OCR 呼び出しを委譲する形で整理する。

