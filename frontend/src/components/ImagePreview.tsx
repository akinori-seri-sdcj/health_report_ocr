import { useEffect, useMemo, useRef, useState } from 'react'
import { CapturedImage } from '../db'

export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 2.0

export interface ImagePreviewProps {
  image: CapturedImage
  onDelete: (imageId: number) => void
  onMoveUp?: (imageId: number) => void
  onMoveDown?: (imageId: number) => void
  showControls?: boolean
  objectFit?: 'cover' | 'contain'
  // Viewer controls (zoom, pan, paging) for read-only preview
  viewerControls?: boolean
  pages?: CapturedImage[]
  pageIndex?: number
  onPageChange?: (index: number) => void
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onDelete,
  onMoveUp,
  onMoveDown,
  showControls = true,
  objectFit = 'cover',
  viewerControls = false,
  pages,
  pageIndex,
  onPageChange,
}) => {
  const activeImage: CapturedImage = useMemo(() => {
    if (viewerControls && pages && typeof pageIndex === 'number' && pages[pageIndex]) {
      return pages[pageIndex]
    }
    return image
  }, [viewerControls, pages, pageIndex, image])

  const [imageUrl, setImageUrl] = useState<string>('')
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [zoom, setZoom] = useState<number>(1)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<boolean>(false)
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  // Create ObjectURL for the active image and revoke on cleanup
  useEffect(() => {
    try {
      const url = URL.createObjectURL(activeImage.imageData)
      setImageUrl(url)
      setLoadState('loading')
      return () => {
        try {
          URL.revokeObjectURL(url)
        } catch {}
      }
    } catch {
      setLoadState('error')
      setImageUrl('')
    }
  }, [activeImage])

  // Reset pan when zoom returns to fit
  useEffect(() => {
    if (zoom <= 1) setOffset({ x: 0, y: 0 })
  }, [zoom])

  const changeZoom = (delta: number) => {
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number((z + delta).toFixed(2)))))
  }

  const resetView = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const onMouseDown: React.MouseEventHandler<HTMLImageElement> = (e) => {
    if (zoom <= 1) return
    setDragging(true)
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  const onMouseMove: React.MouseEventHandler<HTMLImageElement> = (e) => {
    if (!dragging || !dragStart.current) return
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }

  const endDrag = () => {
    setDragging(false)
    dragStart.current = null
  }

  const goPrev = () => {
    if (!viewerControls || !pages || !onPageChange || typeof pageIndex !== 'number') return
    if (pageIndex <= 0) return
    onPageChange(pageIndex - 1)
    resetView()
  }

  const goNext = () => {
    if (!viewerControls || !pages || !onPageChange || typeof pageIndex !== 'number') return
    if (pageIndex >= pages.length - 1) return
    onPageChange(pageIndex + 1)
    resetView()
  }

  return (
    <div className="relative group" tabIndex={viewerControls ? 0 : -1}>
      {/* Image area */}
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
        {loadState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center text-white/80">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/80"></div>
          </div>
        )}
        {loadState === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center text-red-200">画像を読み込めませんでした</div>
        )}
        {!!imageUrl && (
          <img
            src={imageUrl}
            alt={`プレビュー画像 ${activeImage.order + 1}`}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
            }}
            className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}`}
            onLoad={() => setLoadState('ready')}
            onError={() => setLoadState('error')}
            onMouseDown={viewerControls ? onMouseDown : undefined}
            onMouseMove={viewerControls ? onMouseMove : undefined}
            onMouseUp={viewerControls ? endDrag : undefined}
            onMouseLeave={viewerControls ? endDrag : undefined}
            draggable={false}
          />
        )}

        {viewerControls && (
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            <button aria-label="Zoom out" onClick={() => changeZoom(-0.1)} className="px-2 py-1 bg-white/80 rounded hover:bg-white">-</button>
            <span className="text-white text-xs select-none">{Math.round(zoom * 100)}%</span>
            <button aria-label="Zoom in" onClick={() => changeZoom(0.1)} className="px-2 py-1 bg-white/80 rounded hover:bg-white">+</button>
            <button aria-label="Reset view" onClick={resetView} className="px-2 py-1 bg-white/80 rounded hover:bg-white">Reset</button>
          </div>
        )}

        {viewerControls && pages && pages.length > 1 && typeof pageIndex === 'number' && onPageChange && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            <button
              aria-label="前のページ"
              onClick={goPrev}
              disabled={pageIndex <= 0}
              className="px-3 py-1 rounded bg-white/80 hover:bg-white disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-white text-sm select-none">{pageIndex + 1} / {pages.length}</span>
            <button
              aria-label="次のページ"
              onClick={goNext}
              disabled={pageIndex >= pages.length - 1}
              className="px-3 py-1 rounded bg-white/80 hover:bg-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Index badge */}
      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
        {activeImage.order + 1}
      </div>

      {/* Original move/delete controls (for thumbnail use) */}
      {showControls && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {onMoveUp && (
            <button onClick={() => activeImage.id && onMoveUp(activeImage.id)} className="bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white transition" title="上へ移動">
              ▲
            </button>
          )}
          {onMoveDown && (
            <button onClick={() => activeImage.id && onMoveDown(activeImage.id)} className="bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white transition" title="下へ移動">
              ▼
            </button>
          )}
          <button onClick={() => activeImage.id && onDelete(activeImage.id)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition" title="削除">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

