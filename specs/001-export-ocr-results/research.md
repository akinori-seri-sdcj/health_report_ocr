# Research: Export OCR Results (CSV/Excel)

## Decisions

- Decision: Client-side export using existing table/store data
  - Rationale: Avoids backend changes; reduces latency; works offline when data is present in session
  - Alternatives considered: Server-side export service (rejected due to added complexity and no additional value for current scope)

- Decision: CSV default UTF-8, optional Shift_JIS
  - Rationale: UTF-8 maximizes compatibility; Shift_JIS supports JP legacy spreadsheets; aligns with spec FR-011
  - Alternatives: Always Shift_JIS (risks non-JP corruption); Always UTF-8 without option (less friendly for JP users)

- Decision: Excel single sheet with headers, sheet name "Export"
  - Rationale: Matches user expectations; simple and clear; aligns with spec
  - Alternatives: Multiple sheets (out of scope per spec)

- Decision: Hard cap 50,000 rows per export; block above cap
  - Rationale: Predictable performance; protects memory/time; aligns with FR-009
  - Alternatives: Truncate or auto-split (rejected to avoid silent loss and added UX complexity)

- Decision: Reuse existing bottom-right Export button; open options modal/sheet
  - Rationale: Prevents UI duplication; keeps user flow consistent; aligns with clarification
  - Alternatives: Add new buttons or split-button (adds clutter)

- Decision: Role restriction: Admin and Data Exporter only
  - Rationale: Minimizes data exfiltration risk; aligns with FR-010
  - Alternatives: Allow all viewers (too permissive); configurable per project (future enhancement)

## Best Practices Summary

- CSV escaping: Quote fields containing commas, quotes, or newlines; double embedded quotes; use CRLF line endings for widest spreadsheet compatibility.
- CSV encoding: Provide BOM when UTF-8 for legacy spreadsheet detection; Shift_JIS path should fall back to reasonable replacements for unmappable characters.
- Excel generation (exceljs): Append rows incrementally; avoid loading unnecessary objects; freeze header row; auto-fit columns by header length + sample data subset.
- Filenames: Include dataset/context, type, and timestamp `YYYYMMDD-HHmm`.
- UX: Non-blocking modal with primary action disabled until valid scope; show progress spinner during generation for large datasets.

