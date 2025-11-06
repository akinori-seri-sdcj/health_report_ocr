# Feature Specification: Show Source Image Next to OCR Results

**Feature Branch**: `003-ocr-image-side-by-side`  
**Created**: 2025-11-06  
**Status**: Draft  
**Input**: User description: "OCR結果表示画面（`確認・編集`画面）にてOCR結果の横に読み取り元画像を表示するよう修正"

Assumptions: The Confirm/Edit screen already exists and displays OCR results. The system retains a reference to the original scanned or captured image that produced the OCR results. No change to OCR processing is required; this is a UI/UX enhancement to aid review accuracy.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review with visual reference (Priority: P1)

A reviewer on the Confirm/Edit screen needs to see the original source image alongside OCR results to verify and correct fields efficiently.

**Why this priority**: Side-by-side context reduces errors and speeds up validation—the core task of the screen.

**Independent Test**: Open the Confirm/Edit screen for a record that has an associated image; verify the image appears adjacent to results without obstructing fields and remains visible during editing.

**Acceptance Scenarios**:

1. Given a record with OCR results and a linked source image, When the Confirm/Edit screen loads, Then the source image is displayed adjacent to the OCR results and both are simultaneously visible on desktop widths (≥1024px).
2. Given the screen is resized or viewed on narrow displays, When the width becomes constrained, Then the layout adapts to allow access to both views without overlap and without hiding required controls [see mobile layout clarification].
3. Given the image fails to load, When the error occurs, Then a non-technical error state appears with a retry action and guidance without blocking access to results.

---

### User Story 2 - Inspect hard-to-read areas (Priority: P2)

As a reviewer, I need to zoom and pan the image to read small or faint text so I can accurately confirm fields.

**Why this priority**: Critical for accuracy when images are dense or low-contrast; reduces misreads.

**Independent Test**: Use provided controls to zoom in to at least 200% and pan around; confirm text legibility improves; reset returns to fit-to-pane view.

**Acceptance Scenarios**:

1. Given the image is visible, When I press zoom in/out controls, Then the image scales between at least 50% and 200% and remains crisp up to its native resolution.
2. Given the image is zoomed beyond fit, When I drag or use keyboard navigation, Then the viewport pans within image bounds without exposing blank background.
3. Given I select reset view, When applied, Then the image returns to a fit-to-pane state.

---

### User Story 3 - Focus workspace as needed (Priority: P3)

As a reviewer, I want to temporarily hide/show the image pane to maximize space for the table or form when needed.

**Why this priority**: Improves productivity for data-heavy corrections by letting users focus.

**Independent Test**: Toggle visibility and confirm the state persists while reviewing the current record/session.

**Acceptance Scenarios**:

1. Given both panes are visible, When I toggle "Hide image", Then the image pane collapses and the results area expands.
2. Given the image pane is hidden, When I toggle "Show image", Then the pane restores in its previous position and zoom level.
3. Given I navigate within the same review session, When I return to the screen, Then my visibility preference is preserved for that session.

### Edge Cases

- Very large images (e.g., multi-megapixel) load progressively; UI remains responsive with visible progress/loader.
- Multi-page source documents (e.g., PDFs or multi-page scans) require page selection [see multi-page clarification].
- Images requiring rotation (portrait/landscape) respect natural orientation; user sees upright image.
- Missing or inaccessible image reference displays a helpful placeholder and allows editing to continue.
- Extremely narrow screens: ensure users can access both image and results without controls overlapping critical fields.
- Low bandwidth: loader and retry messaging guide users without technical jargon.

## Requirements *(mandatory)*

### Functional Requirements

- FR-001: The Confirm/Edit screen MUST display the source image adjacent to OCR results on desktop widths (≥1024px) so both are simultaneously visible without horizontal scrolling of the overall page.
- FR-002: On narrow screens, the layout MUST adapt so users can access both the image and results without overlap; default behavior is stacked vertical views (one above the other) with standard vertical scrolling.
- FR-003: Users MUST be able to zoom the image between at least 50% and 200% and reset to a fit-to-pane view.
- FR-004: When zoomed beyond fit, users MUST be able to pan within image bounds using pointer and keyboard.
- FR-005: Initial image display MUST fit the image to the available pane without cropping.
- FR-006: While loading, the UI MUST show a non-blocking loader/skeleton; on failure, show a retry control and a user-friendly message.
- FR-007: If the source is multi-page, the UI MUST provide a way to view other pages or clearly state the limitation; default behavior is to include a simple page selector.
- FR-008: Users MUST be able to hide/show the image pane; default is visible; the choice MUST persist during the current review session.
- FR-009: Accessibility: all controls MUST be operable via keyboard and labeled for assistive tech; the image MUST include meaningful alternative text.
- FR-010: Performance: on a typical connection and a 2MB image, the first visible image MUST appear within 1.5 seconds in at least 95% of attempts; the UI remains responsive during load.
- FR-011: Security/Privacy: the image MUST only be visible to authorized users viewing the corresponding record; images MUST NOT be included in data exports from the results screen.
- FR-012: The feature MUST NOT alter OCR data, field validations, or save behavior; it is a display and navigation enhancement only.
- FR-013: The image shown SHOULD match the source used for OCR to ensure visual parity; default source is the original upload.

### Key Entities *(include if feature involves data)*

- Source Image: The visual input that produced OCR; attributes include record reference, page count, dimensions, and a user-friendly name.
- OCR Result: Structured fields derived from the source image; attributes include record ID and review status.
- Review Session: The user’s active context on Confirm/Edit; attributes include layout/visibility preferences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- SC-001: On desktop widths (≥1024px), at least 95% of records render both image and results simultaneously without horizontal page scrolling.
- SC-002: 95% of first image renders start within 1.5 seconds for a 2MB image on a typical connection, measured from screen load to image visible.
- SC-003: In usability testing, median time to accurately verify one record decreases by ≥20% compared to the current design without side-by-side image.
- SC-004: Zero critical accessibility issues in audit; keyboard-only users can operate zoom, pan, reset, and visibility.
- SC-005: Image load error rate remains below 1% across sessions over a 7-day observation period.
- SC-006: 80%+ of surveyed reviewers agree the side-by-side image improves accuracy/confidence in validation tasks.
