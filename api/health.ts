import { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import { checkLLMHealth } from './backend-src/services/llm.service';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  let llmHealthy = false;
  try {
    llmHealthy = await checkLLMHealth();
  } catch {
    llmHealthy = false;
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: { llm: llmHealthy ? 'healthy' : 'unhealthy' },
    envPresence: {
      OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
      CORS_ORIGIN: Boolean(process.env.CORS_ORIGIN),
    },
  });
}

