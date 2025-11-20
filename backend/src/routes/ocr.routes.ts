import { Router } from 'express'
import { upload } from '../middleware/upload'
import { createOcrRequest } from '../controllers/ocr.controller'

const router = Router()

router.post('/', upload.array('files', 10), createOcrRequest)

export default router

