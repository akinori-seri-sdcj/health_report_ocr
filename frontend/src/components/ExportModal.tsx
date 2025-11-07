// Stub: Unwired export modal UI (no implementation per spec)
import React from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm?: (
    format: 'xlsx' | 'csv',
    scope: 'filtered' | 'selected' | 'all',
    encoding?: 'utf-8' | 'shift_jis'
  ) => void
  onCancel?: () => void
  defaultFormat?: 'xlsx' | 'csv'
  busy?: boolean
}

export const ExportModal: React.FC<Props> = ({ open, onClose, onConfirm, onCancel, defaultFormat = 'xlsx', busy = false }) => {
  if (!open) return null
  const [format, setFormat] = React.useState<'xlsx' | 'csv'>(defaultFormat)
  const [scope, setScope] = React.useState<'filtered' | 'selected' | 'all'>('filtered')
  const [encoding, setEncoding] = React.useState<'utf-8' | 'shift_jis'>('utf-8')
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 8,
          width: '90%',
          maxWidth: 520,
          padding: 16,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>Export Options</div>
        <div style={{ marginTop: 12, color: '#000' }}>
          <strong>Format</strong>
          <label style={{ marginLeft: 12 }}>
            <input disabled={busy} type="radio" name="fmt" value="xlsx" checked={format==='xlsx'} onChange={() => setFormat('xlsx')} /> Excel (.xlsx)
          </label>
          <label style={{ marginLeft: 12 }}>
            <input disabled={busy} type="radio" name="fmt" value="csv" checked={format==='csv'} onChange={() => setFormat('csv')} /> CSV (.csv)
          </label>
        </div>
        <div style={{ marginTop: 12, color: '#000' }}>
          <strong>Scope</strong>
          <label style={{ marginLeft: 12 }}>
            <input disabled={busy} type="radio" name="scope" value="filtered" checked={scope==='filtered'} onChange={() => setScope('filtered')} /> Filtered rows (default)
          </label>
          <label style={{ marginLeft: 12 }}>
            <input disabled={busy} type="radio" name="scope" value="selected" checked={scope==='selected'} onChange={() => setScope('selected')} /> Selected rows only
          </label>
        </div>
        {format === 'csv' && (
          <div style={{ marginTop: 12, color: '#000' }}>
            <strong>Encoding</strong>
            <label style={{ marginLeft: 12 }}>
              <input disabled={busy} type="radio" name="enc" value="utf-8" checked={encoding==='utf-8'} onChange={() => setEncoding('utf-8')} /> UTF-8 (default)
            </label>
            <label style={{ marginLeft: 12 }}>
              <input disabled={busy} type="radio" name="enc" value="shift_jis" checked={encoding==='shift_jis'} onChange={() => setEncoding('shift_jis')} /> Shift_JIS
            </label>
          </div>
        )}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <span style={{ marginRight: 12, fontSize: 12, color: '#000' }}>
            {busy ? 'Generating file… Please wait' : ''}
          </span>
          <button disabled={busy} onClick={() => onConfirm?.(format, scope, encoding)} style={{ marginRight: 8, color: '#000' }}>Confirm</button>
          <button disabled={busy} onClick={() => { onCancel?.(); onClose(); }} style={{ marginRight: 8, color: '#000' }}>Cancel</button>
          <button disabled={busy} onClick={onClose} style={{ color: '#000' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
