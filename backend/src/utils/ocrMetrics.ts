let totalRequests = 0
let totalErrors = 0
let totalDurationMs = 0

export interface OcrMetricsSnapshot {
  totalRequests: number
  totalErrors: number
  avgDurationMs: number
  errorRate: number
}

export const recordOcrRequest = (durationMs: number, success: boolean) => {
  totalRequests += 1
  totalDurationMs += durationMs
  if (!success) totalErrors += 1
}

export const getOcrMetrics = (): OcrMetricsSnapshot => {
  const avgDurationMs = totalRequests > 0 ? totalDurationMs / totalRequests : 0
  const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0

  return {
    totalRequests,
    totalErrors,
    avgDurationMs,
    errorRate,
  }
}

