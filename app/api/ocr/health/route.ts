import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const hasKey = Boolean(process.env.OPENAI_API_KEY)
  const mockMode = process.env.MOCK_OCR === '1'

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      openai: hasKey || mockMode ? 'configured' : 'missing-api-key',
    },
    mock: mockMode ? 'enabled' : 'disabled',
  })
}
