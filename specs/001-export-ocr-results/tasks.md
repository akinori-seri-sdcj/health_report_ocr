# Tasks: Export OCR Results (CSV/Excel)

## Phase 1: Setup

- [X] T001 Ensure export dependencies present in frontend/package.json (exceljs, encoding-japanese)
- [X] T002 Create export types in frontend/src/types/export.ts
- [X] T003 [P] Scaffold CSV service file in frontend/src/services/csv.service.ts
- [X] T004 [P] Prepare filename utility in frontend/src/services/filename.service.ts
- [X] T005 [P] Scaffold Export Options modal component in frontend/src/components/ExportModal.tsx
- [X] T006 [P] Add permission helper in frontend/src/services/permission.service.ts

## Phase 2: Foundational

- [X] T007 Implement ExportOptions and ColumnDef mappings in frontend/src/types/export.ts
- [X] T008 Wire permission helper to read roles from frontend/src/store/sessionStore.ts
- [X] T009 Expose table selection/visibility getters in frontend/src/services/export.service.ts

## Phase 3: User Story P1 (US1) — Export filtered OCR results

Goal: Export currently visible (filtered/sorted) results to CSV or Excel via existing bottom-right Export button and options modal.
Independent Test: Apply filters and sort, export CSV and Excel, verify rows/columns/order and headers match visible table. Zero rows exports headers only.

- [X] T010 [US1] Implement CSV export (UTF-8 BOM, CRLF, escaping) in frontend/src/services/csv.service.ts
- [X] T011 [P] [US1] Add Shift_JIS encoding path using encoding-japanese in frontend/src/services/csv.service.ts
- [X] T012 [P] [US1] Implement Excel export (single sheet "Export", headers row 1) in frontend/src/services/excel.service.ts
- [X] T013 [US1] Build options modal UI (format, scope=Filtered default, encoding for CSV) in frontend/src/components/ExportModal.tsx
- [X] T014 [US1] Reuse existing Export button: open modal and pass table context in frontend/src/pages/ConfirmEditPage.tsx
- [X] T015 [US1] Map visible columns and sorted rows from EditableTable to export payload in frontend/src/services/export.service.ts
- [X] T016 [US1] Handle zero-rows: generate headers-only file in csv.service.ts and excel.service.ts
- [X] T017 [US1] Enforce 50,000 row cap with user message in frontend/src/services/export.service.ts
- [X] T018 [US1] Generate filename with dataset/context + timestamp in frontend/src/services/filename.service.ts

## Phase 4: User Story P2 (US2) — Export selected rows

Goal: Export only explicitly selected rows; if none selected, prompt to export all filtered.
Independent Test: Select subset then export; verify only selected rows are included. With none selected and scope=Selected, user is prompted to export All filtered.

- [X] T019 [US2] Add scope toggle (Filtered vs Selected) to ExportOptionsModal in frontend/src/components/ExportModal.tsx
- [X] T020 [US2] Read selected row ids and resolve rows in frontend/src/services/export.service.ts
- [X] T021 [US2] Implement none-selected prompt and fallback to filtered in frontend/src/pages/ConfirmEditPage.tsx

## Phase 5: User Story P3 (US3) — File naming and metadata

Goal: Meaningful filenames and metadata; Excel sheet named "Export"; localized headers preserved.
Independent Test: Verify filenames follow pattern `Name_Export_YYYYMMDD-HHmm.ext`; Excel has headers row 1 and sheet name; headers use localized labels.

- [X] T022 [US3] Ensure localized column headers are used in both formats in frontend/src/types/export.ts
- [X] T023 [P] [US3] Set Excel sheet name and freeze header row in frontend/src/services/excel.service.ts
- [X] T024 [US3] Finalize filename builder with dataset/context awareness in frontend/src/services/filename.service.ts
- [X] T025 [US3] Show non-blocking progress indicator during generation in frontend/src/components/ExportModal.tsx and pages/ConfirmEditPage.tsx

## Final Phase: Polish & Cross-Cutting

- [X] T026 Add role gating: disable/hide Export button for non Admin/Data Exporter in frontend/src/pages/ConfirmEditPage.tsx
- [X] T027 Display clear success/failure toasts and error messaging in frontend/src/pages/ConfirmEditPage.tsx
- [X] T028 Verify non-ASCII data opens correctly in common spreadsheets (manual QA script) in specs/001-export-ocr-results/quickstart.md

## Dependencies

- US1 → US2 (selection export depends on base export flow)
- US1 ↔ US3 (filename/metadata can be developed in parallel but US1 relies on basics)
- Setup → Foundational → US1 → US2 → US3 → Polish

## Parallel Execution Examples

- T003, T004, T005, T006 can run in parallel (separate files)
- In US1: T011 and T012 parallelize (CSV SJIS path vs Excel)
- In US3: T023 and T024 parallelize (Excel metadata vs filename builder)

## Implementation Strategy

- MVP: Complete Phase 3 (US1) tasks T010–T018 to ship filtered export for CSV/Excel via existing button and options modal.
- Incremental: Add US2 selection flow, then US3 naming/metadata polish, then role gating and UX feedback.

## Format Validation

All tasks follow the required checklist format `- [ ] T### [P] [US#] Description with file path`.

*** End of Tasks ***
