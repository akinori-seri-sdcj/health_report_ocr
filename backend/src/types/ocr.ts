export type OcrStatus = 'queued' | 'processing' | 'completed' | 'error'

export interface OcrFileRef {
  filename: string
  mimeType: string
  size: number
}

export interface OcrRequest {
  id: string
  requestedAt: Date
  requestedBy: string
  status: OcrStatus
  inputFiles: OcrFileRef[]
  errorCode?: string
  errorMessage?: string
}

export interface OcrResult {
  id: string
  requestId: string
  extractedText: string
  structuredFields: Record<string, unknown>
  createdAt: Date
}

