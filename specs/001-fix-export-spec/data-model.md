# Data Model: CSV/Excel Export (Download)

**Branch**: 001-fix-export-spec  
**Date**: 2025-11-04

## Entities

- ExportRequest
  - id (ephemeral, client)
  - userId (authenticated user id; not exposed in filename)
  - sessionId (non-PII short id; used in filename)
  - format (xlsx | csv)
  - scope (all | filtered)
  - selectedColumns (ordered list of column keys)
  - rowCount (integer ≥ 0)
  - startedAt, completedAt (timestamps)
  - status (pending | in_progress | success | canceled | failed)
  - errorReason (optional)

- ExportEvent
  - id
  - timestamp
  - userId
  - sessionId
  - format (xlsx | csv)
  - scope (all | filtered)
  - recordCount
  - outcome (completed | canceled | failed)

- DatasetRow
  - domain fields extracted via OCR + review (e.g., name, date, value, notes)
  - all exported fields must map to visible columns

## Constraints & Validation

- Headers must be unique, human-readable, and match visible table labels
- Filename pattern: `health-report-<yyyyMMdd-HHmmss>-<session-id>.<ext>`
- CSV encoding default: Shift_JIS (per spec decision)
- Date format: yyyy-MM-dd; time HH:mm; decimal separator dot; no thousands grouping
- Maximum export size surfaced before start; if exceeded, require user to narrow scope
- “Only filtered rows” preserves current table sort order

## Relationships

- ExportRequest is created by a User within a Session and produces an ExportEvent on completion
- DatasetRow set is the source for export; selection filtered by current UI filters

