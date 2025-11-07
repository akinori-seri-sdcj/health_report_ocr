# インシデントレポート: OCR処理中バナーが表示されない問題

作成日: 2025-11-06

## 要約
- 事象: OCR実行中に「OCR処理中」のメッセージが表示されない。
- 原因: OCR開始直後に `setError(null)` を呼び、ストア側の実装で `isProcessing` が `false` に戻っていたため、処理中フラグが立たずバナーが出なかった。
- 対応: エラーのみをクリアする `clearError()` をストアに追加し、画面側は OCR 開始時に `clearError()` を呼ぶよう修正。さらに、見落とし防止のため点滅用CSSと中央固定バナーへ改善。

## 影響範囲
- 画面: `frontend/src/pages/ConfirmEditPage.tsx`
- 状態管理: `frontend/src/store/ocrResultStore.ts`
- スタイル: `frontend/src/index.css`

## 時系列
1. OCR開始ボタン押下後、`setProcessing(true)` と同時に `setError(null)` を呼んでいた。
2. ストアの `setError` 実装が `null` を受けても `isProcessing: false` に設定してしまい、直後に処理中フラグが落ちた。
3. そのため、`isProcessing` 依存のバナーは描画されなかった。
4. `clearError()` を実装し、開始時はエラーのみクリアして `isProcessing` を保持するよう修正後、バナーが表示されることを確認。

## 技術的原因（Root Cause）
- 関数の責務混在: `setError(null)` を「エラークリア」にも流用しており、内部で処理中状態まで変更していた。
- 画面側の使用意図とストア実装の乖離: 「開始時は error だけ消して処理中を維持したい」という意図と一致していなかった。

## 対応（Fix）
- ストア: `clearError()` を追加し、`error` のみをクリア。`setError` は `error !== null` のときのみ `isProcessing: false` を設定。
  - `frontend/src/store/ocrResultStore.ts:89` `setError(error)` の分岐調整
  - `frontend/src/store/ocrResultStore.ts:101` `clearError()` 追加
- 画面: OCR開始時に `setProcessing(true)` の直後で `clearError()` を呼ぶよう変更。
  - `frontend/src/pages/ConfirmEditPage.tsx:152` `setProcessing(true)`
  - `frontend/src/pages/ConfirmEditPage.tsx:153` `clearError()` 呼出
- UI/UX強化: 処理中メッセージを中央固定の点滅バナーに変更（見落とし防止）。
  - `frontend/src/index.css:53` `@keyframes blink`
  - `frontend/src/index.css:58` `.animate-blink`
  - `frontend/src/pages/ConfirmEditPage.tsx:275` 処理中バナーのDOM
  - `frontend/src/pages/ConfirmEditPage.tsx:283` バナーに `animate-blink` を付与

## 検証
- Consoleログで `isProcessing: true` を確認後、画面上部中央に「OCR処理中」が点滅表示されることを手動確認。
- OCR成功/エラー完了時に `setOCRResult` / `setError` により `isProcessing: false` へ遷移し、バナーが消えることを確認。

## 再発防止策
- 役割の分離: 「状態をクリアする」関数と「状態を終了させる」関数を分ける（今回の `clearError()` 追加のように）。
- コード規約: エラークリアは `clearError()` を使用し、`setError(null)` は使用しない方針を徹底。
- UI検証チェック: 「処理中フラグに連動したUIが表示されるか」を受け入れテスト項目に追加。

## 変更ファイル一覧（開始行）
- `frontend/src/pages/ConfirmEditPage.tsx:152`（OCR開始時のフロー修正、バナー表示）
- `frontend/src/store/ocrResultStore.ts:89`（`setError` 分岐修正）
- `frontend/src/store/ocrResultStore.ts:101`（`clearError` 追加）
- `frontend/src/index.css:53`（`@keyframes blink` 追加）
- `frontend/src/index.css:58`（`.animate-blink` 追加）

---
必要に応じて、このレポートを追記・修正してください。

