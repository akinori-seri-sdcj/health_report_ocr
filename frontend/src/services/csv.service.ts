// CSV generation and encoding

export type ExportDataset = {
  headers: string[]
  rows: Record<string, unknown>[]
}

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return ''
  let str = String(value)
  // Normalize newlines to \n first
  str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const needsQuotes = /[",\n]/.test(str)
  if (needsQuotes) {
    str = '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export function buildCsvContent(data: ExportDataset): string {
  const lines: string[] = []
  lines.push(data.headers.map(escapeCsvField).join(','))
  for (const row of data.rows) {
    const fields = data.headers.map((h) => escapeCsvField((row as any)[h]))
    lines.push(fields.join(','))
  }
  // CRLF per widest compatibility
  return lines.join('\r\n') + '\r\n'
}

export async function buildCsvBlob(
  data: ExportDataset,
  encoding: 'utf-8' | 'shift_jis' = 'utf-8'
): Promise<Blob> {
  const content = buildCsvContent(data)
  if (encoding === 'shift_jis') {
    const bytes = await encodeShiftJIS('\uFEFF' + content) // include BOM for safety
    return new Blob([bytes], { type: 'text/csv; charset=shift_jis' })
  }
  // UTF-8 with BOM improves Excel compatibility
  const utf8WithBom = '\uFEFF' + content
  return new Blob([utf8WithBom], { type: 'text/csv; charset=utf-8' })
}

export async function encodeShiftJIS(text: string): Promise<Uint8Array> {
  // Lazy ESM-friendly import to avoid require() in ESM builds
  const mod: any = await import('encoding-japanese')
  const Encoding = mod?.default ?? mod
  const codes = Encoding.stringToCode(text)
  const sjis = Encoding.convert(codes, { to: 'SJIS', from: 'UNICODE' })
  return new Uint8Array(sjis)
}
