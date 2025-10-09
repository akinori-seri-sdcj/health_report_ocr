import { z } from 'zod'

// 受診者情報のスキーマ
export const PatientInfoSchema = z.object({
  氏名: z.string().nullable().optional(),
  受診日: z.string().nullable().optional(),
})

// 検査項目のスキーマ
export const ExaminationItemSchema = z.object({
  項目名: z.string().min(1, '項目名は必須です'),
  値: z.string().nullable().optional(),
  単位: z.string().nullable().optional(),
  判定: z.string().nullable().optional(),
})

// 総合所見のスキーマ
export const OverallFindingsSchema = z.object({
  総合判定: z.string().nullable(),
  医師の所見: z.string().nullable(),
})

// 健康診断結果全体のスキーマ
export const HealthReportDataSchema = z.object({
  受診者情報: PatientInfoSchema,
  検査結果: z.array(ExaminationItemSchema).min(1, '検査結果が必要です'),
  総合所見: OverallFindingsSchema,
})

// TypeScriptの型を生成
export type PatientInfo = z.infer<typeof PatientInfoSchema>
export type ExaminationItem = z.infer<typeof ExaminationItemSchema>
export type OverallFindings = z.infer<typeof OverallFindingsSchema>
export type HealthReportData = z.infer<typeof HealthReportDataSchema>

// バリデーション関数
export const validateHealthReportData = (data: unknown): HealthReportData => {
  return HealthReportDataSchema.parse(data)
}
