import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  extractHealthReportDataFromBase64,
  type OcrImageInput,
} from '../shared/ocr/extractHealthReportData'

interface ProcessHealthReportRequestBody {
  images: OcrImageInput[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const body = req.body as ProcessHealthReportRequestBody | undefined

    if (!body || !Array.isArray(body.images) || body.images.length === 0) {
      return res.status(400).json({
        error: {
          message: 'OCR対象の画像が送信されていません',
          code: 'NO_IMAGES',
        },
      })
    }

    const result = await extractHealthReportDataFromBase64(body.images)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    // 個人情報は含めず技術的情報のみログに出す
    console.error('[api/process-health-report] OCR error:', {
      message: err instanceof Error ? err.message : String(err),
    })

    const message =
      err instanceof Error ? err.message : 'OCR処理中にエラーが発生しました'

    return res.status(500).json({
      error: {
        message,
        code: 'OCR_INTERNAL_ERROR',
      },
    })
  }
}

