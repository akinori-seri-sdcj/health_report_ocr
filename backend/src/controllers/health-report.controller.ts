import { Request, Response, NextFunction } from 'express'
import { extractHealthReportData, checkLLMHealth } from '../services/llm.service'
import { logger } from '../utils/logger'

/**
 * 健康診断結果処理のコントローラー
 */
export const processHealthReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ファイルの取得
    const files = req.files as Express.Multer.File[]

    // バリデーション
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: '画像ファイルが送信されていません',
          code: 'NO_FILES_UPLOADED',
        },
      })
    }

    logger.info(`健康診断結果処理開始: ${files.length}枚の画像を受信`)

    // ファイル情報のログ
    files.forEach((file, index) => {
      logger.info(
        `画像 ${index + 1}: ${file.originalname}, サイズ: ${(file.size / 1024).toFixed(2)}KB, タイプ: ${file.mimetype}`
      )
    })

    // LLMサービスでデータ抽出
    const result = await extractHealthReportData(files)

    logger.info('健康診断結果処理完了')

    // 成功レスポンス
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    // エラーを次のミドルウェア（エラーハンドラー）に渡す
    next(error)
  }
}

/**
 * APIのヘルスチェック（拡張版）
 */
export const healthCheck = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // ヘルスチェックはなるべく成功させ、詳細はpayloadに反映
  let llmHealthy = false
  try {
    llmHealthy = await checkLLMHealth()
  } catch {
    llmHealthy = false
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      llm: llmHealthy ? 'healthy' : 'unhealthy',
    },
  })
}
