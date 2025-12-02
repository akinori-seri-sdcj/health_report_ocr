/**
 * 健康診断結果の型定義（フロントエンド・バックエンド共通）
 */

// 受診者情報
export interface PatientInfo {
  氏名?: string // オプショナル: 健康診断結果に氏名が記載されていない場合がある
  受診日?: string // オプショナル: YYYY-MM-DD形式
}

// 検査項目
export interface ExaminationItem {
  項目名: string
  値: string
  単位: string | null
  判定: string | null
}

// 総合所見
export interface OverallFindings {
  総合判定: string | null
  医師の所見: string | null
}

// 健康診断結果全体
export interface HealthReportData {
  受診者情報: PatientInfo
  検査結果: ExaminationItem[]
  総合所見: OverallFindings
}

// APIリクエスト
export interface ProcessHealthReportRequest {
  images: File[] | Array<{ buffer?: unknown; mimetype?: string; originalname?: string; size?: number }>
}

// APIレスポンス
export interface ProcessHealthReportResponse {
  success: boolean
  data?: HealthReportData
  error?: {
    message: string
    code: string
  }
}

// Excel出力形式（縦持ち）
export interface ExcelRow {
  氏名: string | null
  受診日: string | null
  検査項目: string
  値: string
  単位: string | null
  判定: string | null
}
