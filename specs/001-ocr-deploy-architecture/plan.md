# Implementation Plan: OCR処理デプロイアーキテクチャの改善

**Branch**: `[001-ocr-deploy-architecture]` | **Date**: 2025-11-20 | **Spec**: `specs/001-ocr-deploy-architecture/spec.md`
**Input**: Feature specification from `specs/001-ocr-deploy-architecture/spec.md`

**Note**: This plan is generated from `/speckit.plan` workflow instructions and will guide changes needed to deploy OCR処理 reliably.

## Summary

健康診断レポートのOCR処理が、本番デプロイ後も安定してエラーなく動作するように、アプリケーションのアーキテクチャを整理・改善する。  
具体的には、フロントエンドから見える「OCR API」の責務を明確にし、TypeScriptのみで完結しているように見える現状から脱却して、専用のバックエンド処理（サーバーサイド）の存在とデプロイ手順を明示した構成にする。

## Technical Context

**Language/Version**: TypeScript 5.x（フロントエンド／バックエンド）、[NEEDS CLARIFICATION: OCRエンジン側の実装言語は既存方針を踏襲するか]  
**Primary Dependencies**: React 18.x（フロントエンド）、Node.jsベースのAPIランタイム（既存バックエンド）、[NEEDS CLARIFICATION: Supabase Edge Functionsを利用するか]  
**Storage**: 既存の健康診断レポート保存先（既存仕様に従う）／OCR処理自体はステートレスに扱う  
**Testing**: npm test（既存テストランナーに準拠）、エンドツーエンドでのOCR確認用シナリオを追加  
**Target Platform**: Webアプリケーション（ブラウザ）＋クラウド上のAPIランタイム（Linux系サーバまたはSupabase Edge Runtime相当）  
**Project Type**: web（`frontend/` と `backend/` を持つモノレポ構成）  
**Performance Goals**: 単一レポートのOCR処理が通常時30秒以内に完了し、業務時間帯におけるOCRエラー率を5%未満に抑える  
**Constraints**: 健康情報を扱うため、ログやエラーメッセージに個人情報を含めないこと。インターネット越しの外部OCRサービスを利用する場合も、必要最小限の項目のみ送信する。  
**Scale/Scope**: 1日あたり数十〜数百件の健康診断レポートを対象とした部門内利用を想定

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Specification-First, Testable Outcomes: ユーザーストーリーと測定可能なSuccess Criteriaが `spec.md` に定義済み → **PASS**
- Simplicity and User Value: 本変更は「OCRを本番で安定稼働させる」という明確な価値にフォーカスし、追加機能（UI高度化や高度なチューニング）は別ストーリーに分離 → **PASS**
- Data Privacy and Auditability: 健康診断データは既存方針に従い取り扱い、OCRログやエラーメッセージには個人情報を含めない前提で設計 → **PASS（要詳細設計で再確認）**
- Incremental Delivery with Independent Slices: まずは「OCR処理が安定して動く」MVPをゴールとし、既存のUIやエクスポート機能は変更最小限とする → **PASS**
- Change Control and Versioning: 専用ブランチ `001-ocr-deploy-architecture` 上でspec・planを管理し、仕様に紐づく変更として扱う → **PASS**

Constitution Gate Result: **PROCEED TO PHASE 0**

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
