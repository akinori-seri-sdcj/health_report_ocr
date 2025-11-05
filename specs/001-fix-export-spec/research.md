# Research: CSV/Excel Export (Download)

**Branch**: 001-fix-export-spec  
**Date**: 2025-11-04

## Topic 1: CSV Shift_JIS encoding in browsers

- Decision: Use `encoding-japanese` library client-side to encode UTF-16 JS strings to Shift_JIS bytes for CSV Blob
- Rationale: Browsers’ `TextEncoder` lacks Shift_JIS; requirement mandates Shift_JIS default; client-side preserves offline PWA flow
- Alternatives considered:
  - iconv-lite: Node-focused; adds server dependency; breaks offline-first
  - Backend transcoding: Requires API call and server work; adds latency and coupling
  - UTF-8 with BOM: Eases Excel detection but conflicts with decision Q2

## Topic 2: Large export responsiveness

- Decision: Chunk CSV row building (e.g., process 1k rows per microtask) and show progress; optionally move to Web Worker if jank observed > 100ms
- Rationale: Keeps UI responsive and meets “prevent UI freeze” edge case while avoiding premature worker complexity
- Alternatives considered:
  - Always use Web Worker: More setup and messaging overhead; only needed at larger scales
  - Single pass synchronous: Risks jank for large datasets

## Topic 3: CSV formatting (RFC 4180)

- Decision: Use comma delimiter, CRLF line endings, quote fields containing commas, quotes, CRLF; double-quote escaping inside fields
- Rationale: Maximizes compatibility with spreadsheet tools
- Alternatives considered:
  - LF-only line endings: Works for many tools but lower compatibility for some Windows setups
  - Semicolon delimiter: Locale-specific; not required here

## Topic 4: Excel formatting via exceljs

- Decision: Apply header row, date formatting `yyyy-MM-dd`, time `HH:mm`, dot decimal; no thousands grouping
- Rationale: Aligns with spec decisions (Q1) and preserves readability
- Alternatives considered:
  - Locale-driven formatting: Inconsistent across users/files
  - Thousands grouping: Can mislead downstream parsing

## Topic 5: File naming and session id

- Decision: `health-report-<yyyyMMdd-HHmmss>-<session-id>.<ext>`; `<session-id>` taken from non-PII session store short id
- Rationale: Traceable and consistent with spec; avoids sensitive data in filenames
- Alternatives considered:
  - Random UUID in filename only: Less human-friendly
  - Include user name: PII risk

## Topic 6: Export event logging

- Decision: Provide optional POST `/audit/exports` contract; frontend emits event and may call backend if available
- Rationale: Supports compliance without making backend a hard dependency
- Alternatives considered:
  - Mandatory server logging: Increases coupling; not required for MVP

## Outcome

All NEEDS CLARIFICATION items and technical unknowns are resolved. Proceed to Phase 1 design.

