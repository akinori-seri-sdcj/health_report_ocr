import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/error-handler'
import healthReportRoutes from './routes/health-report.routes'
import auditRoutes from './routes/audit.routes'
import { healthCheck } from './controllers/health-report.controller'

// 環境変数の読み込み
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

// ミドルウェアの設定
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || 'https://localhost')
    : '*', // 開発環境では全てのオリジンを許可
  credentials: process.env.NODE_ENV === 'production'
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ヘルスチェックエンドポイント
app.get('/health', healthCheck)

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: '健康診断結果OCR API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      api: '/process-health-report'
    }
  })
})

// APIルート
app.use('/process-health-report', healthReportRoutes)
app.use('/audit', auditRoutes)

// エラーハンドリング
app.use(errorHandler)

// サーバー起動
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`)
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  const corsOrigin = process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || 'https://localhost')
    : '*'
  logger.info(`🔗 CORS origin: ${corsOrigin}`)
})

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  process.exit(0)
})
