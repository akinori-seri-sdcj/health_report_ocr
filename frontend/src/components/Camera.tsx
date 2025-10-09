import { useEffect } from 'react'
import { useCamera } from '../hooks/useCamera'

export interface CameraProps {
  onCapture: (image: Blob) => void
  onError?: (error: string) => void
}

/**
 * カメラプレビューと撮影ボタンを持つコンポーネント
 */
export const Camera: React.FC<CameraProps> = ({ onCapture, onError }) => {
  const {
    stream,
    error,
    isLoading,
    isCameraActive,
    startCamera,
    stopCamera,
    captureImage,
    videoRef,
  } = useCamera()

  // カメラが起動したらvideoRefに設定
  useEffect(() => {
    console.log('[Camera] Stream changed:', stream?.id)
    console.log('[Camera] VideoRef current:', !!videoRef.current)

    if (videoRef.current && stream) {
      console.log('[Camera] Setting stream to video element')
      videoRef.current.srcObject = stream
    }
  }, [stream, videoRef])

  // エラーを親コンポーネントに通知
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  // コンポーネントマウント時にカメラを起動（一度だけ）
  useEffect(() => {
    console.log('[Camera] Component mounted, initializing camera...')
    let mounted = true

    const initCamera = async () => {
      if (mounted) {
        console.log('[Camera] Calling startCamera...')
        await startCamera()
        console.log('[Camera] startCamera completed')
      }
    }

    initCamera()

    return () => {
      console.log('[Camera] Component unmounting, stopping camera...')
      mounted = false
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // マウント時のみ実行

  /**
   * 撮影ボタンクリック時の処理
   */
  const handleCapture = async () => {
    const blob = await captureImage()
    if (blob) {
      onCapture(blob)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black">
      {/* カメラプレビュー */}
      <div className="relative w-full max-w-4xl aspect-video bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-lg">カメラを起動中...</div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-red-500 text-white p-4 rounded-lg max-w-md text-center">
              <p className="font-bold mb-2">エラー</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-white text-red-500 rounded hover:bg-gray-100"
              >
                再試行
              </button>
            </div>
          </div>
        )}

        {!error && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* カメラガイドライン（オプション） */}
        {isCameraActive && !error && (
          <div className="absolute inset-0 pointer-events-none">
            {/* 中央の十字線 */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-white opacity-30" />
            <div className="absolute left-1/2 top-0 w-px h-full bg-white opacity-30" />

            {/* コーナーマーカー */}
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white opacity-50" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-white opacity-50" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-white opacity-50" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-white opacity-50" />
          </div>
        )}
      </div>

      {/* 撮影ボタン */}
      <div className="w-full max-w-4xl p-6 bg-gray-900">
        <button
          onClick={handleCapture}
          disabled={!isCameraActive || isLoading || !!error}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
            isCameraActive && !isLoading && !error
              ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? '起動中...' : '📸 撮影する'}
        </button>

        {/* 使い方のヒント */}
        {isCameraActive && !error && (
          <div className="mt-4 text-center text-white text-sm opacity-70">
            <p>健康診断結果の用紙全体が画面に収まるように調整してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
