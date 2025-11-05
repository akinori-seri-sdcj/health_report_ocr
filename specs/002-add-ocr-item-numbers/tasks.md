# Tasks: OCR結果表示画面：項目番号表示の実装

**Input**: Design documents from `C:\Users\aseri\Desktop\health_report_ocr\specs\002-add-ocr-item-numbers\`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL. This task list focuses on implementation tasks; independent test criteria are provided per story.

**Organization**: Tasks are grouped by user story (US1..US3) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare minimal structure and shared assets used by all stories

- [X] T001 Create feature UI directories per plan in src/ui/ocr_results/
- [X] T002 Create export directories per plan in src/exports/csv/ and src/exports/pdf/
- [X] T003 [P] Add stylesheet scaffold for OCR結果画面 in src/ui/ocr_results/ocr_results_view.css
- [X] T004 [P] Add module scaffold for numbering logic in src/ui/ocr_results/numbering.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic shared by all user stories (MUST complete before US1..US3)

- [X] T005 Implement fixed-ID based numbering map generator in src/ui/ocr_results/numbering.js
- [X] T006 Define numbering render helper (inject number left of label) in src/ui/ocr_results/numbering.js
- [X] T007 Add base styles for number badge (spacing/visibility) in src/ui/ocr_results/ocr_results_view.css
- [X] T008 Wire numbering initializer placeholder in src/ui/ocr_results/ocr_results_view.js

**Checkpoint**: Foundation ready — user story implementation can begin in parallel

---

## Phase 3: User Story 1 — 項目参照の迅速化 (Priority: P1)  — MVP

**Goal**: 各可視項目の左横に1から始まる重複のない番号を表示する（固定IDに基づく、画面全体で通し番号）

**Independent Test**: 画面を開くと全可視項目に1..Nの番号が左横に表示され、重複・欠番・重なりがないこと。

### Implementation for User Story 1

- [X] T009 [US1] Integrate numbering map into initial render in src/ui/ocr_results/ocr_results_view.js
- [X] T010 [P] [US1] Render number element before item label in src/ui/ocr_results/ocr_results_view.js
- [X] T011 [P] [US1] Ensure half-width digits and adequate spacing in src/ui/ocr_results/ocr_results_view.css
- [X] T012 [US1] Validate uniqueness and sequential numbering in src/ui/ocr_results/numbering.js

**Checkpoint**: User Story 1 independently functional and demonstrable

---

## Phase 4: User Story 2 — フィルタ/並び替え後の参照 (Priority: P2)

**Goal**: 並び替え/フィルタ/遅延読み込み後でも番号表示が崩れず、可視項目のみ番号が表示される。

**Independent Test**: 並び替え/フィルタを適用しても、表示中の項目の番号が重複・欠落なく視認できること。

### Implementation for User Story 2

- [X] T013 [US2] Hook numbering re-apply after sort/filter events in src/ui/ocr_results/ocr_results_view.js
- [X] T014 [P] [US2] Hook numbering re-apply after async data load in src/ui/ocr_results/ocr_results_view.js
- [X] T015 [US2] Ensure hidden/disabled items are excluded from numbering display in src/ui/ocr_results/numbering.js

**Checkpoint**: User Story 2 independently functional and demonstrable

---

## Phase 5: User Story 3 — アクセシビリティ対応 (Priority: P3)

**Goal**: スクリーンリーダーで「番号→ラベル→値」の順で読み上げられるようにする。

**Independent Test**: 項目にフォーカス時、番号→ラベル→値の順で読み上げられ、キーボード操作時も視認可能な位置に番号が表示される。

### Implementation for User Story 3

- [X] T016 [US3] Add accessible labeling/reading order for number→label→value in src/ui/ocr_results/ocr_results_view.js
- [X] T017 [P] [US3] Mark decorative elements appropriately (e.g., aria-hidden) in src/ui/ocr_results/ocr_results_view.js
- [X] T018 [P] [US3] Adjust focus/spacing to keep number visible in src/ui/ocr_results/ocr_results_view.css

**Checkpoint**: User Story 3 independently functional and demonstrable

---

## Phase 6: Exports — 番号の出力整合（仕様合意に基づき必須）

**Goal**: 画面の番号と一致する番号をCSV/PDF/印刷に含める。

**Independent Test**: CSVの`ItemNo`列、PDF/印刷のラベル左の番号が画面表示と一致する。

### Implementation for Exports

- [X] T019 Add ItemNo column mapping in src/exports/csv/export_ocr_results.js
- [X] T020 [P] Add PDF/print number rendering next to label in src/exports/pdf/export_ocr_results.js

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: 横断的な仕上げと安定化

- [X] T021 [P] Update quickstart with run/verify steps in specs/002-add-ocr-item-numbers/quickstart.md
- [X] T022 Refine spacing/wrapping for small screens in src/ui/ocr_results/ocr_results_view.css
- [X] T023 Code cleanup and inline docs in src/ui/ocr_results/numbering.js
- [X] T024 Validate consistency across tabs/sections (global continuity) in src/ui/ocr_results/ocr_results_view.js

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup — BLOCKS US1..US3, Exports
- User Stories (Phase 3..5): Depend on Foundational; can proceed in parallel if staffed
- Exports (Phase 6): Depends on US1 completion (numbering established), can run parallel with US2/US3
- Polish (Final): After desired phases complete

### User Story Dependencies

- US1 (P1): Depends on Foundational
- US2 (P2): Depends on Foundational（US1に依存しないが、同時開始推奨）
- US3 (P3): Depends on Foundational（US1に依存しないが、同時開始推奨）

### Parallel Opportunities Examples

- Setup: T003, T004 can run in parallel
- US1: T010 and T011 can run in parallel（別ファイル）
- US2: T013 and T014 can run in parallel（別イベントフック）
- US3: T017 and T018 can run in parallel（別ファイル/関心）
- Exports: T019 and T020 can run in parallel

---

## Implementation Strategy

### MVP First（User Story 1 Only）

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational（CRITICAL）
3. Complete Phase 3: US1（MVP）
4. STOP and VALIDATE（手動確認/デモ）

### Incremental Delivery

1. Setup + Foundational → US1 → Deliver MVP
2. In parallel or sequentially add US2/US3（独立に検証/デモ）
3. Add Exports → 確認してポリッシュへ

---

## Notes

- [P] tasks = different files, no dependencies
- [USn] label maps task to specific user story for traceability
- Each user story is independently completable and testable via acceptance criteria
- Keep changes minimal and focused per file; commit after each task







