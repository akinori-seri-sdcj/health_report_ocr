import { Router } from 'express'
import { processHealthReport } from '../controllers/health-report.controller'
import { upload } from '../middleware/upload'

const router = Router()

/**
 * POST /process-health-report
 * 健康診断結果の画像をアップロードしてデータ抽出
 *
 * @body images - 健康診断結果の画像ファイル（複数可、最大10枚）
 * @returns HealthReportData - 抽出された健康診断結果
 */
router.post(
  '/',
  upload.array('images', 10), // 最大10枚の画像を受け付ける
  processHealthReport
)

export default router
