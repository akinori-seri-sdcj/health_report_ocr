import { Router } from 'express'
import { recordExportEvent } from '../controllers/audit.controller'

const router = Router()

// POST /audit/exports - placeholder route; returns 501 Not Implemented
router.post('/exports', recordExportEvent)

export default router

