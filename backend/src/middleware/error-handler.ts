import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface ApiError extends Error {
  statusCode?: number
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  logger.error(`Error: ${message}`, {
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    // NOTE: 個人情報が含まれない技術的メタデータのみをログに出力する
  })

  // Standardize error payload shape for frontend consumption
  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  })
}
