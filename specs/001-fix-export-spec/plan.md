# Implementation Plan: CSV/Excel Export (Download)

**Branch**: `001-fix-export-spec` | **Date**: 2025-11-04 | **Spec**: specs/001-fix-export-spec/spec.md
**Input**: Feature specification from `/specs/001-fix-export-spec/spec.md`

## Summary

Add a user-facing export on the results/confirmation screen to download reviewed OCR data as Excel (.xlsx) or CSV (.csv). Honor filters/column selections, preserve readable formatting, follow the file naming convention, and record a non-PII export event. CSV defaults to Shift_JIS; Excel uses .xlsx. Implementation is client-first with optional backend export-event logging.

## Technical Context

**Language/Version**: TypeScript (frontend), TypeScript (backend)  
**Primary Dependencies**: exceljs (Excel export), encoding-japanese (CSV Shift_JIS encoding), existing state/store and table components  
**Storage**: N/A (export generated from in-memory reviewed dataset)  
**Testing**: Jest/unit for formatting/CSV escaping; lightweight e2e manual checklist; optional Playwright for download behavior  
**Target Platform**: Web (PWA desktop/mobile browsers)  
**Project Type**: web  
**Performance Goals**: Per spec SC-001: 95% of ≤5k rows begin download ≤5s  
**Constraints**: Offline-capable front-end; avoid freezing UI; preserve human-readable formatting; CSV default encoding Shift_JIS  
**Scale/Scope**: Typical exports up to ~10k rows; soft limit messaging for larger

Unknowns to resolve in Phase 0 research:
- BEST CHOICE: Confirm browser-friendly library for Shift_JIS encoding (candidate: encoding-japanese)
- BEST PRACTICE: Large export responsiveness (chunking vs Web Worker)

## Constitution Check

GATE (pre-design): The constitution file is a placeholder; no enforced principles are defined.  
Result: No blocking gates. Proceed. Will re-check after design for unjustified complexity.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-export-spec/
  plan.md              # This file
  research.md          # Phase 0 output
  data-model.md        # Phase 1 output
  quickstart.md        # Phase 1 output
  contracts/           # Phase 1 output
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
    pages/
    components/
    services/
      excel.service.ts           # XLSX generation helpers
      csv.service.ts             # CSV generation + encoding
      export.service.ts          # Orchestrates format, scope, naming
    stores/
```

**Structure Decision**: Web app (frontend + backend). Export is implemented in the frontend services; backend optionally logs export events.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Additional small browser lib (encoding-japanese) | Required for Shift_JIS CSV encoding on web | Native TextEncoder lacks Shift_JIS; backend transcoding adds coupling and breaks offline-first |

---

## Phase 0: Outline & Research

Research tasks derived from Technical Context unknowns and best practices:

- Task: Research browser-safe Shift_JIS encoding to satisfy CSV default encoding (evaluate encoding-japanese vs iconv-lite vs backend transcoding)
- Task: Find best practices for exporting large datasets from web UIs without UI freeze (chunking, requestIdleCallback, Web Worker)
- Task: Review RFC 4180 CSV quoting/escaping and CRLF line endings for compatibility with spreadsheet tools
- Task: Validate Excel header/number/date formatting with exceljs

Consolidate findings in `research.md` using decision/rationale/alternatives format. All NEEDS CLARIFICATION must be resolved in research before Phase 1.

Artifacts:
- specs/001-fix-export-spec/research.md

---

## Phase 1: Design & Contracts

Prerequisite: `research.md` complete with decisions.

1) Data Model (`data-model.md`)
- Entities: ExportRequest, ExportEvent, DatasetRow
- Fields: format, scope (all/filtered), columns, sort, counts, timestamps, session id
- Validation: unique headers, encoding choice, size limits, filename pattern

2) API Contracts (`contracts/`)
- Define optional audit endpoint to record export events:
  - POST `/audit/exports` → 201 Created (id, timestamp, user, count, format, scope)
- Provide OpenAPI YAML in `contracts/export-audit.openapi.yaml`

3) Quickstart (`quickstart.md`)
- Steps to run the app and manually verify core flows (Excel/CSV), naming, permissions, scope selection, and error messages

4) Agent Context Update
- Run: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType codex`
- Ensure Technical Context fields above reflect the selected stack so agent context captures it

Re-check Constitution: confirm no unjustified complexity; document any deviations in Complexity Tracking.

---

## Phase 2: Implementation Planning (high-level tasks only)

- Frontend services
  - `export.service.ts`: assemble dataset from store, apply filters/columns, naming, route to Excel/CSV
  - `excel.service.ts`: worksheet, header row, date/number formatting
  - `csv.service.ts`: RFC 4180 quoting, CRLF, Shift_JIS encoding, blob download
- UI integration
  - Add Export button + modal (format, scope, columns), progress/cancel UX, disabled state for zero rows
  - Permission check: hide/disable for unauthenticated users
- Telemetry
  - Emit export events; optional call to backend audit endpoint
- Testing
  - Unit tests: header mapping, CSV quoting, naming pattern; manual e2e for download flow

Note: This phase lists tasks only; no implementation in this step.

