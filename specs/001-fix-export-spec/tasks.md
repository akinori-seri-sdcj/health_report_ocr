---

description: "Task list for CSV/Excel Export (Download)"
---

# Tasks: CSV/Excel Export (Download)

**Input**: Design documents from `C:\Users\aseri\Desktop\health_report_ocr\specs\001-fix-export-spec\`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Only include tests if explicitly requested. This plan omits test tasks per current scope.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- [P]: Can run in parallel (different files, no dependencies)
- [Story]: Which user story this task belongs to (US1, US2, US3)
- Paths below are absolute to ensure clarity

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare folders and stubs per implementation plan

- [X] T001 Create export services folder at `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\` (no code yet)
- [X] T002 [P] Add file stub `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\excel.service.ts` with exported functions and TODOs only
- [X] T003 [P] Add file stub `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\csv.service.ts` with exported functions and TODOs only
- [X] T004 Add file stub `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts` with function signatures (no implementation)
- [X] T005 [P] Add UI stub `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\components\ExportModal.tsx` (unwired; modal skeleton only)
- [X] T006 Add OpenAPI contract file from plan into repo at `C:\Users\aseri\Desktop\health_report_ocr\specs\001-fix-export-spec\contracts\export-audit.openapi.yaml` (already present; verify path)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core foundations required before any user story work

- [X] T007 Define export data shape interface in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts` referencing `ocrResultStore` structures
- [X] T008 [P] Implement dataset extractors (from `ocrResultStore`) in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts` returning rows + headers
- [X] T009 [P] Implement filename builder in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts` using session id from `sessionStore`
- [X] T010 Wire basic modal trigger point placeholder in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\pages\ConfirmEditPage.tsx` (no export action yet)

**Checkpoint**: Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 — Download reviewed data (Priority: P1) — MVP

**Goal**: Enable users to download reviewed OCR data as Excel (.xlsx) or CSV (.csv) with correct headers, values, and naming.

**Independent Test**: From ConfirmEditPage, export Excel and CSV; verify file names, headers, and values match current data without using other features.

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement Excel generation in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\excel.service.ts` (header row, date/time/dot-decimal formatting)
- [X] T012 [P] [US1] Implement CSV builder (RFC 4180, CRLF, quoting/escaping) in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\csv.service.ts`
- [X] T013 [US1] Implement Shift_JIS encoding path in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\csv.service.ts` using chosen approach from research
- [X] T014 [US1] Implement export orchestration (format selection, dataset extraction, naming, blob download) in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts`
- [X] T015 [P] [US1] Implement Export modal (format selector default Excel, basic confirmation) in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\components\ExportModal.tsx`
- [X] T016 [US1] Wire Export button and modal open/close in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\pages\ConfirmEditPage.tsx` (disable when zero rows)
- [X] T017 [US1] Add success and failure UX (toasts/messages) in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\pages\ConfirmEditPage.tsx`

**Checkpoint**: User Story 1 independently delivers downloadable Excel and CSV files.

---

## Phase 4: User Story 2 — Export a subset (Priority: P2)

**Goal**: Allow export of only filtered rows and/or selected columns in a chosen order.

**Independent Test**: Apply an on-screen filter and column selection, export “Only filtered rows”; counts and column order match the view.

### Implementation for User Story 2

- [X] T018 [P] [US2] Add scope selector (All data | Only filtered rows) in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\components\ExportModal.tsx` (default: Only filtered rows)
- [X] T019 [P] [US2] Add column selection and ordering UI in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\components\ExportModal.tsx`
- [X] T020 [US2] Apply scope to dataset extraction in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts` (subset rows based on current view predicate)
- [X] T021 [US2] Apply selected column subset and order in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts`

**Checkpoint**: User Story 2 independently exports filtered rows and selected columns.

---

## Phase 5: User Story 3 — Traceability & compliance (Priority: P3)

**Goal**: Provide predictable file naming and optional audit logging of export events.

**Independent Test**: Export triggers correct filename format and records a non-PII export event (completed/canceled/failed) with timestamp and counts.

### Implementation for User Story 3

- [X] T022 [P] [US3] Ensure filename pattern is enforced in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts` (`health-report-<yyyyMMdd-HHmmss>-<session-id>.<ext>`)
- [X] T023 [P] [US3] Add export progress indicator and cancel support in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\components\ExportModal.tsx`
- [X] T024 [US3] Emit frontend export events (completed/canceled/failed) with timestamp/user/record count/format in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts`
- [X] T025 [US3] Backend: add audit route `POST /audit/exports` in `C:\Users\aseri\Desktop\health_report_ocr\backend\src\routes\audit.routes.ts`
- [X] T026 [US3] Backend: add controller handler in `C:\Users\aseri\Desktop\health_report_ocr\backend\src\controllers\audit.controller.ts` (validate payload and log)
- [X] T027 [US3] Backend: register route in `C:\Users\aseri\Desktop\health_report_ocr\backend\src\index.ts` and add minimal service in `C:\Users\aseri\Desktop\health_report_ocr\backend\src\services\audit.service.ts`
- [X] T028 [US3] Frontend: optionally POST export event to backend in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\services\export.service.ts` (non-blocking; ignore if unavailable)

**Checkpoint**: User Story 3 independently delivers naming and audit traceability.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements across stories

- [X] T029 [P] Documentation updates referencing `C:\Users\aseri\Desktop\health_report_ocr\specs\001-fix-export-spec\quickstart.md`
- [X] T030 Code cleanup and comments in new services/components
- [X] T031 Performance tuning for large exports (chunk size, worker toggle)
- [X] T032 [P] Validate contract alignment with `C:\Users\aseri\Desktop\health_report_ocr\specs\001-fix-export-spec\contracts\export-audit.openapi.yaml`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup completion — BLOCKS all user stories
- User Stories (Phase 3+): Depend on Foundational completion; then proceed in priority order or in parallel
- Polish (Final): After desired user stories complete

### User Story Dependencies

- User Story 1 (P1): Starts after Foundational; independent
- User Story 2 (P2): Starts after Foundational; independent; uses dataset extraction built earlier
- User Story 3 (P3): Starts after Foundational; independent; optionally integrates backend audit

### Parallel Opportunities

- [P] tasks in Setup and Foundational can run concurrently
- US1 coding splits in parallel: Excel vs CSV vs Modal UI
- US2 UI (scope/columns) can proceed in parallel and later wire into export.service
- US3 backend route/controller/service can proceed in parallel to frontend eventing

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup (Phase 1)
2. Complete Foundational (Phase 2)
3. Implement US1 tasks (T011–T017)
4. Validate via `quickstart.md` core flows

### Incremental Delivery

1. Deliver US1 (MVP) → validate and demo
2. Add US2 (subset export) → demo
3. Add US3 (traceability) → demo

---

## Validation

- All tasks follow required checklist format (checkbox, ID, optional [P], optional [US#], and absolute file path)
- Stories are independently testable per acceptance criteria in spec.md
- Tasks reference concrete files and locations consistent with current repo structure

