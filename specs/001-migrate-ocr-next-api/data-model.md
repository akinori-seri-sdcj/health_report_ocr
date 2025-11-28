# Data Model: 健康診断OCR API Routes移行

## Entities

### OCRリクエスト
- **画像配列**: File (buffer) list; constraints: 最大10枚、各10MB以内、MIME in {jpeg, jpg, png, webp, heic, heif}
- **メタ情報**: ファイル名、サイズ、MIME、送信時刻（サーバーで付与可）
- **認証/環境**: APIキーはサーバー環境変数で管理（クライアント送信不要）
- **Validation rules**: 画像必須（1件以上）、枚数・サイズ・MIMEチェック、multipart/form-dataのみ

### OCR結果
- **受診者情報**: 氏名 (string|null), 受診日 (string|null; YYYY-MM-DD 推奨)
- **検査結果リスト**: 配列 of { 項目名: string, 値: string|null, 単位: string|null, 判定: string|null }
- **総合所見**: 総合判定 (string|null), 医師の所見 (string|null)
- **メタ**: 信頼度や未抽出項目の状態フラグ（抽出不能時に null/フラグで表現）

## Relationships
- 1 OCRリクエスト : N 画像
- 1 OCRリクエスト → 1 OCR結果 (同期処理前提)

## Validation & Constraints
- 入力: multipart/form-data 必須; 画像枚数・サイズ上限で即時拒否; 非対応MIMEを拒否
- 処理: サーバーレス実行時間を超える前にタイムアウト/フォールバックを返す（10s 目標）
- 出力: JSON構造は既存フロント互換（キーは日本語、主要フィールド欠損時は null 明示）
