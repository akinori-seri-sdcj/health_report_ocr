# Research: Show Source Image Next to OCR Results

## Decisions and Rationale

### 1) Small-screen behavior
- Decision: Stacked vertical views (image above/below results)
- Rationale: Simplest, predictable interaction on mobile; avoids hidden gestures; consistent with web scroll norms.
- Alternatives considered:
  - Tabbed toggle: Clear but adds mode switches and extra taps.
  - Horizontal swipe/tabs: Faster switching but discoverability and gesture conflicts.

### 2) Multi-page documents
- Decision: Simple page selector (e.g., Prev/Next and page number)
- Rationale: Covers multi-page scans with minimal UI; low complexity.
- Alternatives considered:
  - First page only: Too limiting; risks missing relevant content.
  - Thumbnail strip: Rich, but higher complexity and space cost.

### 3) Default image source
- Decision: Original upload
- Rationale: Maximizes legibility at higher zoom; avoids mismatches vs OCR source.
- Alternatives considered:
  - Optimized preview: Faster initial load but can degrade readability.
  - Adaptive (preview → original on demand): More complex; premature optimization for this scope.

### 4) Zoom and pan implementation
- Decision: Use CSS transforms (scale/translate) with a scrollable or draggable viewport; fit-to-pane initial state.
- Rationale: No new dependencies; performant enough for images with GPU-accelerated transforms.
- Alternatives considered:
  - Canvas-based viewer: Overkill for static images.
  - Third-party viewer library: Adds dependency/footprint without clear need.

### 5) Accessibility approach
- Decision: Keyboard-operable controls (zoom in/out, reset, next/prev page), focus-visible styles, ARIA labels; meaningful alt text.
- Rationale: Meets accessibility goals without complexity; aligns with constitution.
- Alternatives considered:
  - Gesture-only controls: Excludes keyboard users.

### 6) Performance measures
- Decision: Lazy-load image with loading indicator; object-fit contain; cap initial render scale; avoid reflows on zoom by transforming a wrapper; debounced resize handling.
- Rationale: Keeps UI responsive and meets 1.5s first-visible goal on typical connections.
- Alternatives considered:
  - Preloading all pages: Higher bandwidth; unnecessary for most reviews.

## Clarifications Resolved
- Small-screen: Stacked views
- Multi-page: Simple page selector
- Source: Original upload

