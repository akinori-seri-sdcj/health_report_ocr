# Tasks: 健康診断OCR API Routes移行

**Input**: Design documents from `/specs/001-migrate-ocr-next-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in spec; test tasks omitted.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure Next.js API route project is ready to run on Vercel with required configs.

- [X] T001 Verify root Next.js project dependencies and scripts in `C:\Users\aseri\Desktop\health_report_ocr\package.json` are installed and usable (`npm install`, `next dev/build/start`).
- [X] T002 [P] Validate `C:\Users\aseri\Desktop\health_report_ocr\next.config.js` and `C:\Users\aseri\Desktop\health_report_ocr\tsconfig.json` support API Routes (runtime nodejs, strict checks) and adjust if gaps found.
- [X] T003 [P] Confirm environment variable documentation for `OPENAI_API_KEY`/`MOCK_OCR` is present and consistent in `C:\Users\aseri\Desktop\health_report_ocr\specs\001-migrate-ocr-next-api\quickstart.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared pieces required before user stories.

- [X] T004 Establish shared OCR schema/type location (e.g., move/copy from `backend/src/types/health-report.schema.ts` to `C:\Users\aseri\Desktop\health_report_ocr\shared\health-report.schema.ts`) and update imports to use it.
- [X] T005 [P] Add environment presence guard (fail fast when `OPENAI_API_KEY` missing unless `MOCK_OCR=1`) in `C:\Users\aseri\Desktop\health_report_ocr\app\api\ocr\route.ts`.

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - 健康診断書のOCR結果を受け取る (Priority: P1) ?? MVP

**Goal**: Users upload health-check images and receive OCR results within serverless limits.

**Independent Test**: From deployed env, send supported images and receive major fields without timeout; partial results returned when some fields unreadable.

### Implementation for User Story 1

- [X] T006 [US1] Align multipart validation (file count/size/MIME) and rejection messages in `C:\Users\aseri\Desktop\health_report_ocr\app\api\ocr\route.ts` to match spec limits (≤10 files, ≤10MB, allowed types).
- [X] T007 [P] [US1] Ensure OpenAI request/response handling in `C:\Users\aseri\Desktop\health_report_ocr\app\api\ocr\route.ts` respects timeout target (~10s) and preserves existing JSON structure for frontend.
- [X] T008 [P] [US1] Verify frontend caller uses new endpoint and handles success/partial-failure messaging in `C:\Users\aseri\Desktop\health_report_ocr\frontend\src\api\healthReportApi.ts`.

**Checkpoint**: OCR upload→result flow works and returns expected fields without timeout.

---

## Phase 4: User Story 2 - デプロイ後の稼働確認を行う (Priority: P2)

**Goal**: Ops can run post-deploy health checks and confirm OCR API availability.

**Independent Test**: Immediately after deploy, call health endpoint and sample OCR request; no HTTP errors and expected fields returned.

### Implementation for User Story 2

- [X] T009 [US2] Add lightweight health/smoke endpoint (e.g., `C:\Users\aseri\Desktop\health_report_ocr\app\api\ocr\health\route.ts`) that checks env presence and mock-mode availability without heavy OCR call.
- [X] T010 [P] [US2] Document health-check steps (URLs, expected responses) in `C:\Users\aseri\Desktop\health_report_ocr\specs\001-migrate-ocr-next-api\quickstart.md`.

**Checkpoint**: Health check callable post-deploy; sample OCR smoke passes without 5xx.

---

## Phase 5: User Story 3 - エラー時のフォールバックを把握する (Priority: P3)

**Goal**: Clear user messaging and traceable logs when OCR fails due to bad input or external issues.

**Independent Test**: Invalid input returns actionable message; external OCR failure logs cause with trace ID; user gets retry guidance.

### Implementation for User Story 3

- [ ] T011 [US3] Standardize error responses with retry/repair hints and codes in `C:\Users\aseri\Desktop\health_report_ocr\app\api\ocr\route.ts`.
- [ ] T012 [P] [US3] Add structured logging/metrics for request metadata (file count/size, timing, trace ID) in `C:\Users\aseri\Desktop\health_report_ocr\app\api\ocr\route.ts` without exposing PII.

**Checkpoint**: Error/fallback paths provide guidance to users and traceability for ops.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and docs.

- [X] T013 [P] Update quickstart and README pointers with final runbook and env notes in `C:\Users\aseri\Desktop\health_report_ocr\specs\001-migrate-ocr-next-api\quickstart.md` and `C:\Users\aseri\Desktop\health_report_ocr\README.md`.
- [X] T014 [P] Light refactor/format pass across `C:\Users\aseri\Desktop\health_report_ocr\app\api\ocr\route.ts` to ensure clarity and comment any serverless timeout considerations.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User Stories in priority order (US1, US2, US3) → Polish.
- User stories can proceed after foundational; US2/US3 may run in parallel once US1 core path is stable.

## Parallel Opportunities

- [P] tasks in Setup/Foundational (T002, T003, T005) can run concurrently.
- Within US1, T007 and T008 can proceed in parallel after T006.
- US2 tasks can run in parallel with US3 once US1 path is validated.
- Polish tasks (T013, T014) can run in parallel after story completion.

## Implementation Strategy

- MVP = Complete US1 (P1): ensure `/api/ocr` accepts images, validates input, calls OpenAI/mock, and returns expected JSON within time target.
- Incremental: After MVP, add health endpoint (US2) for deploy confidence, then enhance error/fallback logging/messaging (US3).
