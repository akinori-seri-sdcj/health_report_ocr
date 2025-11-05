# Feature Specification: CSV/Excel Export (Download)

**Feature Branch**: `001-fix-export-spec`  
**Created**: 2025-11-04  
**Status**: Draft  
**Input**: User description: "Please fix the specification of csv/excel file download function referring spec.md and plan.md (the project should have Only plans/specs mention an export feature, not actual implementation)"

Assumptions: Export is initiated by a signed-in user from the results/confirmation screen after OCR and review, aligned with root `spec.md` and `plan.md` scope. Export produces a single downloadable file per action and does not require any backend changes beyond what is already planned.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Download reviewed data (Priority: P1)

A user who has reviewed OCR results wants to download the structured data as a file for record keeping and further analysis.

**Why this priority**: Enables immediate business value by allowing users to take data out of the app in a standardized format.

**Independent Test**: From the results screen, trigger an export and verify a file downloads with correct headers, values, and naming without using other features.

**Acceptance Scenarios**:

1. Given the user is on the results screen with at least one row of data, When the user selects “Export” and chooses “Excel (.xlsx)”, Then a file is downloaded with the expected name, headers, and values.
2. Given the same dataset, When the user selects “CSV (.csv)”, Then a CSV file is downloaded and opens in common spreadsheet tools with correct characters and delimiters.
3. Given there is no data to export, When the user opens the export action, Then the system disables export and shows a helpful message explaining there is nothing to export.
4. Given the user lacks export permission, When attempting export, Then the system prevents the action and shows a clear, non-technical explanation.

---

### User Story 2 - Export a subset (Priority: P2)

Users want to export only the currently visible subset (after applying on-screen filters and sorts) or a chosen set of columns to keep files concise.

**Why this priority**: Reduces noise and file size; improves downstream usability.

**Independent Test**: Apply a filter and column selection, then export; verify only filtered rows and selected columns appear, with counts matching the preview.

**Acceptance Scenarios**:

1. Given a filtered view, When exporting with “Only filtered rows”, Then the file contains exactly the rows shown in the table at export time.
2. Given column selection is available, When exporting with “Selected columns only”, Then only those columns appear and in the selected order.
3. Given a user resets filters, When exporting “All data”, Then the file contains all rows and standard columns in the defined default order.

---

### User Story 3 - Clear traceability and compliance (Priority: P3)

Users need predictable file naming and auditability to track exports for business or compliance review.

**Why this priority**: Supports governance without revealing implementation details.

**Independent Test**: Export a file and verify its name format and that an export event is recorded for the session/user in a non-invasive way.

**Acceptance Scenarios**:

1. Given an export occurs, When the download starts, Then the file name follows the agreed pattern: `health-report-<yyyyMMdd-HHmmss>-<session-id>.<ext>`.
2. Given an export completes, When reviewing recent actions, Then an “Export completed” event exists with timestamp, user, record count, and format.
3. Given an export is canceled or fails, When reviewing recent actions, Then an “Export canceled/failed” event exists with reason.

---

### Edge Cases

- Zero rows available to export; export action disabled with explanatory message.
- Very large datasets (e.g., >10k rows); show progress feedback and prevent UI freeze; allow cancel.
- Special characters (Unicode, emojis), newlines within fields, and commas/quotes; ensure correct escaping.
- Date/time and number formats; maintain consistent, human-readable formatting across formats.
- Column names containing separators or duplicates; normalize to unique headers.
- User navigates away during export; download either completes or is safely canceled.
- Insufficient storage space or blocked downloads; present actionable guidance.

## Requirements *(mandatory)*

### Functional Requirements

- FR-001: Provide an “Export” action from the results screen when at least one row exists.
- FR-002: Allow users to choose output format: Excel (.xlsx) and CSV (.csv); default to Excel.
- FR-003: When filters are active, allow exporting either “All data” or “Only filtered rows”. The default is “Only filtered rows”.
- FR-004: Allow optional column selection and ordering prior to export. If not changed, use the standard column set and default order.
- FR-005: Ensure exported files include a single header row with clearly labeled, unique column names consistent with the results table.
- FR-006: Preserve visible data formatting for dates and numbers so values are human-readable and consistent across formats. Use dates as yyyy-MM-dd, times as HH:mm, and a dot (.) as the decimal separator with no thousands grouping.
- FR-007: Ensure character encoding renders correctly in common spreadsheet tools and does not corrupt characters. Default CSV encoding is Shift_JIS.
- FR-008: File naming MUST follow: `health-report-<yyyyMMdd-HHmmss>-<session-id>.<ext>` where `<ext>` is `xlsx` or `csv` and `<session-id>` is a short, non-PII identifier visible to the user.
- FR-009: Indicate progress for large exports and allow the user to cancel before completion without partial files being kept.
- FR-010: On success, start a browser/system download and show a confirmation message with record count and format.
- FR-011: On failure, show a clear message with next steps (retry, reduce size, contact support) without technical jargon.
- FR-012: Respect user permissions; all authenticated users are allowed to export. Unauthenticated users cannot access or trigger export.
- FR-013: Exports MUST reflect the current view’s sort order when “Only filtered rows” is selected; otherwise use a predictable default order.
- FR-014: Maximum export size is communicated before starting export; if exceeded, present options to narrow scope.
- FR-015: Record an export event containing timestamp, user, record count, and format for traceability (no sensitive data logged).

### Key Entities *(include if feature involves data)*

- Export Request: A user-initiated action to produce a downloadable file; attributes include requested format, scope (all vs filtered), selected columns, row count estimate, timestamp.
- Dataset Row: A structured record from OCR and review; attributes include domain fields appearing as columns in export.
- User Session: The current authenticated context; non-PII session identifier used in file naming and traceability.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- SC-001: 95% of exports ≤ 5,000 rows complete and begin download within 5 seconds from user confirmation.
- SC-002: 99% of exported files open in mainstream spreadsheet tools without character corruption or header misalignment.
- SC-003: 0% data loss across columns/rows compared to the chosen scope as verified by automated count and header checks.
- SC-004: 90% of users report that exported files are “easy to use” in monthly feedback for the first release window.
- SC-005: All export events include timestamp, user, record count, and format, and are retrievable for the past 30 days.
