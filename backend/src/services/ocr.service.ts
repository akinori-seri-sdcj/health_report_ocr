import { logger } from '../utils/logger'
import type { OcrRequest, OcrResult, OcrStatus } from '../types/ocr'
import { loadOcrConfig } from '../config/ocrConfig'

export interface OcrService {
  createRequest(
    files: Express.Multer.File[],
    requestedBy: string
  ): Promise<OcrRequest>

  getResult(requestId: string): Promise<{ request: OcrRequest; result?: OcrResult }>
}

export const createOcrService = (): OcrService => {
  const config = loadOcrConfig()

  const toFileRef = (file: Express.Multer.File) => ({
    filename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  })

  const updateStatus = (request: OcrRequest, status: OcrStatus, error?: { code?: string; message?: string }) => {
    request.status = status
    if (error) {
      request.errorCode = error.code
      request.errorMessage = error.message
    }
  }

  return {
    async createRequest(files, requestedBy) {
      const id = `ocr_${Date.now().toString(36)}`
      const request: OcrRequest = {
        id,
        requestedAt: new Date(),
        requestedBy,
        status: 'queued',
        inputFiles: files.map(toFileRef),
      }

      logger.info('OCR request accepted', {
        requestId: request.id,
        fileCount: request.inputFiles.length,
        serviceEndpoint: config.serviceEndpoint,
      })

      // NOTE: 実際のOCR呼び出しは後続フェーズで実装する。

      return request
    },

    async getResult(requestId) {
      // NOTE: 現時点では永続化せず、インターフェースのみ定義する。
      logger.info('OCR result requested', { requestId })

      const dummyRequest: OcrRequest = {
        id: requestId,
        requestedAt: new Date(),
        requestedBy: 'unknown',
        status: 'processing',
        inputFiles: [],
      }

      return { request: dummyRequest, result: undefined }
    },
  }
}

