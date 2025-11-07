import { Request, Response } from 'express'
import { logger } from '../utils/logger'

export async function recordExportEvent(req: Request, res: Response) {
  // Placeholder endpoint; not implemented
  logger.info('[audit] export event received (placeholder): %j', req.body)
  return res.status(501).json({ message: 'Audit export endpoint not implemented' })
}

