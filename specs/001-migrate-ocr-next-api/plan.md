# Implementation Plan: 健康診断OCR API Routes移行

**Branch**: `001-migrate-ocr-next-api` | **Date**: 2025-11-28 | **Spec**: specs/001-migrate-ocr-next-api/spec.md
**Input**: Feature specification from `/specs/001-migrate-ocr-next-api/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript / Node 18+ (Next.js 14)  
**Primary Dependencies**: Next.js API Routes, OpenAI SDK (gpt-4o vision), zod schema validation  
**Storage**: None (stateless)  
**Testing**: Integration-style route handler tests (multipart validation, mock mode, OpenAI call shape)  
**Target Platform**: Vercel serverless (Node runtime)
**Project Type**: Web (frontend + API route)  
**Performance Goals**: 90% of OCR requests return within 10s (per spec SC-001)  
**Constraints**: Serverless execution time limits; request size caps (10 files, 10MB); secrets must stay server-side (no NEXT_PUBLIC)  
**Scale/Scope**: Single API route supporting existing frontend flows; moderate traffic within serverless limits

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Specification-First, Testable Outcomes: Spec present with measurable SC → PASS
- Simplicity and User Value: Remove custom server; minimal route → PASS
- Data Privacy and Auditability: No PII logging; env keys server-side → PASS
- Incremental Delivery: Single route slice, backward-compatible response → PASS
- Change Control and Versioning: Working on branch 001-migrate-ocr-next-api; artifacts in specs/ → PASS

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

---

# Filled Implementation Plan: 健康診断OCR API Routes移行

**Branch**: `001-migrate-ocr-next-api` | **Date**: 2025-11-28 | **Spec**: specs/001-migrate-ocr-next-api/spec.md
**Input**: Feature specification from `/specs/001-migrate-ocr-next-api/spec.md`

## Summary
- Migrate OCR backend from Express server to Next.js API Route (`/api/ocr`) to run reliably on Vercel serverless.
- Preserve existing OCR behavior (image validation, OpenAI Vision prompt/response validation, mock mode) and keep API contract stable for the frontend.
- Guard for serverless limits (execution time, payload sizes); document timeout considerations and keep env vars server-side.

## Technical Context
- **Language/Version**: TypeScript / Node 18+ (Next.js 14 runtime)
- **Primary Dependencies**: Next.js API Routes, OpenAI SDK (gpt-4o vision), zod validation (existing schema)
- **Storage**: None (stateless serverless function)
- **Testing**: Integration-style route handler tests (multipart validation, mock mode, OpenAI call shape); lint via Next built-in
- **Target Platform**: Vercel serverless (Node runtime)
- **Project Type**: Web (frontend + API route)
- **Performance Goals**: 90% of OCR requests return within 10s with stable JSON structure (per spec SC-001)
- **Constraints**: Serverless execution time limits; request size caps (10 files, 10MB each); avoid exposing secrets (`NEXT_PUBLIC_*` not used)
- **Scale/Scope**: Single API route supporting existing frontend flows; expected moderate traffic, burst-safe within serverless limits

## Constitution Check
- **Specification-First, Testable Outcomes**: Spec completed with measurable success criteria and acceptance scenarios → PASS
- **Simplicity and User Value**: Replace custom server with native API Route; no extra abstractions → PASS
- **Data Privacy and Auditability**: No PII logged; env keys stay server-side; traceability via structured responses → PASS
- **Incremental Delivery with Independent Slices**: Single route migration keeps frontend contract stable and independently deployable → PASS
- **Change Control and Versioning**: Working on branch `001-migrate-ocr-next-api`, spec/plan versioned in `specs/` → PASS

## Project Structure
```text
app/
└── api/
    └── ocr/route.ts       # Next.js API Route (serverless)

frontend/
└── src/
    ├── api/healthReportApi.ts   # Calls /api/ocr
    └── ... (UI/components)

specs/001-migrate-ocr-next-api/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── ocr.yaml
```

**Structure Decision**: Web application with frontend and Next API Route; legacy `backend/` retained only for reference and to be decommissioned after migration.

## Complexity Tracking
N/A (no constitution violations requiring justification)
