/**
 * バックエンドAPI通信クライアント
 */

// Prefer relative '/api' under HTTPS (behind Nginx), fallback to localhost:8080 in plain HTTP dev
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? (window.location.protocol === 'https:' ? '/api' : 'http://localhost:8080')
    : '/api')

/**
 * 検査結果項目
 */
export interface ExaminationItem {
  項目名: string
  値: string
  単位: string | null
  判定: string | null
}

/**
 * LLM APIからのレスポンス構造
 */
export interface HealthReportOCRResult {
  受診者情報?: {
    氏名?: string
    受診日?: string
  }
  検査結果?: ExaminationItem[]
  総合所見?: {
    総合判定: string | null
    医師の所見: string | null
  }
}

/**
 * OCR処理のエラーレスポンス
 */
export interface OCRErrorResponse {
  error: string
  details?: string
}

/**
 * 健康診断結果の画像をOCR処理する
 *
 * @param images 健康診断結果の画像ファイル（複数可）
 * @returns OCR処理結果
 */
export async function processHealthReport(
  images: Blob[]
): Promise<HealthReportOCRResult> {
  const formData = new FormData()

  // 複数画像を追加
  images.forEach((image, index) => {
    formData.append('images', image, `health-report-${index + 1}.jpg`)
  })

  console.log('[API] OCR処理開始:', images.length, '枚の画像')

  try {
    const response = await fetch(`${API_BASE_URL}/process-health-report`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData: OCRErrorResponse = await response.json()
        errorMessage = errorData.error || errorMessage
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`
        }
      } catch (e) {
        // JSON parse error - use default message
      }
      throw new Error(errorMessage)
    }

    const responseData = await response.json()
    console.log('[API] OCR処理完了:', responseData)

    // バックエンドのレスポンス形式: { success: true, data: HealthReportData }
    if (responseData.success && responseData.data) {
      return responseData.data
    }

    // レスポンスが想定外の形式の場合
    throw new Error('OCR処理のレスポンスが不正な形式です')
  } catch (error) {
    console.error('[API] OCR処理エラー:', error)

    if (error instanceof Error) {
      throw error
    }

    throw new Error('OCR処理中にエラーが発生しました')
  }
}
