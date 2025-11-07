function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function sanitizeBase(base: string) {
  return base.replace(/[\\/:*?"<>|\r\n]+/g, '_').trim() || 'Export'
}

export function buildExportFilename(base: string | undefined, ext: 'csv' | 'xlsx', when: Date = new Date()): string {
  const b = sanitizeBase(base ?? 'Export')
  const y = when.getFullYear()
  const m = pad(when.getMonth() + 1)
  const d = pad(when.getDate())
  const hh = pad(when.getHours())
  const mm = pad(when.getMinutes())
  const stamp = `${y}${m}${d}-${hh}${mm}`
  return `${b}_Export_${stamp}.${ext}`
}

