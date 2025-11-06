# Data Model: Show Source Image Next to OCR Results

## Entities

### SourceImage
- id: string (record reference)
- url: string (secured fetch path)
- pageCount: number (>=1)
- width: number (pixels, optional)
- height: number (pixels, optional)
- orientation: enum [portrait, landscape] (optional)
- name: string (display name, optional)

### OCRResult
- recordId: string (links to SourceImage.id)
- fields: map<string, string | number | boolean | null>
- reviewed: boolean
- updatedAt: datetime

### ReviewSession
- sessionId: string (non-PII identifier)
- imagePaneVisible: boolean (default true)
- imageZoom: number (0.5–2.0; default fit)
- imagePage: number (1..pageCount)

## Relationships
- SourceImage 1..1 ↔ 1..1 OCRResult (per record)
- ReviewSession 1..N records per user session

## Validation Rules
- SourceImage.pageCount ≥ 1
- ReviewSession.imagePage ≤ SourceImage.pageCount
- ReviewSession.imageZoom within allowed range; reset restores fit-to-pane

