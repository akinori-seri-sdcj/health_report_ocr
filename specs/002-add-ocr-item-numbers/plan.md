# Implementation Plan: OCR結果表示画面：項目番号表示実装計画

**Branch**: `002-add-ocr-item-numbers` | **Date**: 2025-11-04 | **Spec**: C:\Users\aseri\Desktop\health_report_ocr\specs\002-add-ocr-item-numbers\spec.md
**Input**: Feature specification from `C:\Users\aseri\Desktop\health_report_ocr\specs\002-add-ocr-item-numbers\spec.md`

## Summary

- Primary: OCR結果表示画面の各「可視の表示項目」の左横に、1から始まる重複のない番号を表示する。
- Decisions from spec: 固定ID（項目定義ごとに不変）で採番、画面全体で通し番号、番号は画面・印刷・PDF・CSVに含める、読み上げは「番号→ラベル→値」。
- Approach (high level): 表示項目の固定IDに基づく番号マッピングを生成しUIに描画、フィルタ/並び替え/遅延読み込みにも安定して適用。エクスポート出力には番号を含めて画面と整合。

## Technical Context

**Language/Version**: NEEDS CLARIFICATION（既存プロジェクトのUIスタックに従う）  
**Primary Dependencies**: NEEDS CLARIFICATION（既存UI/ビルド/テスト基盤を流用）  
**Storage**: N/A（採番は画面内での表現。恒久保存は不要）  
**Testing**: NEEDS CLARIFICATION（UI/E2Eテスト基盤に合わせる。受け入れシナリオに準拠）  
**Target Platform**: NEEDS CLARIFICATION（想定はWeb UI。既存ターゲットに準拠）  
**Project Type**: NEEDS CLARIFICATION（単一/モノレポ構成など既存に準拠）  
**Performance Goals**: 表示更新後1秒以内に番号表示が安定（SC-002）  
**Constraints**: 既存の操作性を阻害しない（FR-010）、数字は半角で統一（FR-009）  
**Scale/Scope**: NEEDS CLARIFICATION（1画面あたりの項目数・セクション数）

Unresolved items to research in Phase 0:
- UIスタックとテスト基盤（Language/Dependencies/Testing/Target/Project Type）
- 固定IDのソース（項目定義の識別子の取得元）
- スクリーンリーダーの読み上げ最適化（ARIA属性/順序付け）
- CSVの列仕様（列名・列順）、PDFの表記仕様（番号の配置）
- 遅延読み込み・フィルタ/並び替えイベントへのフック箇所

## Constitution Check

Gate (pre-Phase 0):
- Test-firstと受け入れ基準の明確化: PASS（ACおよびSCに準拠したE2E想定）
- ドキュメント駆動の計画・契約: PASS（research/data-model/contracts/quickstart作成）
- 複雑性最小化: PASS（新規依存を導入しない方針、UI上の薄い機能追加）

備考: `.specify/memory/constitution.md`はプレースホルダ構成のため、一般原則に基づくゲートを適用。

## Project Structure

### Documentation (this feature)

```text
specs/002-add-ocr-item-numbers/
├── plan.md          # このファイル（実装計画）
├── research.md      # Phase 0 出力（未確定事項の解消）
├── data-model.md    # Phase 1 出力（エンティティ/関係/検証）
├── quickstart.md    # Phase 1 出力（実装手順）
└── contracts/       # Phase 1 出力（API/イベント契約）
    └── openapi.yaml
```

### Source Code (repository root)

```text
# Option: Single project（既存構成に追従）
src/
  ├── ui/
  │   └── ocr_results/              # OCR結果表示画面（推奨配置）
  ├── exports/                      # エクスポート周辺（CSV/PDFのフックがあれば）
  └── ...                           # 既存構成に準拠

tests/
  ├── e2e/
  ├── integration/
  └── unit/
```

**Structure Decision**: 既存の単一プロジェクト構成に倣い、UI配下のOCR結果画面周辺に最小限の変更を集中させる。

## Complexity Tracking

（該当なし）

## Phase 0: Outline & Research

Research tasks derived from Technical Context:
- UIスタック/テスト基盤/ターゲット/構成の確認と準拠方針策定
- 固定IDの取得元（項目定義）の同定と参照方法
- スクリーンリーダー配慮（読み上げ順序、必要な属性/補助テキスト）
- CSV列仕様（列名は`ItemNo`を提案）、PDFの番号表記位置（ラベル左）
- 遅延読み込み/フィルタ/並び替えイベントのフックポイント

Output: `research.md`（全NEEDS CLARIFICATIONを解消）

## Phase 1: Design & Contracts

Artifacts to generate:
- `data-model.md`: DisplayItem/Section/NumberAssignmentと検証規則
- `contracts/openapi.yaml`: OCR結果取得/エクスポート契約の雛形
- `quickstart.md`: 手順（採番・UI反映・アクセシビリティ・出力反映・テスト）

Agent context update:
- `.specify/scripts/powershell/update-agent-context.ps1 -AgentType codex` を実行し、今回の技術要素（UI採番/アクセシビリティ/エクスポート反映）を追記

## Constitution Check (post-design)

- Test-first: PASS（AC/SCに沿ったE2E/統合テスト項目を定義）
- 契約提示: PASS（OpenAPI雛形により取得/出力の契約を明示）
- 複雑性: PASS（新規依存追加なし、既存UIイベントへフック）

