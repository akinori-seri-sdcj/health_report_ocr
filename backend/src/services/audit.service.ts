// Placeholder service for export audit logging (not implemented)

export type AuditEvent = {
  timestamp: string
  userId?: string
  sessionId?: string
  format: 'xlsx' | 'csv'
  scope: 'all' | 'filtered'
  recordCount: number
  outcome: 'completed' | 'canceled' | 'failed'
  reason?: string
}

export async function saveAuditEvent(_evt: AuditEvent): Promise<void> {
  // Not implemented
  throw new Error('Not implemented: saveAuditEvent')
}

