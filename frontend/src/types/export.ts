export type ExportFormat = 'csv' | 'xlsx'
export type ExportScope = 'filtered' | 'selected'
export type ExportEncoding = 'utf-8' | 'shift_jis'

export type ColumnDef = {
  key: string
  label: string
  visible: boolean
  order: number
}

export type ExportOptions = {
  format: ExportFormat
  scope: ExportScope
  encoding?: ExportEncoding // CSV only
  filenameBase?: string
}

export type ExportRequest = {
  options: ExportOptions
  columns: ColumnDef[]
  // Each row is a map of column key to value
  rows: Record<string, unknown>[]
  requestedAt: string // ISO timestamp
  requestedBy?: string
}

// Mapping helpers from OCR store shape to a generic tabular dataset
export type OcrLike = {
  受診者情報?: { 氏名?: string; 受診日?: string }
  検査結果?: Array<{ 項目名: string; 値: string; 単位: string | null; 判定: string | null }>
}

export function buildDefaultColumns(): ColumnDef[] {
  return [
    { key: '氏名', label: '氏名', visible: true, order: 0 },
    { key: '受診日', label: '受診日', visible: true, order: 1 },
    { key: '項目名', label: '項目名', visible: true, order: 2 },
    { key: '値', label: '値', visible: true, order: 3 },
    { key: '単位', label: '単位', visible: true, order: 4 },
    { key: '値（単位）', label: '値（単位）', visible: true, order: 5 },
    { key: '判定', label: '判定', visible: true, order: 6 },
    { key: '総合判定', label: '総合判定', visible: true, order: 7 },
    { key: '医師の所見', label: '医師の所見', visible: true, order: 8 },
  ]
}

export function mapOcrToRows(ocr: OcrLike): Record<string, unknown>[] {
  const name = ocr.受診者情報?.氏名 ?? ''
  const date = ocr.受診者情報?.受診日 ?? ''
  const overall = (ocr as any).総合所見?.総合判定 ?? ''
  const notes = (ocr as any).総合所見?.医師の所見 ?? ''
  const items = ocr.検査結果 ?? []
  if (items.length === 0) return []
  return items.map((it) => ({
    氏名: name,
    受診日: date,
    項目名: it.項目名,
    値: it.値,
    単位: it.単位 ?? '',
    '値（単位）': `${it.値}${it.単位 ?? ''}`,
    判定: it.判定 ?? '',
    総合判定: overall,
    医師の所見: notes,
  }))
}
