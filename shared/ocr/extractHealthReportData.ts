import type { HealthReportData } from '../../backend/src/types/health-report.schema'
import { extractHealthReportData } from '../../backend/src/services/llm.service'

export interface OcrImageInput {
  filename: string
  mimeType: string
  dataBase64: string
}

export type HealthReportOCRResult = HealthReportData

/**
 * Vercel Serverless Functions 向けのアダプタ。
 *
 * - ブラウザから送られてきた base64 エンコード画像を
 *   backend の extractHealthReportData でそのまま利用できる形に変換する。
 */
export async function extractHealthReportDataFromBase64(
  images: OcrImageInput[]
): Promise<HealthReportOCRResult> {
  // Express.Multer.File と同等の shape を持つオブジェクトに変換する
  const files = images.map((img): Express.Multer.File => {
    const buffer = Buffer.from(img.dataBase64, 'base64')

    return {
      fieldname: 'images',
      originalname: img.filename,
      encoding: '7bit',
      mimetype: img.mimeType,
      size: buffer.byteLength,
      destination: '',
      filename: img.filename,
      path: '',
      buffer,
      stream: undefined as any,
    }
  })

  return extractHealthReportData(files)
}

