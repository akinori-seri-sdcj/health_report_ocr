# Quickstart: OCR結果画面の項目番号表示 実装手順

## 1) 採番ポリシーと範囲（確定）
- 固定ID（項目定義ごとに不変）で採番。
- 画面全体で通し番号（タブ/セクション/ページを跨いでも連続）。
- 画面・印刷・PDF・CSVの全てに番号を含める（画面と一致）。

## 2) データ取得と番号マッピング
- DisplayItem（id, label, value, sectionId, order）を取得。
- 固定IDの安定順（ドメイン定義）で1..NのNumberAssignmentを作成。
- UI層に {itemId -> number} マップを渡す（キャッシュ可）。

## 3) UI描画
- 各項目のラベル左に半角数字で番号を表示。
- スタイルは視認性を確保しつつ控えめ（余白/サイズ）。
- 読み上げ順は「番号→ラベル→値」。必要に応じARIA属性/隠しテキストで順序を補強。

## 4) イベントフック
- フィルタ/並び替え/遅延読み込み後の更新イベントで「番号再適用」を呼ぶ。
- 番号は固定IDベースのため基本的に変化しないが、非表示化で表示上の抜けは許容。

## 5) エクスポート整合
- CSV: `ItemNo` 列をラベル直前に追加、半角数値。
- PDF/印刷: ラベル左に番号を表示、画面と同一の並び・見た目を維持。

## 6) テスト
- 受け入れ（AC-001..009）に対応するE2Eを作成。
- 単体: 採番マップ生成/適用、CSV整合、PDF整合の検証。
- レイアウト: 最小幅320pxで重なり/折返しの確認。

## 7) ロールアウト
- フィーチャーフラグ不要（FR-011: 既定で有効）。
- 既存操作領域の回帰確認（クリック/フォーカス等）。

## 8) 実行と検証（手順）

1. 画面のコンテナ要素を取得し、表示項目コレクション（id/label/value/sectionId）を準備
2. `initOcrResultNumbering({ items, container })` を呼び出して初期採番と描画を実施
3. 並び替え/フィルタ/非同期更新時は、該当箇所で `container.dispatchEvent(new CustomEvent('ocr:sorted'))` 等を発火
4. アクセシビリティ確認：フォーカス移動時に「番号→ラベル→値」が読み上げられること（スクリーンリーダー）
5. CSV出力：`exportOcrResultsCsv(items, api.numberMap)` で `ItemNo,Label,Value` 列を確認
6. PDF/印刷：`preparePdfModel(items, api.numberMap)` で `itemNo` が画面の番号と一致することを確認

コード例（概念）:

```js
import { initOcrResultNumbering } from 'src/ui/ocr_results/ocr_results_view.js';
import { exportOcrResultsCsv } from 'src/exports/csv/export_ocr_results.js';
import { preparePdfModel } from 'src/exports/pdf/export_ocr_results.js';

const container = document.querySelector('#ocr-results');
const items = getOcrItemsSomehow(); // [{id,label,value,sectionId}, ...]
const api = initOcrResultNumbering({ items, container });
api.attachEventHooks();

// Trigger after sort/filter/data load
container.dispatchEvent(new CustomEvent('ocr:sorted'));

// Export
const csv = exportOcrResultsCsv(items, api.numberMap);
const pdfModel = preparePdfModel(items, api.numberMap);
```
