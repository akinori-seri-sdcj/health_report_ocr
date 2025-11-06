# Tasks: Show Source Image Next to OCR Results

**Input**: Design documents from `/specs/003-ocr-image-side-by-side/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not requested in the spec; this plan omits explicit test tasks and focuses on independently verifiable increments per story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal shared scaffolding used by later phases

- [X] T001 [P] Define zoom constraints (MIN_ZOOM=0.5, MAX_ZOOM=2.0) and export from `frontend/src/components/ImagePreview.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core pieces that all user stories rely on

- [X] T002 Expose `sourceImage` selector (url, pageCount) from `frontend/src/store/ocrResultStore.ts`
- [X] T003 [P] Add loading/error state helpers inside `frontend/src/components/ImagePreview.tsx` (placeholders and retry handler signature only)

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Review with visual reference (Priority: P1) — MVP

**Goal**: Display the source image next to OCR results on desktop; stacked views on small screens; non-blocking load/error.

**Independent Test**: Open a record with an image on Confirm/Edit; see image adjacent to results on desktop (≥1024px); stacked on small screens; loader on fetch; retry on failure; editing remains possible while image loads or fails.

### Implementation for User Story 1

- [X] T004 [US1] Implement responsive two-pane layout in `frontend/src/pages/ConfirmEditPage.tsx` (side-by-side desktop; stacked vertical on small screens; no page-level horizontal scroll)
- [X] T005 [P] [US1] Wire `sourceImage` from `frontend/src/store/ocrResultStore.ts` into `frontend/src/pages/ConfirmEditPage.tsx` and pass props to `frontend/src/components/ImagePreview.tsx` (include meaningful alt text)
- [X] T006 [P] [US1] Implement initial fit-to-pane render in `frontend/src/components/ImagePreview.tsx` (object-fit contain or equivalent)
- [X] T007 [US1] Implement loading and error UI with "Retry" in `frontend/src/components/ImagePreview.tsx` (non-blocking, user-friendly message)
- [X] T008 [US1] Add accessibility labels and keyboard focus order for image and controls in `frontend/src/components/ImagePreview.tsx`

**Checkpoint**: User Story 1 is independently functional and verifiable

---

## Phase 4: User Story 2 - Inspect hard-to-read areas (Priority: P2)

**Goal**: Provide zoom, pan, reset, and simple page selection for multi-page sources.

**Independent Test**: Zoom to at least 200%, pan within image bounds, reset to fit-to-pane; switch pages via simple selector; keyboard operable.

### Implementation for User Story 2

- [X] T009 [US2] Implement zoom controls (±) and enforce 0.5–2.0 bounds in `frontend/src/components/ImagePreview.tsx`; keep image crisp up to native resolution
- [X] T010 [P] [US2] Implement pan behavior when zoomed (pointer drag + keyboard arrows) with clamped bounds in `frontend/src/components/ImagePreview.tsx`
- [X] T011 [P] [US2] Implement "Reset view" to fit-to-pane in `frontend/src/components/ImagePreview.tsx`
- [X] T012 [US2] Add simple page selector (Prev/Next with page indicator) in `frontend/src/components/ImagePreview.tsx`; load selected page without resetting zoom unless reset is pressed

**Checkpoint**: User Story 2 is independently functional and verifiable

---

## Phase 5: User Story 3 - Focus workspace as needed (Priority: P3)

**Goal**: Allow users to hide/show the image pane and persist preference for the current session.

**Independent Test**: Toggle hide/show; results area expands/collapses; navigate within session and return to find preference preserved (and prior zoom level if retained).

### Implementation for User Story 3

- [X] T013 [US3] Add "Hide/Show image" toggle control in `frontend/src/pages/ConfirmEditPage.tsx` and conditionally render the image pane
- [X] T014 [P] [US3] Persist `imagePaneVisible` in `frontend/src/store/sessionStore.ts` (default true; scoped to current session)
- [X] T015 [US3] Restore previous visibility and zoom state when returning within the same session in `frontend/src/pages/ConfirmEditPage.tsx` and `frontend/src/components/ImagePreview.tsx`

**Checkpoint**: User Story 3 is independently functional and verifiable

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T016 [P] Add lazy-loading and debounced resize handling in `frontend/src/components/ImagePreview.tsx` to meet performance goals
- [ ] T017 Review accessibility (labels, roles, focus order, keyboard ops) across panes in `frontend/src/components/ImagePreview.tsx` and `frontend/src/pages/ConfirmEditPage.tsx`
- [ ] T018 Update `specs/base/quickstart.md` with any deviations discovered during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies — can start immediately
- Foundational (Phase 2): Depends on Setup completion — BLOCKS all user stories
- User Stories (Phase 3+): Depend on Foundational; proceed in priority order or in parallel after Phase 2
- Polish (Final Phase): Depends on desired user stories being complete

### User Story Dependencies

- User Story 1 (P1): Starts after Phase 2; no dependency on other stories
- User Story 2 (P2): Starts after Phase 2; independent of US1 but benefits from shared components
- User Story 3 (P3): Starts after Phase 2; independent of US1/US2 (toggle/persistence)

### Within Each User Story

- Implement core feature elements; validate acceptance scenarios from spec
- Accessibility and error states are part of the story’s definition of done
- Maintain independence: avoid cross-story coupling

### Parallel Opportunities

- [P] T001 (constants) and T003 (helpers) in early phases
- [P] US1: T005 and T006 can proceed in parallel
- [P] US2: T010 and T011 can proceed in parallel after T009 scaffolds zoom state
- [P] US3: T014 can proceed in parallel with T013
- [P] Polish: T016 can run anytime after US2 scaffolds resize/zoom state

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T003)
3. Complete Phase 3: US1 (T004–T008)
4. STOP and VALIDATE: Manually verify acceptance scenarios for US1

### Incremental Delivery

- Add US2 (T009–T012) → validate → demo
- Add US3 (T013–T015) → validate → demo
- Apply Polish (T016–T018) as needed

---

## Summary & Validation

- Story coverage: US1, US2, US3 each independently testable
- No backend/API changes required per contracts README
- All tasks follow required checklist format with IDs, optional [P], and [USn] labels where applicable


