# Data Model: Export OCR Results

## Entities

### OcrResultRow
- id: string
- fields: Map<string, string | number | null | Date>
- displayOrder: number (for sorted export)

### ColumnDef
- key: string (data field key)
- label: string (localized header)
- visible: boolean
- order: number

### ExportOptions
- format: 'csv' | 'xlsx'
- scope: 'filtered' | 'selected'
- encoding: 'utf-8' | 'shift_jis' (CSV only)
- filenameBase: string (dataset/context name)

### ExportRequest
- options: ExportOptions
- columns: ColumnDef[] (only visible columns in order)
- rows: OcrResultRow[] (filtered or selected)
- requestedAt: ISO timestamp (YYYY-MM-DDTHH:mm:ssZ)
- requestedBy: string (user id)

## Validation Rules
- Visible columns only; order preserved (FR-003)
- Row order equals UI sort (FR-005)
- Row count must be ≤ 50,000 (FR-009)
- If scope = selected and none selected, prompt to export all filtered (User Story 2)
- CSV escaping: RFC 4180-compatible quoting and CRLF endings (FR-006)
- Encoding: UTF-8 default, Shift_JIS optional (FR-011)

