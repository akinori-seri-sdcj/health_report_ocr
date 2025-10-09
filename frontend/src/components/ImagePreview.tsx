import { useEffect, useState } from 'react'
import { CapturedImage } from '../db'

export interface ImagePreviewProps {
  image: CapturedImage
  onDelete: (imageId: number) => void
  onMoveUp?: (imageId: number) => void
  onMoveDown?: (imageId: number) => void
  showControls?: boolean
}

/**
 * 撮影した画像のサムネイルプレビュー
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onDelete,
  onMoveUp,
  onMoveDown,
  showControls = true,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('')

  // BlobをURLに変換
  useEffect(() => {
    const url = URL.createObjectURL(image.imageData)
    setImageUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [image.imageData])

  const handleDelete = () => {
    if (image.id && confirm('この画像を削除しますか？')) {
      onDelete(image.id)
    }
  }

  const handleMoveUp = () => {
    if (image.id && onMoveUp) {
      onMoveUp(image.id)
    }
  }

  const handleMoveDown = () => {
    if (image.id && onMoveDown) {
      onMoveDown(image.id)
    }
  }

  return (
    <div className="relative group">
      {/* サムネイル画像 */}
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={`撮影画像 ${image.order + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 順序番号 */}
      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
        {image.order + 1}
      </div>

      {/* 操作ボタン（ホバー時に表示） */}
      {showControls && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {/* 上に移動 */}
          {onMoveUp && (
            <button
              onClick={handleMoveUp}
              className="bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white transition"
              title="上に移動"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {/* 下に移動 */}
          {onMoveDown && (
            <button
              onClick={handleMoveDown}
              className="bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white transition"
              title="下に移動"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {/* 削除 */}
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
            title="削除"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
