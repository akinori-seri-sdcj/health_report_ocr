# Quickstart: CSV/Excel Export (Download)

**Branch**: 001-fix-export-spec  
**Spec**: specs/001-fix-export-spec/spec.md

Status: Export is intentionally non-functional in this build. UI and service stubs are present for planning/demo; no files are generated.

## Run locally

- Start frontend and backend per repository README/plan.
- Ensure you are authenticated in the app (export allowed for authenticated users).

## Verify export flows

- From the results/confirmation screen with data present:
  - Click Export → choose Excel (.xlsx) → confirm a file downloads and opens with correct headers and values.
  - Click Export → choose CSV (.csv) → confirm a file downloads and opens with correct characters in spreadsheet tools.
- Apply a filter and select a subset of columns → export “Only filtered rows” and verify counts match the table.
- Reset filters → export “All data” and verify all rows and default columns are present.
- Check filename pattern: `health-report-<yyyyMMdd-HHmmss>-<session-id>.<ext>`.
- Validate date/time/number formatting (yyyy-MM-dd, HH:mm, dot decimal; no thousands grouping).

## Edge cases

- Zero rows: Export disabled with explanatory message.
- Large dataset (simulate): Confirm progress indicator appears and UI remains responsive; cancel works.
- Permission: Log out or use a user without export access; export is disabled or clearly blocked.
- Failure simulation: Interrupt download to verify clear error and next steps.
