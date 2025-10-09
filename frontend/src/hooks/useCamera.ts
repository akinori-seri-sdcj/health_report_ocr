import { useState, useRef, useCallback, useEffect } from 'react'

export interface UseCameraReturn {
  // 状態
  stream: MediaStream | null
  error: string | null
  isLoading: boolean
  isCameraActive: boolean

  // メソッド
  startCamera: () => Promise<void>
  stopCamera: () => void
  captureImage: () => Promise<Blob | null>

  // Ref
  videoRef: React.RefObject<HTMLVideoElement>
}

/**
 * カメラ操作のカスタムフック
 *
 * @returns カメラ操作に必要な状態とメソッド
 */
export const useCamera = (): UseCameraReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  /**
   * カメラを起動する
   */
  const startCamera = useCallback(async () => {
    console.log('[useCamera] startCamera called')
    setIsLoading(true)
    setError(null)

    try {
      // カメラAPIがサポートされているかチェック
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('このブラウザはカメラAPIをサポートしていません')
      }

      console.log('[useCamera] Requesting camera access...')

      // カメラストリームを取得
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 背面カメラを優先
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      console.log('[useCamera] Camera stream obtained:', mediaStream.id)
      console.log('[useCamera] Video tracks:', mediaStream.getVideoTracks().length)

      setStream(mediaStream)
      setIsCameraActive(true)
      console.log('[useCamera] Camera active state set to true')
    } catch (err) {
      console.error('[useCamera] カメラ起動エラー:', err)

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('カメラの使用が許可されていません。ブラウザの設定を確認してください。')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('カメラが見つかりません。デバイスを確認してください。')
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('カメラが他のアプリケーションで使用中です。')
        } else {
          setError(err.message || 'カメラの起動に失敗しました')
        }
      } else {
        setError('カメラの起動に失敗しました')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * カメラを停止する
   */
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }, [stream])

  /**
   * 現在のフレームを画像として保存する
   *
   * @returns 画像のBlob、失敗時はnull
   */
  const captureImage = useCallback(async (): Promise<Blob | null> => {
    if (!stream || !videoRef.current) {
      setError('カメラが起動していません')
      return null
    }

    try {
      const video = videoRef.current

      // キャンバスを作成してビデオフレームを描画
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Canvas contextの取得に失敗しました')
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // BlobとしてJPEG画像を生成
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              setError('画像の生成に失敗しました')
              resolve(null)
            }
          },
          'image/jpeg',
          0.9 // 品質: 0.9 = 高品質
        )
      })
    } catch (err) {
      console.error('画像キャプチャエラー:', err)
      setError('画像のキャプチャに失敗しました')
      return null
    }
  }, [stream])

  // コンポーネントアンマウント時にカメラを停止
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return {
    stream,
    error,
    isLoading,
    isCameraActive,
    startCamera,
    stopCamera,
    captureImage,
    videoRef,
  }
}
