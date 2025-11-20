# Phase 1: Data Model - OCR処理デプロイアーキテクチャの改善

This document captures the key entities and validation rules derived from
`specs/001-ocr-deploy-architecture/spec.md` for the OCR deployment feature.

---

## Entity: OCR依頼（OCRRequest）

Represents a single request to run OCR on a health report file.

### Fields

- `id` (string)  
  - Unique identifier for the OCR request.
- `requestedAt` (datetime)  
  - Timestamp when the request was accepted by the backend.
- `requestedBy` (string/user-id)  
  - Identifier of the user (e.g., staff member) who submitted the request.
- `status` (enum)  
  - One of: `queued`, `processing`, `completed`, `error`.
- `inputFiles` (array of FileRef)  
  - References to uploaded files (image/PDF); for this feature, typically 1 health report per request.
- `errorCode` (string, optional)  
  - Machine-readable error code when `status = error`.
- `errorMessage` (string, optional)  
  - User-facing, non-sensitive description of what went wrong.

### Validation Rules

- At least one `inputFiles` entry MUST be provided.
- `status` MUST be consistent with presence/absence of `errorCode` and `errorMessage`
  - If `status = error`, `errorCode` SHOULD be set.
- User-visible error messages MUST NOT include personal health information.

---

## Entity: OCR結果（OCRResult）

Represents the processed OCR output for a given request.

### Fields

- `id` (string)  
  - Unique identifier for the result.
- `requestId` (string)  
  - Foreign key reference to `OCRRequest.id`.
- `extractedText` (string or text blob)  
  - Raw text extracted from the health report.
- `structuredFields` (object)  
  - Parsed fields mapped into the domain model (e.g., measurement values, judgement codes).
- `createdAt` (datetime)  
  - Timestamp when the OCR result was generated.

### Validation Rules

- `requestId` MUST refer to an existing `OCRRequest`.
- `structuredFields` MAY be partially filled; UI should still be able to display and allow manual review.

---

## Entity: 健康診断レポート（HealthReport）

Represents the business-level health report object that clinicians or staff reason about.

### Fields

- `id` (string)  
  - Unique identifier for the health report.
- `subjectId` (string)  
  - Identifier for the person the report belongs to (domain-specific; may be anonymized ID).
- `examDate` (date)  
  - Date of the health examination.
- `ocrRequestId` (string, optional)  
  - Reference to the OCR request used to populate this report.
- `ocrResultId` (string, optional)  
  - Reference to the OCR result that produced current values.

### Validation Rules

- A HealthReport MAY exist without OCR (manual entry), but when OCR is used, `ocrRequestId` and `ocrResultId` SHOULD be present.
- Relationships between HealthReport and OCR entities SHOULD allow traceability from exported data back to original inputs.

