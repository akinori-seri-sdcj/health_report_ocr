# Feature Specification: Export OCR Results (CSV/Excel)

**Feature Branch**: `001-export-ocr-results`  
**Created**: 2025-11-05  
**Status**: Draft  
**Input**: User description: "Please implement csv/excel file export function of the ocr result by gpt-api, referring to the specification file:`///C:/Users/aseri/Desktop/health_report_ocr/plan.md`."

## Clarifications

### Session 2025-11-05

- Q: Should we reuse the existing bottom-right Export button or add a new one in the same place? → A: Reuse the existing button; open an options modal/sheet.

### Session 2025-11-05 (Later)

- Q: How should export authorization behave for local development/testing? → A: Default allow in development builds (no role required); production remains restricted to Admin/Data Exporter.

### Session 2025-11-05 (Policy Update)

- Q: Should export be restricted to specific roles in production? → A: No. Any authenticated user who can access the application and view the dataset may export; export must still respect view permissions.

### Session 2025-11-05 (UI Entry Point)

- Q: Which button should trigger export? → A: Reuse the bottom “確定してExcel生成へ” button to open the export options modal (Excel/CSV, encoding). Remove the separate top-right “Export” button.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export filtered OCR results (Priority: P1)

As a user reviewing OCR results, I want to export the currently visible (filtered/sorted) results to a downloadable file so that I can share, analyze, or archive the data outside the application.

**Why this priority**: Enables immediate business value by allowing data reuse in external tools; aligns with reporting workflows.

**Independent Test**: Apply filters on the results table and export; verify the downloaded file contains only rows/columns matching what is visible with correct order and headers.

**Acceptance Scenarios**:

1. Given OCR results are displayed with an active filter, When the user selects "Export" and chooses "CSV", Then the downloaded CSV contains only the filtered rows with visible columns in current order and localized headers.
2. Given OCR results are displayed and sorted by a column, When the user exports to "Excel", Then the downloaded Excel file preserves the sorted order and column headers.
3. Given there are zero rows after filtering, When the user exports, Then the system downloads a file with headers only and no data rows.
4. Given the user clicks the existing bottom-right Export button, When an export options modal opens and the user selects format (CSV/Excel), scope (filtered/selected), and encoding (UTF-8/Shift_JIS), Then the system downloads the file using those options.

---

### User Story 2 - Export selected rows (Priority: P2)

As a user, I want to export only the rows I have explicitly selected so that I can share a curated subset of the results.

**Why this priority**: Reduces manual cleanup work and prevents sharing unnecessary data.

**Independent Test**: Select a subset of rows and export; verify only selected rows are included regardless of other non-selected filtered rows.

**Acceptance Scenarios**:

1. Given multiple rows are selected, When the user exports, Then only the selected rows are included in the file.
2. Given no rows are selected, When the user exports with "Selected only" option, Then the system shows a clear message and offers to export "All filtered" instead.

---

### User Story 3 - File naming and metadata (Priority: P3)

As a user, I want exported files to have meaningful names and basic metadata so that files are easily identified later.

**Why this priority**: Improves organization and reduces confusion when handling multiple exports.

**Independent Test**: Trigger exports and verify filenames contain dataset name, export type, and timestamp; metadata such as sheet name and header row are present.

**Acceptance Scenarios**:

1. Given a dataset named "HealthReport", When exporting to CSV at 2025-11-05 13:45, Then the filename follows "HealthReport_Export_20251105-1345.csv" and similarly for ".xlsx".
2. Given an Excel export, When opened, Then the first row contains column headers and the sheet is named "Export" (or dataset name if provided).

---

### Edge Cases

- Large dataset exports near the maximum allowed row count.
- Cells containing commas, newlines, quotes, or tabs that require proper escaping.
- Non-ASCII characters (e.g., Japanese names) must render correctly in common spreadsheet software.
- Empty fields, nulls, or very long text fields.
- Attempt to export while offline or during a transient network error.
- Concurrency: user triggers multiple exports in quick succession.
- Permission-restricted users attempting to export sensitive data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to export OCR results to CSV.
- **FR-002**: Users MUST be able to export OCR results to Excel (.xlsx).
- **FR-003**: Exports MUST include only visible columns in the current on-screen order with localized header labels.
- **FR-004**: When row selection is active and the user chooses "Selected only", the export MUST include only selected rows; otherwise export MUST include all rows matching current filters.
- **FR-005**: Sorting applied in the UI MUST be reflected in the export row order.
- **FR-006**: CSV fields MUST be properly escaped (commas, quotes, newlines) to ensure correct parsing in spreadsheet applications.
- **FR-007**: The system MUST generate filenames including dataset/context name (if available), export type, and timestamp (YYYYMMDD-HHmm).
- **FR-008**: When there are zero rows, the export MUST produce a file with headers only and no data rows.
- **FR-009**: Exports are hard-capped at 50,000 rows; if current scope exceeds the cap, the system MUST show a clear message and require the user to reduce scope (filters or selected-only). No truncation is performed.
- **FR-010**: Any authenticated user who can access the application and view the dataset MAY export; the system MUST respect existing view permissions, and export MUST include only data the user can view. Role-based restrictions for export are removed in production and development builds alike.
- **FR-011**: Default CSV encoding is UTF-8; the export flow MUST offer an option to download in Shift_JIS for environments that require it.
- **FR-013**: The existing bottom-right Export button MUST be reused; clicking it MUST open an options modal/sheet where users choose format (CSV/Excel), scope (filtered/selected), and encoding (UTF-8 or Shift_JIS).
  - Update: The bottom “確定してExcel生成へ” button is the single export entry. Remove any additional Export button. Clicking it opens the options modal with default Excel.
- **FR-012**: The export action MUST provide clear success/failure feedback and not block the UI; users MAY continue browsing while the file is generated for typical dataset sizes.

### Key Entities *(include if feature involves data)*

- **OCR Result**: Structured fields extracted from documents (e.g., patient name, date, facility, test items, values). Attributes: field key, display label, value (string/number/date), row ID.
- **Export Request**: User-initiated context for export. Attributes: format (CSV/Excel), scope (filtered/selected), column set (visible), sort order, timestamp, requested by (user id).

**Assumptions and Scope Notes**

- Export operates on the same dataset displayed in the results table (post-GPT OCR parsing); no additional transformation rules beyond formatting/escaping.
- Any user who can view a record can export it unless further restricted by role-based policy (see FR-010).
- Default column headers use the UI language currently active.
- Timezone for timestamps uses the user’s current app timezone setting.
- Out of scope: scheduled/recurring exports, server-side batch exports, and multi-sheet Excel beyond a single tab for the selected dataset.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users complete a standard export (≤ 5,000 rows, ≤ 20 columns) in under 10 seconds in 95% of attempts on a typical broadband connection.
- **SC-002**: 99% of exported files open in default spreadsheet software without character encoding issues or parsing errors (as validated by test matrices with representative data, including non-ASCII).
- **SC-003**: 0% data loss in exported fields compared to the on-screen dataset for included rows/columns (values match exactly aside from expected formatting/escaping).
- **SC-004**: At least 80% of target users report that export files are “clearly labeled and ready to use” in feedback sessions.
