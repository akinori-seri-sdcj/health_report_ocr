import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const hasKey = Boolean(process.env.OPENAI_API_KEY)
  const mockMode = process.env.MOCK_OCR === '1'
  const timeoutMs = process.env.OCR_TIMEOUT_MS

  const status = hasKey || mockMode ? 'ok' : 'degraded'
  const messages: string[] = []
  if (!hasKey && !mockMode) {
    messages.push('OPENAI_API_KEY が未設定です')
  }
  if (timeoutMs) {
    messages.push(`OCR_TIMEOUT_MS=${timeoutMs}`)
  }
  if (mockMode) {
    messages.push('MOCK_OCR=1 (モック応答有効)')
  }

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      openai: hasKey || mockMode ? 'configured' : 'missing-api-key',
    },
    mock: mockMode ? 'enabled' : 'disabled',
    detail: messages.join(' / ') || undefined,
  })
}
