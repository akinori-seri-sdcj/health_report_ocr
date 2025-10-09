import multer from 'multer'
import { Request } from 'express'

// ファイルサイズの上限（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024

// アップロード可能な画像形式
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

// Multer設定
const storage = multer.memoryStorage()

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        `サポートされていないファイル形式です。許可される形式: ${ALLOWED_MIME_TYPES.join(', ')}`
      )
    )
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // 最大10ファイル
  },
  fileFilter,
})

// ファイルサイズのバリデーション用定数をエクスポート
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE,
  MAX_FILES: 10,
  ALLOWED_MIME_TYPES,
}
