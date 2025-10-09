import Dexie, { Table } from 'dexie'

/**
 * 撮影した画像データ
 */
export interface CapturedImage {
  id?: number // 自動採番ID
  sessionId: string // セッションID（同じ健康診断結果の画像をグループ化）
  imageData: Blob // 画像のBlob
  timestamp: number // 撮影日時（UnixTime）
  order: number // 表示順序（0から開始）
}

/**
 * 撮影セッション
 */
export interface Session {
  id: string // セッションID（UUID）
  createdAt: number // 作成日時（UnixTime）
  updatedAt: number // 更新日時（UnixTime）
  imageCount: number // 画像枚数
  status: 'draft' | 'processing' | 'completed' // ステータス
}

/**
 * IndexedDB データベース
 */
export class HealthReportDB extends Dexie {
  images!: Table<CapturedImage, number>
  sessions!: Table<Session, string>

  constructor() {
    super('HealthReportDB')

    // スキーマ定義
    this.version(1).stores({
      images: '++id, sessionId, timestamp, order',
      sessions: 'id, createdAt, updatedAt, status',
    })
  }
}

// シングルトンインスタンス
export const db = new HealthReportDB()
