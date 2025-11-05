// Excel generation helpers

export type ExportDataset = {
  headers: string[]
  rows: Record<string, unknown>[]
}

export async function buildExcelFile(data: ExportDataset): Promise<Blob> {
  // exceljs ESM import works in Vite builds
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Export')

  // Header
  sheet.addRow(data.headers)
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  // Data rows
  for (const row of data.rows) {
    const arr = data.headers.map((h) => (row as any)[h])
    sheet.addRow(arr)
  }

  // Auto-width roughly by header length
  data.headers.forEach((h, i) => {
    const col = sheet.getColumn(i + 1)
    const len = Math.max(
      h?.toString().length || 0,
      ...col.values.slice(2).map((v: any) => (v ? v.toString().length : 0))
    )
    col.width = Math.min(Math.max(10, len + 2), 40)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
