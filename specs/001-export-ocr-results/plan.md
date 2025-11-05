# Implementation Plan: Export OCR Results (CSV/Excel)

**Branch**: `001-export-ocr-results` | **Date**: 2025-11-05 | **Spec**: specs/001-export-ocr-results/spec.md
**Input**: Feature specification at `specs/001-export-ocr-results/spec.md`

## Summary

Implement export of OCR results to CSV and Excel from the existing bottom-right Export button via an options modal (format, scope, encoding). CSV defaults to UTF-8 with option for Shift_JIS; Excel uses a single-sheet workbook. Enforce a hard cap of 50,000 rows per export and restrict export to Admin/Data Exporter roles.

## Technical Context

**Language/Version**: TypeScript (frontend and backend)  
**Primary Dependencies**: exceljs (Excel export), encoding-japanese (Shift_JIS CSV), existing table/store components  
**Storage**: N/A (client-side generation; no persistence required)  
**Testing**: npm test; add unit tests around export services  
**Target Platform**: Web PWA (desktop/mobile browsers)  
**Project Type**: Web (frontend + backend)  
**Performance Goals**: Generate ≤5,000 rows export in ≤10s (SC-001); support up to 50,000 rows hard cap  
**Constraints**: Avoid UI blocking; handle non-ASCII safely; offline-capable export when data is locally present  
**Scale/Scope**: Typical datasets ≤20 columns; up to 50,000 rows per export

## Constitution Check

GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.

- Simplicity: Client-side export avoids unnecessary services — PASS
- Testability: Add unit tests for CSV escaping/encoding and Excel sheet generation — PASS
- Observability: Not applicable (no backend change) — PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-export-ocr-results/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
  src/
    api/
    services/
  tests/

frontend/
  src/
    components/
    pages/
    services/
      excel.service.ts
      storage.service.ts
      api.service.ts
    stores/
  tests/
```

Structure Decision: Web application with client-side export logic in `frontend/src/services/excel.service.ts` and UI entry in the existing bottom-right Export button (確認・修正 screen). No backend endpoints added for export.

## Phase 0: Outline & Research

Unknowns extracted from Technical Context: None critical (encoding default, button placement, export cap, permissions resolved in spec). Dependencies and integrations reviewed for best practices.

Generated research tasks:
- Research CSV escaping and encoding choices for JP and global environments (UTF-8 vs Shift_JIS).
- Validate exceljs performance and memory usage for up to 50k rows single sheet.
- Confirm UI pattern for modal with format/scope/encoding that fits existing design.

See research.md for decisions and rationale.

## Phase 1: Design & Contracts

Prerequisite: research.md complete.

Artifacts to produce:
- data-model.md: Entities `OcrResultRow`, `ExportRequest`, `ExportOptions`, `ColumnDef` with validation rules from spec.
- contracts/: No new API endpoints required; document N/A. Provide a minimal OpenAPI stub if needed for audit-only placeholder.
- quickstart.md: How to run and validate exports interactively and via tests.
- Agent context update: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType codex`.

## Complexity Tracking

No constitution violations identified.

