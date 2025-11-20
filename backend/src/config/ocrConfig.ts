export interface OcrConfig {
  serviceEndpoint: string
  apiKey?: string
  requestTimeoutMs: number
}

export const loadOcrConfig = (): OcrConfig => {
  const serviceEndpoint = process.env.OCR_SERVICE_ENDPOINT
  const requestTimeoutRaw = process.env.OCR_REQUEST_TIMEOUT_MS

  if (!serviceEndpoint) {
    throw new Error('OCR_SERVICE_ENDPOINT is not configured')
  }

  const requestTimeoutMs = requestTimeoutRaw
    ? Number(requestTimeoutRaw)
    : 30_000

  return {
    serviceEndpoint,
    apiKey: process.env.OCR_SERVICE_API_KEY,
    requestTimeoutMs: Number.isFinite(requestTimeoutMs) ? requestTimeoutMs : 30_000,
  }
}

