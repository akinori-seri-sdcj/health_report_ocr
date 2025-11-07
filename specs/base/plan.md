# Implementation Plan: OCR 読み取り元画像の上部表示（確認・編集）

**Branch**: `base` | **Date**: 2025-11-06 | **Spec**: specs/003-ocr-image-side-by-side/spec.md
**Input**: Feature specification clarified under `specs/003-ocr-image-side-by-side/spec.md`

## Summary

目的は、確認・編集画面で「元画像を常時参照しながらOCR結果を修正」しやすくすること。レイアウトは縦配置で、上部にstickyな画像ペイン（デスクトップ40vh/モバイル35vh、fit‑width、独立スクロール）、下部にOCR結果。画像ペインは右上ツールバーでズーム±/リセットとページ前後を操作し、キーボード操作にも対応。ズーム/パン/ページ/高さプリセットは「同一レコードの確認中セッション」で保持する。

## Technical Context

**Language/Version**: TypeScript 5.x（frontend, backend）  
**Primary Dependencies**: Frontend: React 18, Zustand, React Router, Tailwind, Vite。Backend: Node.js + Express, Multer, Zod。  
**Storage**: 永続ストレージ不要（本機能はUIのみ）。セッション内状態はフロントのストア（Zustand/local state）で保持。  
**Testing**: NEEDS CLARIFICATION（フロント: React Testing Library/Vitest 予定、バックエンド: supertest/Jest 予定）  
**Target Platform**: Web（Vite dev + Nginx reverse proxy, Docker compose）  
**Project Type**: web（`frontend/` + `backend/` 構成）  
**Performance Goals**: 2MB画像の初回可視化 ≤ 1.5s（95%）、操作はフレーム落ちなく滑らか  
**Constraints**: スクロールは横方向禁止。アクセシビリティ（キーボード操作/代替テキスト）必須。  
**Scale/Scope**: 1画面（確認・編集）へのUI拡張。バックエンドAPI追加なし。

## Constitution Check

Gate結果（事前）
- Specification-First: OK（対象Specは 003 に明記、Clarifications 追記済み）
- Simplicity & User Value: OK（UIのみ、最小実装。高さはプリセットで複雑さ抑制）
- Data Privacy & Auditability: OK（画像表示のみ。エクスポートへ画像混入なし）
- Incremental Slices: OK（画面単位の独立改修）
- Change Control & Versioning: OK（`base`ブランチで計画、docsは追記方針）

再チェックはPhase 1後に実施。

## Project Structure

### Documentation (this feature)

```text
specs/base/
  plan.md          # このファイル
  research.md      # Phase 0（本計画で生成）
  data-model.md    # Phase 1（本計画で生成）
  quickstart.md    # Phase 1（本計画で生成）
  contracts/       # Phase 1（必要に応じてOpenAPI等）
```

### Source Code (repository root)

```text
backend/
  src/
    routes/
    controllers/
    services/

frontend/
  src/
    components/
    pages/
    services/
    store/
```

**Structure Decision**: 既存の `frontend/`（React + Zustand）を拡張。`backend/` は変更なし。

## Complexity Tracking

（該当なし）

