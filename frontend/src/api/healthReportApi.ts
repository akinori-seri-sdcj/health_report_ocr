/**
 * バックエンドAPI通信用クライアント
 */

// Prefer same-origin API Route; allow override via VITE_API_URL for custom staging
// デフォルトは同一オリジンの API Routes を利用する
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * 検査結果1行分
 * （型は緩めにしておき、既存の日本語キーも許容）
 */
export interface ExaminationItem {
  [key: string]: any
}

/**
 * OCR結果全体
 */
export interface HealthReportOCRResult {
  [key: string]: any
}

/**
 * OCRエラーのレスポンス
 *
 * バックエンドの error は以下2パターンを想定:
 * - { error: "メッセージ文字列", details?: string }
 * - { error: { message?: string, code?: string }, details?: string | object }
 */
export interface OCRErrorResponse {
  error?: unknown
  details?: unknown
}

/**
 * 健康診断結果画像のOCR処理をバックエンドに依頼
 *
 * @param images 健康診断結果の画像ファイル（複数可）
 * @returns OCR結果
 */
export async function processHealthReport(
  images: Blob[]
): Promise<HealthReportOCRResult> {
  const formData = new FormData()

  // すべての画像をフォームに追加
  images.forEach((image, index) => {
    formData.append('images', image, `health-report-${index + 1}.jpg`)
  })

  console.log('[API] OCR処理開始:', images.length, '枚の画像')

  try {
    const response = await fetch(`${API_BASE_URL}/ocr`, {
      method: 'POST',
      body: formData,
    })

    // HTTPステータスがエラーの場合
    if (!response.ok) {
      let errorMessage = `OCR APIがエラーを返しました (HTTP ${response.status})`

      try {
        const errorData: OCRErrorResponse = await response.json()
        const rawError = errorData?.error

        if (typeof rawError === 'string' && rawError.trim()) {
          errorMessage = rawError
        } else if (
          rawError &&
          typeof rawError === 'object' &&
          typeof (rawError as any).message === 'string' &&
          (rawError as any).message.trim()
        ) {
          errorMessage = (rawError as any).message
        } else if (rawError && typeof rawError === 'object') {
          try {
            errorMessage = JSON.stringify(rawError)
          } catch {
            // stringify できなければ既定メッセージのまま
          }
        }

        const details = errorData?.details
        if (typeof details === 'string' && details.trim()) {
          errorMessage += `: ${details}`
        } else if (details && typeof details === 'object') {
          try {
            const s = JSON.stringify(details)
            if (s && s !== '{}') {
              errorMessage += `: ${s}`
            }
          } catch {
            // 無視
          }
        }
      } catch {
        // JSON でないエラー本文の場合は既定メッセージのまま
      }

      if (response.status === 413) {
        errorMessage = '画像のサイズまたは枚数が上限を超えています (HTTP 413)'
      }
      if (response.status >= 500) {
        errorMessage += '。時間をおいて再試行してください。'
      }

      // ここでは Error オブジェクトではなく「文字列」を投げる
      // （呼び出し側で [object Object] にならないようにするため）
      throw errorMessage
    }

    const responseData = await response.json()
    console.log('[API] OCR処理結果:', responseData)

    // バックエンドのレスポンス仕様: { success: true, data: HealthReportData }
    if (responseData && responseData.success && responseData.data) {
      return responseData.data as HealthReportOCRResult
    }

    // 仕様と異なるレスポンス形式
    throw 'OCRのレスポンス形式が正しくありません'
  } catch (error) {
    console.error('[API] OCR処理エラー:', error)

    // 文字列エラーはそのまま再スロー
    if (typeof error === 'string' && error.trim()) {
      throw error
    }

    // Error オブジェクトなら message を優先
    if (error instanceof Error && error.message) {
      // ネットワークエラーなどで fetch 自体が失敗した場合
      if (error.message.includes('Failed to fetch')) {
        throw 'ネットワークエラー: 接続を確認してください'
      }
      throw error.message
    }

    // それ以外のオブジェクトも、可能なら JSON 化して投げる
    if (error && typeof error === 'object') {
      try {
        const asAny = error as any
        if (typeof asAny.message === 'string' && asAny.message.trim()) {
          throw asAny.message
        }
        const json = JSON.stringify(error)
        if (json && json !== '{}') {
          throw json
        }
      } catch {
        // stringify 失敗時はフォールバック
      }
    }

    // 最終フォールバック
    throw 'OCR処理中にエラーが発生しました'
  }
}

