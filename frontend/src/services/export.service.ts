// Stub: Export orchestration
// Note: Implementation intentionally omitted. Do not trigger downloads in this build.

export type ExportScope = 'all' | 'filtered' | 'selected'

export type ExportDataset = {
  headers: string[]
  rows: Record<string, unknown>[]
}

import { useOCRResultStore } from '../store/ocrResultStore'
import { buildDefaultColumns } from '../types/export'
import { buildCsvBlob } from './csv.service'
import { buildExcelFile } from './excel.service'
import { buildExportFilename } from './filename.service'

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

export function buildFilename(
  sessionId: string,
  ext: 'xlsx' | 'csv',
  now: Date = new Date()
): string {
  // Per spec: health-report-<yyyyMMdd-HHmmss>-<session-id>.<ext>
  const yyyy = now.getFullYear()
  const MM = pad2(now.getMonth() + 1)
  const dd = pad2(now.getDate())
  const HH = pad2(now.getHours())
  const mm = pad2(now.getMinutes())
  const ss = pad2(now.getSeconds())
  const ts = `${yyyy}${MM}${dd}-${HH}${mm}${ss}`
  const safeSession = (sessionId || 'session').replace(/[^a-zA-Z0-9_-]/g, '')
  return `health-report-${ts}-${safeSession}.${ext}`
}

export function extractDataset(
  scope: ExportScope,
  selectedIndices?: number[]
): ExportDataset {
  const ocr = useOCRResultStore.getState().ocrResult
  if (!ocr) return { headers: [], rows: [] }
  const columns = buildDefaultColumns()
  let headers = columns.filter(c => c.visible).sort((a,b)=>a.order-b.order).map(c=>c.label)

  const name = ocr.受診者情報?.氏名 ?? ''
  const date = ocr.受診者情報?.受診日 ?? ''
  const items = (ocr.検査結果 ?? []) as Array<{ 項目名: string; 値: string; 単位: string | null; 判定: string | null }>
  const chosen = scope === 'selected' && selectedIndices && selectedIndices.length > 0
    ? selectedIndices.map((i) => items[i]).filter((x) => !!x)
    : items
  const rows = chosen.map((it) => {
    const split = splitValueAndUnit(it.値, it.単位)
    const valueOnly = split.value
    const unitOnly = split.unit
    return {
      氏名: name,
      受診日: date,
      項目名: it.項目名,
      値: valueOnly,
      単位: unitOnly,
      '値（単位）': `${valueOnly}${unitOnly}`,
      判定: it.判定 ?? '',
      総合判定: (ocr as any).総合所見?.総合判定 ?? '',
      医師の所見: (ocr as any).総合所見?.医師の所見 ?? '',
    }
  })

  const filteredRows = rows.map((r) => {
    const obj: Record<string, unknown> = {}
    headers.forEach((h) => { obj[h] = (r as any)[h] })
    return obj
  })
  return { headers, rows: filteredRows }
}

export async function exportData(
  format: 'xlsx' | 'csv' = 'xlsx',
  scope: ExportScope = 'filtered',
  encoding?: 'utf-8' | 'shift_jis',
  selectedIndices?: number[]
): Promise<void> {
  const { ocrResult } = useOCRResultStore.getState()
  if (!ocrResult) throw new Error('No OCR results to export')
  const ds = extractDataset(scope, selectedIndices)
  const rowCount = ds.rows.length
  if (rowCount > 50000) {
    throw new Error('Export exceeds 50,000 rows. Please narrow filters or selection.')
  }
  const base = ocrResult?.受診者情報?.氏名?.trim() || 'HealthReport'
  if (format === 'csv') {
    const blob = await buildCsvBlob(ds, encoding ?? 'utf-8')
    const filename = buildExportFilename(base, 'csv')
    triggerDownload(blob, filename)
    return
  }
  // Excel
  const xblob = await buildExcelFile(ds)
  const xname = buildExportFilename(base, 'xlsx')
  triggerDownload(xblob, xname)
}

export type ExportEventOutcome = 'completed' | 'canceled' | 'failed'

export type ExportEvent = {
  timestamp: string
  userId?: string
  sessionId?: string
  format: 'xlsx' | 'csv'
  scope: ExportScope
  recordCount: number
  outcome: ExportEventOutcome
  reason?: string
}

// Placeholder: emit event locally (no-op)
export function emitExportEvent(_evt: ExportEvent): void {
  // no-op placeholder; do not implement
}

// Placeholder: optionally post to backend audit endpoint (no-op)
export async function postAuditEvent(_evt: ExportEvent): Promise<void> {
  // no-op placeholder; do not implement
  throw new Error('Not implemented: postAuditEvent')
}

// TODO(perf): For large datasets, consider chunking row serialization (e.g., 1k rows per slice)
// TODO(perf): Optionally offload CSV building/encoding to a Web Worker if main-thread jank > 100ms

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Helper: ensure 値 does not include 単位. Extract numeric part and unit suffix.
function splitValueAndUnit(rawValue: unknown, rawUnit: string | null | undefined): { value: string; unit: string } {
  let value = (rawValue ?? '').toString().trim()
  let unit = (rawUnit ?? '').toString().trim()

  // If unit missing, try to infer from value (e.g., "159.3cm", "120mg/dL", "98%")
  if (!unit) {
    const m = value.match(/^\s*([+-]?(?:\d+|\d{1,3}(?:,\d{3})*)(?:[\.,]\d+)?)\s*(.+)?$/)
    if (m) {
      let num = m[1] ?? ''
      let tail = (m[2] ?? '').trim()
      // normalize decimal comma to dot and remove thousands commas
      num = num.replace(/,/g, '')
      // If tail looks like a unit (letters/symbols), adopt it
      if (tail && /[a-zA-Zぁ-んァ-ン一-龥%\/°μmgdLcmmmHg]+/.test(tail)) {
        unit = tail
        value = num
      }
    }
  } else {
    // If value ends with the unit, strip it
    const escapedUnit = unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`^\s*([+-]?(?:\\d+|\\d{1,3}(?:,\\d{3})*)(?:[\\.,]\\d+)?)\s*${escapedUnit}\s*$`)
    const m2 = value.match(re)
    if (m2) {
      let num = m2[1] ?? ''
      num = num.replace(/,/g, '')
      value = num
    }
  }

  // Final normalization: convert decimal comma to dot
  value = value.replace(',', '.')
  return { value, unit }
}
