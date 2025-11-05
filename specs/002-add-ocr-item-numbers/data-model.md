# Data Model: OCR結果表示画面の項目番号表示

**Purpose**: 表示項目に対する不変の固定IDに基づき、画面全体で通し番号を提供し、画面・印刷・PDF・CSVで整合させる。

## Entities

- DisplayItem（表示項目）
  - id: string（不変識別子。ドメイン定義の内部キー/フィールドコード）
  - label: string（表示ラベル）
  - value: string | number | date | etc.（表示値）
  - sectionId: string（所属セクション/タブ識別子）
  - order: number（既存の表示順。固定ID採番では参照のみ）

- Section（セクション/タブ/ページ）
  - id: string
  - name: string
  - order: number（画面上の表示順）

- NumberAssignment（採番マップ）
  - itemId: string（= DisplayItem.id）
  - number: integer（1..N、画面全体で一意）

- ExportRow（エクスポート出力行・概念）
  - itemNo: integer（= NumberAssignment.number）
  - label: string
  - value: string
  - sectionName: string（任意）

## Relationships

- DisplayItem (1) — (0..1) NumberAssignment（項目IDで結合）
- Section (1) — (N) DisplayItem

## Validation Rules

- V1: NumberAssignment.number は1以上の整数で、画面全体で一意。
- V2: すべての可視DisplayItemに対応するNumberAssignmentが存在する。
- V3: 表示操作（フィルタ/並び替え/遅延読み込み）後も V1/V2 を満たす。
- V4: CSV/PDF/印刷では、表示中のDisplayItemに対して ExportRow.itemNo が出力され、画面の番号と一致。
- V5: 番号表記は半角アラビア数字。

## State Considerations

- 初期表示: 取得済みDisplayItem集合から固定ID順（ドメイン定義の安定順）または事前定義の採番順で NumberAssignment を生成。
- 更新イベント: DisplayItem の追加/削除/非表示化があっても NumberAssignment は固定IDベースで不変（映らない項目の番号は保持されるが表示されない）。
- 出力: ExportRow 生成時に NumberAssignment を参照。

