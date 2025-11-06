# Quickstart: Show Source Image Next to OCR Results

## Implementation Steps

1) Wire image reference on Confirm/Edit
- Ensure `frontend/src/pages/ConfirmEditPage.tsx` retrieves SourceImage for the current record (url, pageCount).

2) Extend ImagePreview
- Reuse `frontend/src/components/ImagePreview.tsx` to support:
  - Fit-to-pane initial render (object-fit: contain)
  - Zoom controls (50–200%), pan when zoomed, reset
  - Simple page selector (Prev/Next, page indicator)
  - Loading and error UI with retry
  - Keyboard operability and ARIA labels

3) Layout
- Desktop (≥1024px): two-pane layout showing image and results side-by-side without page-level horizontal scroll.
- Small screens: stacked vertical views with standard vertical scroll.
- Add a hide/show Image pane toggle; persist visibility in `sessionStore`.

4) Performance & Privacy
- Lazy-load images; keep UI responsive while loading.
- Avoid logging sensitive content; mask paths in diagnostics if needed.

5) Verification
- Unit tests for ImagePreview behaviors (zoom, pan enablement, reset, paging).
- Manual E2E on desktop and mobile viewport widths.

