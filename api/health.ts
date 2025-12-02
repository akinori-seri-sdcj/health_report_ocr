import { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';

// Minimal, dependency-free health check so we can validate routing/runtime
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    envPresence: {
      OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
      CORS_ORIGIN: Boolean(process.env.CORS_ORIGIN),
    },
  });
}
