# Implementation Plan: API Routes配信とViteフロント統合デプロイ

**Branch**: `001-vite-ocr-deploy` | **Date**: 2025-12-03 | **Spec**: specs/001-vite-ocr-deploy/spec.md
**Input**: Feature specification from `/specs/001-vite-ocr-deploy/spec.md`

## Summary

API Routes化されたOCRを既存Viteフロントから同一ドメインで呼び出せるよう、ビルド・デプロイ構成を統合する。フロントは `/ui/` 配信、APIは `/api/ocr` を継続し、単一ビルドで同梱する。ヘルスチェックで稼働と設定を確認できる状態を維持する。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, Node 18 (Next.js 14, Viteフロント)  
**Primary Dependencies**: Next.js API Routes, React 18, Vite, OpenAI SDK (OCR呼び出し), zod (APIバリデーション)  
**Storage**: なし（サーバレス、ステートレス）  
**Testing**: npm run lint / npm test（既存コマンドを利用）  
**Target Platform**: Vercel（サーバレス関数＋静的配信）、ローカル開発（npm dev）  
**Project Type**: Web（フロント＋API同一リポジトリ）  
**Performance Goals**: OCR呼び出しはAPIタイムアウト設定内で完了し、フロント操作は体感即時（画面遷移/リロードで待ち時間を感じない）。  
**Constraints**: 画像アップロード上限（枚数/サイズ）を超える場合は明示的エラーを返す。サブパス配信(`/ui/`)でのリロードを許容。  
**Scale/Scope**: 単一プロダクト、フロント1系統＋API Routes 1系統、ユーザー規模は軽負荷想定（並列少数）だがエラー表示と健全性確認を重視。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Specification-First, Testable Outcomes: 準拠（spec完成済み、受け入れシナリオあり）
- Simplicity and User Value: 準拠（単一ビルド/デプロイでUI+APIを同梱する最小構成）
- Data Privacy and Auditability: 準拠（OCR鍵はサーバ側、フロントに露出しない前提を維持）
- Incremental Delivery with Independent Slices: 準拠（P1〜P3の独立ストーリーで検証可能）
- Change Control and Versioning: 準拠（spec/planをブランチにバージョン管理）

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

```text
app/                 # Next.js (pages/app dir), API Routes under app/api/
frontend/            # Vite + React フロント（ビルドを public/ui に同梱）
public/              # 静的アセット（Vite成果物を/ui/配下に配置）
specs/001-vite-ocr-deploy/  # 本機能のドキュメント群
scripts/             # ビルド補助スクリプト（フロント成果物コピー等）
```

**Structure Decision**: Webアプリ単一リポジトリでフロント(Vite)とAPI(Next API Routes)を併存。Vite成果物は public/ui/ に配置し、Nextが配信する。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
