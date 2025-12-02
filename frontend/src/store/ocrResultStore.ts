import { create } from 'zustand'
import { HealthReportOCRResult, ExaminationItem } from '../api/healthReportApi'
import { useSessionStore } from './sessionStore'

// Source image selector return type
export type SourceImageRef = { url: string; pageCount: number }

/**
 * Select a reference to the first source image and total page count
 * url is an ObjectURL for the first image Blob; caller should revoke via revokeSourceImageRef
 */
export function selectSourceImage(): SourceImageRef | null {
  try {
    const { currentImages } = useSessionStore.getState()
    if (!currentImages || currentImages.length === 0) return null
    const first = currentImages[0]
    const url = URL.createObjectURL(first.imageData)
    return { url, pageCount: currentImages.length }
  } catch {
    return null
  }
}

export function revokeSourceImageRef(url: string) {
  try { URL.revokeObjectURL(url) } catch {}
}

/**
 * OCR結果の状態管理
 */
interface OCRResultState {
  // OCR結果
  ocrResult: HealthReportOCRResult | null

  // 処理状態
  isProcessing: boolean
  error: string | null

  // アクション
  setOCRResult: (result: HealthReportOCRResult) => void
  setProcessing: (isProcessing: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // 編集機能
  updatePatientInfo: (name: string, date: string) => void
  updateExaminationItem: (index: number, item: ExaminationItem) => void
  addExaminationItem: (item: ExaminationItem) => void
  deleteExaminationItem: (index: number) => void

  // リセット
  clearResult: () => void
}

export const useOCRResultStore = create<OCRResultState>((set) => ({
  ocrResult: null,
  isProcessing: false,
  error: null,

  /**
   * OCR結果を設定
   */
  setOCRResult: (result) => {
    // 受診者情報や検査結果が存在しない場合はデフォルト値を設定
    const normalizedResult = {
      受診者情報: result.受診者情報 || {},
      検査結果: result.検査結果 || [],
      総合所見: result.総合所見 || { 総合判定: null, 医師の所見: null },
    }

    set({
      ocrResult: normalizedResult,
      error: null,
      isProcessing: false,
    })
    console.log('[OCRResultStore] OCR結果を設定しました', normalizedResult)
  },

  /**
   * 処理状態を設定
   */
  setProcessing: (isProcessing) => {
    set({ isProcessing })
  },

  /**
   * エラーを設定
   */
  setError: (error) => {
    // When setting an actual error, also end processing. If null, just clear error.
    if (error) {
      set({ error, isProcessing: false })
    } else {
      set({ error: null })
    }
  },

  /**
   * Clear error without touching processing state
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * 受診者情報を更新
   */
  updatePatientInfo: (name, date) => {
    set((state) => {
      if (!state.ocrResult) return state

      return {
        ocrResult: {
          ...state.ocrResult,
          受診者情報: {
            氏名: name,
            受診日: date,
          },
        },
      }
    })
    console.log('[OCRResultStore] 受診者情報を更新しました')
  },

  /**
   * 検査項目を更新
   */
  updateExaminationItem: (index, item) => {
    set((state) => {
      if (!state.ocrResult) return state

      const currentItems = state.ocrResult.検査結果 ?? []
      if (!currentItems[index]) return state

      const newItems = [...currentItems]
      newItems[index] = item

      return {
        ocrResult: {
          ...state.ocrResult,
          検査結果: newItems,
        },
      }
    })
    console.log('[OCRResultStore] 検査項目を更新しました:', index)
  },

  /**
   * 検査項目を追加
   */
  addExaminationItem: (item) => {
    set((state) => {
      if (!state.ocrResult) return state

      const currentItems = state.ocrResult.検査結果 ?? []

      return {
        ocrResult: {
          ...state.ocrResult,
          検査結果: [...currentItems, item],
        },
      }
    })
    console.log('[OCRResultStore] 検査項目を追加しました')
  },

  /**
   * 検査項目を削除
   */
  deleteExaminationItem: (index) => {
    set((state) => {
      if (!state.ocrResult) return state

      const currentItems = state.ocrResult.検査結果 ?? []
      const newItems = currentItems.filter((_, i) => i !== index)

      return {
        ocrResult: {
          ...state.ocrResult,
          検査結果: newItems,
        },
      }
    })
    console.log('[OCRResultStore] 検査項目を削除しました:', index)
  },

  /**
   * 結果をクリア
   */
  clearResult: () => {
    set({
      ocrResult: null,
      error: null,
      isProcessing: false,
    })
    console.log('[OCRResultStore] 結果をクリアしました')
  },
}))
