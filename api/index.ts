import { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from '../backend/src/middleware/error-handler';
import healthReportRoutes from '../backend/src/routes/health-report.routes';
import auditRoutes from '../backend/src/routes/audit.routes';
import { healthCheck } from '../backend/src/controllers/health-report.controller';

// Expressアプリの初期化（既存のバックエンドロジックを再利用）
const app = express();

// ミドルウェアの設定
app.use(helmet({
  contentSecurityPolicy: false, // Vercel環境用に緩和
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: process.env.CORS_ORIGIN ? true : false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルーティング（/api プレフィックス付き）
app.get('/api/health', healthCheck);
app.get('/api', (req, res) => {
  res.json({
    message: '健康診断結果OCR API',
    version: '0.1.0',
    endpoints: {
      health: '/api/health',
      processHealthReport: '/api/process-health-report',
      audit: '/api/audit/exports',
    },
  });
});
app.use('/api/process-health-report', healthReportRoutes);
app.use('/api/audit', auditRoutes);

// エラーハンドリング
app.use(errorHandler);

// Vercelサーバレス関数としてエクスポート
export default async (req: VercelRequest, res: VercelResponse) => {
  // ExpressアプリをVercelリクエストハンドラーとして実行
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
};
