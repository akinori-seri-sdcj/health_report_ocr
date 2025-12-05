import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'
import { useOCRResultStore } from '../store/ocrResultStore'
import { processHealthReport, type ExaminationItem } from '../api/healthReportApi'
import ExportModal from '../components/ExportModal'
import { ImagePreview } from '../components/ImagePreview'
import { exportData } from '../services/export.service'

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


// Load viewer state when session becomes available
useEffect(() => {
  try { (useSessionStore.getState() as any).loadViewerState?.() } catch {}
}, [currentSession])
  // Source image preview is handled via the store's viewer state
  // Source image preview is handled via the store's viewer state
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

    const info = ocrResult.受診者情報 || {}
    const currentName = info.氏名 ?? ''
    const currentDate = info.受診日 ?? ''

    if (field === '氏名') {
      updatePatientInfo(value, currentDate)
    } else {
      updatePatientInfo(currentName, value)
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
    if (!ocrResult || !ocrResult.検査結果 || !ocrResult.検査結果[index]) return

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
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setPaneVisible(!paneVisible)}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
            aria-pressed={paneVisible}
            aria-label={paneVisible ? '画像パネルを隠す' : '画像パネルを表示'}
          >
            {paneVisible ? '画像を隠す' : '画像を表示'}
          </button>
        </div>
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
                <h2 className="text-lg font-semibold">撮影・アップロードした画像</h2>

                {/* ファイルアップロードボタン */}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-black transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  画像を追加
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
                <h2 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h2>
                <p className="text-red-700 mb-3">原因: {error}</p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  <li>画像サイズ/枚数の上限を超えていないか確認してください。</li>
                  <li>APIキーなどのサーバー設定が正しいかを運用者に確認してください。</li>
                  <li>時間をおいて再試行するか、ネットワーク接続を確認してください。</li>
                </ul>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleStartOCR}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    再試行
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    メッセージを閉じる
                  </button>
                </div>
              </section>
            )}

            {/* OCR結果の表示・編集 */}            {/* OCR結果の表示・編集 */}
            {ocrResult && (
              <>
                {/* 読み取り元画像（デスクトップは右側に固定表示） */}
                {currentImages.length > 0 && paneVisible && (
                  <section className="bg-white rounded-lg shadow p-3 mb-6 sticky top-0 z-20">
                    <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-semibold">読み取り元画像</h2></div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="text-gray-600">高さ:</span>
                      <button onClick={() => { try { (useSessionStore.getState() as any).setViewerHeightPreset?.('30vh') } catch {} }} className={`px-2 py-1 rounded ${((useSessionStore.getState() as any).viewerState?.heightPreset==='30vh')?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200'}`}>30vh</button>
                      <button onClick={() => { try { (useSessionStore.getState() as any).setViewerHeightPreset?.('40vh') } catch {} }} className={`px-2 py-1 rounded ${(!((useSessionStore.getState() as any).viewerState) || (useSessionStore.getState() as any).viewerState?.heightPreset==='40vh')?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200'}`}>40vh</button>
                      <button onClick={() => { try { (useSessionStore.getState() as any).setViewerHeightPreset?.('50vh') } catch {} }} className={`px-2 py-1 rounded ${(useSessionStore.getState() as any).viewerState?.heightPreset==='50vh'?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200'}`}>50vh</button>
                    </div>
                    <div className="w-full overflow-auto" style={{ height: (useSessionStore.getState() as any).viewerState?.heightPreset || '40vh' }}>
                      <ImagePreview
                        image={currentImages[((useSessionStore.getState() as any).viewerState?.pageIndex || 0)] || currentImages[0]}
                        onDelete={() => {}}
                        showControls={false}
                        objectFit="contain"
                        viewerControls={true}
                        initialZoom={(useSessionStore.getState() as any).viewerState?.zoom}
                        initialOffset={(useSessionStore.getState() as any).viewerState?.pan}
                        onZoomChange={(z) => { try { (useSessionStore.getState() as any).setViewerZoom?.(z) } catch {} }}
                        onPanChange={(o) => { try { (useSessionStore.getState() as any).setViewerPan?.(o) } catch {} }}
                        pages={currentImages}
                        pageIndex={(useSessionStore.getState() as any).viewerState?.pageIndex || 0}
                        onPageChange={(i) => { try { (useSessionStore.getState() as any).setViewerPageIndex?.(i) } catch {} }}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
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
                    {ocrResult.検査結果?.map((item: ExaminationItem, index: number) => (
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
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.値 || ''}
                            onChange={(e) => handleItemChange(index, '値', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.単位 || ''}
                            onChange={(e) => handleItemChange(index, '単位', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.判定 || ''}
                            onChange={(e) => handleItemChange(index, '判定', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
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










