import { Request, Response, NextFunction } from 'express'
import { extractHealthReportData } from '../services/llm.service'
import { createOcrService } from '../services/ocr.service'
import { logger } from '../utils/logger'
import { loadOcrConfig } from '../config/ocrConfig'
import { recordOcrRequest } from '../utils/ocrMetrics'
import type { ApiError } from '../middleware/error-handler'

const ocrService = createOcrService()

const MAX_FILES_PER_REQUEST = 10

/**
 * POST /api/ocr
 * 健康診断レポートの画像/PDFを受け取り、OCR を実行する
 *
 * レスポンスは MVP として同期的に結果まで返す。
 * 将来的に非同期化する場合も requestId は維持できる形にしておく。
 */
export const createOcrRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now()

  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: {
          message: 'OCR対象のファイルが送信されていません',
          code: 'NO_FILES_UPLOADED',
        },
      })
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return res.status(400).json({
        error: {
          message: `一度にアップロードできるファイルは最大 ${MAX_FILES_PER_REQUEST} 件までです`,
          code: 'TOO_MANY_FILES',
        },
      })
    }

    const { requestTimeoutMs } = loadOcrConfig()

    // 認証は別レイヤーなので、ここでは unknown として扱う
    const requestedBy = 'unknown'

    const request = await ocrService.createRequest(files, requestedBy)

    // 既存の LLM ベースの OCR 実装を再利用しつつ、タイムアウトを設ける
    const ocrPromise = extractHealthReportData(files)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const timeoutError: ApiError = new Error('OCR処理がタイムアウトしました')
        timeoutError.statusCode = 504
        reject(timeoutError)
      }, requestTimeoutMs)
    })

    const ocrData = await Promise.race([ocrPromise, timeoutPromise])

    logger.info('OCR processing completed for request', {
      requestId: request.id,
    })

    recordOcrRequest(Date.now() - start, true)

    return res.json({
      requestId: request.id,
      status: 'completed',
      result: ocrData,
    })
  } catch (error) {
    recordOcrRequest(Date.now() - start, false)
    next(error)
  }
}

