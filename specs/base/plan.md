# Implementation Plan: Show Source Image Next to OCR Results

**Branch**: `base` | **Date**: 2025-11-06 | **Spec**: specs/003-ocr-image-side-by-side/spec.md
**Input**: Feature specification for side-by-side image display on the Confirm/Edit screen

## Summary

Add a side-by-side source image viewer on the Confirm/Edit screen to improve OCR verification accuracy and speed. Desktop shows image and results simultaneously; small screens use stacked views. Provide zoom (50–200%), pan, reset, a simple page selector for multi-page sources, a hide/show toggle, and robust loading/error states. Image source defaults to the original upload. No backend/API changes required.

## Technical Context

**Language/Version**: TypeScript 5.x; React 18.x  
**Primary Dependencies**: React, Zustand, React Router; reuse existing `frontend/src/components/ImagePreview.tsx` where feasible; no new libraries planned  
**Storage**: N/A for this feature (UI only); session prefs may use in-memory store or existing client storage  
**Testing**: React Testing Library for component behavior; manual exploratory E2E on supported browsers  
**Target Platform**: Web (desktop ≥1024px and mobile web)  
**Project Type**: Web application (frontend + backend present; frontend-only change)  
**Performance Goals**: First image visible within 1.5s for ~2MB images on typical connection (95th percentile)  
**Constraints**: Respect access controls; do not log sensitive content; maintain accessibility (keyboard operable, labeled controls)  
**Scale/Scope**: Single screen enhancement with no data model or API changes

## Constitution Check

Gate Results (pre-Phase 0):
- Specification-First, Testable Outcomes: PASS (spec with user stories, acceptance, success criteria exists)
- Simplicity and User Value: PASS (UI-only, no new dependencies, incremental)
- Data Privacy and Auditability: PASS (no new data exposure; avoids logging sensitive info)
- Incremental Delivery with Independent Slices: PASS (stories P1–P3 are independently testable)
- Change Control and Versioning: PASS (working in `base` branch; artifacts versioned under specs/)

Re-check after Phase 1: PASS (no added complexity beyond plan; still UI-only)

## Project Structure

### Documentation (this feature)

```text
specs/base/
  plan.md          # This file (/speckit.plan output)
  research.md      # Phase 0 output
  data-model.md    # Phase 1 output
  quickstart.md    # Phase 1 output
  contracts/       # Phase 1 output (no new APIs; README only)
```

### Source Code (repository root)

```text
frontend/
  src/
    pages/
      ConfirmEditPage.tsx        # Integrate image pane next to results
    components/
      ImagePreview.tsx           # Reuse/extend for zoom, pan, reset, paging
    store/
      sessionStore.ts            # Persist per-session pane visibility
      ocrResultStore.ts          # Provides OCR results and image refs

backend/
  # No changes required for this feature
```

**Structure Decision**: Web app; frontend-only changes localized to `ConfirmEditPage` and `ImagePreview` with state in existing stores. No new packages, endpoints, or projects.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

