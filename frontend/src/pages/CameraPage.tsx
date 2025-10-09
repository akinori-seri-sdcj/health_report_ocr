import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from '../components/Camera'
import { ImagePreview } from '../components/ImagePreview'
import { useSessionStore } from '../store/sessionStore'

/**
 * カメラ撮影画面
 *
 * 健康診断結果の画像を撮影する
 */
export const CameraPage: React.FC = () => {
  const navigate = useNavigate()
  const [showNotification, setShowNotification] = useState(false)

  // Zustand ストア
  const {
    currentSession,
    currentImages,
    createSession,
    loadSession,
    addImage,
    deleteImage,
    reorderImages,
  } = useSessionStore()

  // プレビュー表示の開閉
  const [showPreview, setShowPreview] = useState(false)

  // コンポーネントマウント時にセッションを作成または復元
  useEffect(() => {
    console.log('[CameraPage] Component mounted')
    console.log('[CameraPage] currentSession:', currentSession)
    let mounted = true

    const initSession = async () => {
      if (!mounted) return

      // 既にセッションが読み込まれている場合はスキップ
      if (currentSession) {
        console.log('[CameraPage] セッション既に存在:', currentSession.id)
        return
      }

      // セッションIDをlocalStorageから取得
      const savedSessionId = localStorage.getItem('currentSessionId')
      console.log('[CameraPage] Saved session ID from localStorage:', savedSessionId)

      if (savedSessionId) {
        // 既存セッションを読み込み
        console.log('[CameraPage] 既存セッションを復元:', savedSessionId)
        await loadSession(savedSessionId)
      } else {
        // 新しいセッションを作成
        console.log('[CameraPage] 新しいセッションを作成')
        const newSessionId = await createSession()
        console.log('[CameraPage] Created new session:', newSessionId)
        localStorage.setItem('currentSessionId', newSessionId)
      }
    }

    initSession()

    return () => {
      console.log('[CameraPage] Component unmounting')
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // マウント時のみ実行

  /**
   * 撮影完了時の処理
   */
  const handleCapture = async (image: Blob) => {
    // IndexedDB に保存
    await addImage(image)

    // 通知を表示
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)

    console.log('画像を撮影しました:', {
      size: image.size,
      type: image.type,
      totalImages: currentImages.length,
    })
  }

  /**
   * エラー時の処理
   */
  const handleError = (error: string) => {
    console.error('カメラエラー:', error)
    // TODO: エラー通知UIを実装
  }

  /**
   * 画像を削除
   */
  const handleDeleteImage = async (imageId: number) => {
    await deleteImage(imageId)
  }

  /**
   * 画像を上に移動
   */
  const handleMoveUp = async (imageId: number) => {
    const index = currentImages.findIndex(img => img.id === imageId)
    if (index > 0) {
      await reorderImages(index, index - 1)
    }
  }

  /**
   * 画像を下に移動
   */
  const handleMoveDown = async (imageId: number) => {
    const index = currentImages.findIndex(img => img.id === imageId)
    if (index < currentImages.length - 1) {
      await reorderImages(index, index + 1)
    }
  }

  /**
   * 撮影完了ボタン（次の画面へ）
   */
  const handleFinish = () => {
    if (currentImages.length === 0) {
      alert('少なくとも1枚の画像を撮影してください')
      return
    }

    // 確認・編集画面に遷移
    navigate('/confirm-edit')
  }

  return (
    <div className="relative w-full h-screen flex flex-col bg-black">
      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 transition"
          >
            <span className="text-xl">←</span>
            <span>戻る</span>
          </button>

          <div className="flex items-center gap-4">
            {/* 撮影枚数表示 */}
            {currentImages.length > 0 && (
              <>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="bg-blue-500 px-3 py-1 rounded-full text-sm font-bold hover:bg-blue-600 transition"
                >
                  {currentImages.length}枚撮影済み {showPreview ? '▼' : '▲'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 画像プレビューパネル */}
      {showPreview && currentImages.length > 0 && (
        <div className="absolute top-16 left-0 right-0 z-20 bg-black/95 max-h-96 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentImages.map((image, index) => (
              <ImagePreview
                key={image.id}
                image={image}
                onDelete={handleDeleteImage}
                onMoveUp={index > 0 ? handleMoveUp : undefined}
                onMoveDown={index < currentImages.length - 1 ? handleMoveDown : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* カメラコンポーネント */}
      <div className="flex-1 flex items-center justify-center">
        <Camera onCapture={handleCapture} onError={handleError} />
      </div>

      {/* 撮影完了通知 */}
      {showNotification && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
            ✓ 撮影しました！
          </div>
        </div>
      )}

      {/* フッター（撮影完了ボタン） */}
      {currentImages.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-4">
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-green-500 text-white font-bold text-lg rounded-lg hover:bg-green-600 active:scale-95 transition"
          >
            撮影完了（{currentImages.length}枚） →
          </button>
        </div>
      )}

      {/* 説明（初回のみ表示） */}
      {currentImages.length === 0 && (
        <div className="absolute bottom-24 left-0 right-0 z-30 px-6">
          <div className="bg-blue-500/90 text-white p-4 rounded-lg text-center">
            <p className="font-bold mb-2">📄 健康診断結果の撮影</p>
            <p className="text-sm">
              用紙全体がはっきり写るように撮影してください
              <br />
              複数ページある場合は、1枚ずつ撮影できます
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
