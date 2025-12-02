import { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './backend-src/middleware/error-handler';
import healthReportRoutes from './backend-src/routes/health-report.routes';
import auditRoutes from './backend-src/routes/audit.routes';
import { healthCheck } from './backend-src/controllers/health-report.controller';

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

// ランタイム環境チェック（不足している環境変数があれば明示的に返す）
app.use('/api', (req, res, next) => {
  // /api/health は常に通し、詳細はハンドラ側で判定する
  if (req.path === '/health') return next();
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: {
        message:
          'Server configuration error: OPENAI_API_KEY is not set on the server. Configure Environment Variables in Vercel and redeploy.',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
  next();
});

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
      debugEnv: '/api/debug/env',
    },
  });
});
// 環境変数の有無をブール値で返す（値は出さない）
app.get('/api/debug/env', (_req, res) => {
  res.json({
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    NODE_ENV: process.env.NODE_ENV || null,
    CORS_ORIGIN: Boolean(process.env.CORS_ORIGIN),
  });
});
app.use('/api/process-health-report', healthReportRoutes);
app.use('/api/audit', auditRoutes);

// エラーハンドリング（ローカル簡易版）。詳細なロガーはバックエンド側にも存在。
app.use(errorHandler as any);

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
