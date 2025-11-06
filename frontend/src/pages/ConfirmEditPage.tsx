import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'
import { useOCRResultStore } from '../store/ocrResultStore'
import { processHealthReport } from '../api/healthReportApi'
import ExportModal from '../components/ExportModal'
import { ImagePreview } from '../components/ImagePreview'
import { exportData } from '../services/export.service'
import { currentUserCanExport } from '../services/permission.service'

/**
 * 確認・編集画面
 *
 * 撮影した画像をOCR処理し、結果を確認・編集する
 */
export const ConfirmEditPage: React.FC = () => {
  const navigate = useNavigate()

  // セッション情報
  const { currentImages, currentSession, createSession, loadSession, addImage, imagePaneVisible, setImagePaneVisible } = useSessionStore()
  // Fallback guards in case older bundle lacks new store fields
  const paneVisible = (typeof imagePaneVisible !== 'undefined' ? imagePaneVisible : true)
  const setPaneVisible = (v: boolean) => {
    try { setImagePaneVisible?.(v) } catch {}
  }

  // OCR結果
  const {
    ocrResult,
    isProcessing,
    error,
    setOCRResult,
    setProcessing,
    setError,
    updatePatientInfo,
    updateExaminationItem,
    deleteExaminationItem,
  } = useOCRResultStore()

  // 初期化状態
  const [isInitializing, setIsInitializing] = useState(true)
  const [exportOpen, setExportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedRowIndices] = useState<number[]>([])
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null); const [viewerPage, setViewerPage] = useState<number>(0)

  // セッションの初期化
  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      // セッションIDをlocalStorageから取得
      const savedSessionId = localStorage.getItem('currentSessionId')

      if (savedSessionId) {
        // 既存セッションを読み込み
        console.log('[ConfirmEditPage] 既存セッションを復元:', savedSessionId)
        await loadSession(savedSessionId)

        // セッションの読み込みに失敗した場合は新規作成
        if (!currentSession) {
          console.log('[ConfirmEditPage] セッションが見つからないため新規作成')
          localStorage.removeItem('currentSessionId')
          const newSessionId = await createSession()
          localStorage.setItem('currentSessionId', newSessionId)
        }
      } else if (!currentSession) {
        // 新しいセッションを作成
        console.log('[ConfirmEditPage] 新しいセッションを作成')
        const newSessionId = await createSession()
        localStorage.setItem('currentSessionId', newSessionId)
      }

      if (mounted) {
        setIsInitializing(false)
      }
    }

    initSession()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // セッション読み込み完了をログ出力
  useEffect(() => {
    if (!isInitializing && currentSession) {
      console.log('[ConfirmEditPage] セッション読み込み完了:', currentImages.length, '枚')
    }
  }, [isInitializing, currentSession, currentImages])

  // Source image URL for preview on Confirm/Edit (first image)
  useEffect(() => {
    let prev: string | null = null
    if (currentImages && currentImages.length > 0) {
      try {
        const url = URL.createObjectURL(currentImages[0].imageData)
        setSourceImageUrl(url)
        prev = url
      } catch (e) {
        console.warn('Failed to create preview URL', e)
        setSourceImageUrl(null)
      }
    } else {
      setSourceImageUrl(null)
    }
    return () => {
      if (prev) {
        try { URL.revokeObjectURL(prev) } catch {}
      }
    }
  }, [currentImages])

  /**
   * ファイルアップロード
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    console.log('[ConfirmEditPage] ファイルアップロード:', files.length, '件')

    // セッションが存在しない場合は作成
    if (!currentSession) {
      console.log('[ConfirmEditPage] セッションがないため作成します')
      const newSessionId = await createSession()
      localStorage.setItem('currentSessionId', newSessionId)
    }

    // ファイルをBlobとして追加
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        await addImage(file)
      }
    }
  }

  /**
   * OCR処理を開始
   */
  const handleStartOCR = async () => {
    if (currentImages.length === 0) {
      alert('画像がありません')
      return
    }

    setProcessing(true)
    // Do not use setError(null) here; it resets isProcessing in the store.
    try { (useOCRResultStore.getState() as any).clearError?.() } catch {}

    try {
      // Blob配列を取得
      const imageBlobs = currentImages.map((img) => img.imageData)

      // バックエンドAPIにリクエスト
      const result = await processHealthReport(imageBlobs)

      // 結果を保存
      setOCRResult(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OCR処理に失敗しました'
      setError(errorMessage)
      console.error('[ConfirmEditPage] OCR処理エラー:', err)
    }
  }

  /**
   * 受診者情報の編集
   */
  const handlePatientInfoChange = (field: '氏名' | '受診日', value: string) => {
    if (!ocrResult) return

    if (field === '氏名') {
      updatePatientInfo(value, ocrResult.受診者情報.受診日)
    } else {
      updatePatientInfo(ocrResult.受診者情報.氏名, value)
    }
  }

  /**
   * 検査項目の編集
   */
  const handleItemChange = (
    index: number,
    field: '項目名' | '値' | '単位' | '判定',
    value: string
  ) => {
    if (!ocrResult) return

    const item = { ...ocrResult.検査結果[index] }
    if (field === '単位' || field === '判定') {
      item[field] = value || null
    } else {
      item[field] = value
    }

    updateExaminationItem(index, item)
  }

  /**
   * Excel生成ページへ
   */
  const handleProceedToExcel = () => {
    if (!ocrResult || (ocrResult.検査結果?.length ?? 0) === 0) {
      alert('エクスポート可能な行がありません')
      return
    }
    // Reuse this button to trigger export options
    setExportOpen(true)
  }

  // Export modal open/close (placeholder only)
  const handleOpenExport = () => setExportOpen(true)
  const handleCloseExport = () => setExportOpen(false)
  const handleConfirmExport = async (
    format: 'xlsx' | 'csv',
    scope: 'filtered' | 'selected' | 'all',
    encoding?: 'utf-8' | 'shift_jis'
  ) => {
    try {
      setExporting(true)
      let effectiveScope: 'filtered' | 'selected' = scope === 'all' ? 'filtered' : (scope as any)
      // None-selected handling for 'selected' scope
      if (effectiveScope === 'selected' && selectedRowIndices.length === 0) {
        const proceed = window.confirm('選択された行がありません。絞り込み済みの全行をエクスポートしますか？')
        if (!proceed) {
          setExportMessage('Export canceled.')
          setExportOpen(false)
          setExporting(false)
          return
        }
        effectiveScope = 'filtered'
      }
      await exportData(format, effectiveScope, encoding, selectedRowIndices)
      setExportMessage(`Exported ${format.toUpperCase()} successfully.`)
      setExportError(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Export failed'
      setExportError(msg)
      setExportMessage(null)
    } finally {
      setExportOpen(false)
      setExporting(false)
    }
  }
  const handleCancelExport = () => {
    setExportMessage('Export canceled.')
    setExportError(null)
  }

  /**
   * カメラに戻る
   */
  const handleBackToCamera = () => {
    navigate('/camera')
  }

  // デバッグログ
  console.log('[ConfirmEditPage] レンダリング:', {
    ocrResult: ocrResult ? 'あり' : 'なし',
    検査結果件数: ocrResult?.検査結果?.length || 0,
    isProcessing,
    error,
  })

  const hasRows = !!ocrResult && (((ocrResult as any)['検査結果']?.length || 0) > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Processing overlay (blinking): show clear, centered banner */}
      {isProcessing && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          <div className="animate-blink bg-yellow-100 text-yellow-900 border border-yellow-300 rounded px-5 py-2 shadow font-semibold">
            OCR処理中
          </div>
        </div>
      )}
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{ocrResult ? '確認・編集' : '画像をアップロード'}</h1>
            <button
              onClick={handleBackToCamera}
              className="text-gray-600 hover:text-gray-900"
            >
              ← カメラに戻る
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Export status messages (placeholder) */}
        {exportMessage && (
          <div className="mb-4 bg-blue-50 text-blue-700 px-4 py-2 rounded">{exportMessage}</div>
        )}
        {exportError && (
          <div className="mb-4 bg-red-50 text-red-700 px-4 py-2 rounded">{exportError}</div>
        )}
        {/* 初期化中 */}
        {isInitializing && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {/* 撮影画像の確認 */}
        {!isInitializing && (
          <>
            <section className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">�B�e�����摜</h2>

                {/* ファイルアップロードボタン */}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  📁 画像を追加
                </label>

                {/* Export button removed per spec (single entry via bottom button) */}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {currentImages.map((image, index) => (
                  <ImageThumbnail key={image.id} image={image} index={index} />
                ))}
              </div>

              {/* 画像がない場合のメッセージ */}
              {currentImages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">画像がありません</p>
                  <p className="text-sm">「画像を追加」ボタンから健康診断結果の画像をアップロードしてください</p>
                </div>
              )}

              {/* OCR処理開始ボタン */}
              {!ocrResult && currentImages.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={handleStartOCR}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-lg font-bold text-lg transition ${
                      isProcessing
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isProcessing ? '処理中...' : 'OCR処理を開始'}
                  </button>
                </div>
              )}
            </section>

            {/* 処理中 */}
            {isProcessing && (
              <section className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">OCR処理中です。しばらくお待ちください...</p>
                </div>
              </section>
            )}

            {/* エラー表示 */}
            {error && (
              <section className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">�G���[</h2>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={handleStartOCR}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  再試行
                </button>
              </section>
            )}

            {/* OCR結果の表示・編集 */}
            {ocrResult && (
              <>
                {/* 読み取り元画像（デスクトップは右側に固定表示） */}
                {currentImages.length > 0 && paneVisible && (
                  <section className="bg-white rounded-lg shadow p-4 mb-6 lg:float-right lg:w-1/2 lg:ml-6">
                    <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-semibold">読み取り元画像</h2></div>
                    <div className="w-full h-[60vh]">
                      <ImagePreview
                        image={currentImages[viewerPage] || currentImages[0]}
                        onDelete={() => {}}
                        showControls={false}
                        objectFit="contain"
                        viewerControls={true}
                        pages={currentImages}
                        pageIndex={viewerPage}
                        onPageChange={setViewerPage}
                      />
                    </div>
                  </section>
                )}
                {/* 受診者情報 */}
                <section className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">患者情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    氏名
                  </label>
                  <input
                    type="text"
                    value={ocrResult.受診者情報?.氏名 || ''}
                    onChange={(e) => handlePatientInfoChange('氏名', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="氏名が抽出されなかった場合は手入力してください"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    受診日
                  </label>
                  <input
                    type="date"
                    value={ocrResult.受診者情報?.受診日 || ''}
                    onChange={(e) => handlePatientInfoChange('受診日', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="受診日が抽出されなかった場合は手入力してください"
                  />
                </div>
              </div>
            </section>

            {/* 検査結果 */}
            <section className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">検査結果</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                        項目番号
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        項目名
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        値
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        単位
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        判定
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ocrResult.検査結果?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {/* 行番号はCSSのカウンタで表示するため中身は空にする */}
                        <td className="px-4 py-3 text-gray-700"></td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.項目名 || ''}
                            onChange={(e) =>
                              handleItemChange(index, '項目名', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.値 || ''}
                            onChange={(e) => handleItemChange(index, '値', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.単位 || ''}
                            onChange={(e) => handleItemChange(index, '単位', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.判定 || ''}
                            onChange={(e) => handleItemChange(index, '判定', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              if (confirm('この項目を削除しますか？')) {
                                deleteExaminationItem(index)
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

                {/* Excel生成へ */}
                <div className="flex justify-end">
                  <button
                    onClick={handleProceedToExcel}
                    className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
                  >
                    確定してExcel生成へ →
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Export Modal (centered overlay) */}
      <ExportModal
        open={exportOpen}
        onClose={handleCloseExport}
        onConfirm={handleConfirmExport}
        onCancel={handleCancelExport}
        defaultFormat="xlsx"
        busy={exporting}
      />
    </div>
  )
}

/**
 * 画像サムネイル
 */
interface ImageThumbnailProps {
  image: { id?: number; imageData: Blob; order: number }
  index: number
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({ image, index }) => {
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    const url = URL.createObjectURL(image.imageData)
    setImageUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [image.imageData])

  return (
    <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
      <img src={imageUrl} alt={`画像 ${index + 1}`} className="w-full h-full object-cover" />
      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
        {index + 1}
      </div>
    </div>
  )
}









