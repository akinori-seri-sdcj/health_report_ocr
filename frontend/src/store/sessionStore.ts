import { create } from 'zustand'
import { db, CapturedImage, Session } from '../db'

/**
 * セッション状態管理
 */
interface SessionState {
  // 現在のセッション
  currentSession: Session | null
  currentImages: CapturedImage[]
  // 現在のユーザーロール（簡易）
  userRoles?: string[]

  // ローディング状態
  isLoading: boolean
  error: string | null

  // アクション
  createSession: () => Promise<string>
  loadSession: (sessionId: string) => Promise<void>
  addImage: (imageData: Blob) => Promise<void>
  deleteImage: (imageId: number) => Promise<void>
  reorderImages: (fromIndex: number, toIndex: number) => Promise<void>
  clearSession: () => void
  deleteSession: (sessionId: string) => Promise<void>
  // 役割の設定（簡易）
  setUserRoles: (roles: string[]) => void
}

/**
 * UUID v4 を生成
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  currentImages: [],
  userRoles: [],
  isLoading: false,
  error: null,

  /**
   * 新しいセッションを作成
   */
  createSession: async () => {
    const sessionId = generateUUID()
    const now = Date.now()

    const newSession: Session = {
      id: sessionId,
      createdAt: now,
      updatedAt: now,
      imageCount: 0,
      status: 'draft',
    }

    await db.sessions.add(newSession)

    set({
      currentSession: newSession,
      currentImages: [],
      error: null,
    })

    console.log('[SessionStore] 新しいセッションを作成しました:', sessionId)
    return sessionId
  },

  /**
   * セッションを読み込む
   */
  loadSession: async (sessionId: string) => {
    set({ isLoading: true, error: null })

    try {
      const session = await db.sessions.get(sessionId)
      if (!session) {
        throw new Error('セッションが見つかりません')
      }

      const images = await db.images
        .where('sessionId')
        .equals(sessionId)
        .sortBy('order')

      set({
        currentSession: session,
        currentImages: images,
        isLoading: false,
      })

      console.log('[SessionStore] セッションを読み込みました:', sessionId, images.length, '枚')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'セッションの読み込みに失敗しました'
      set({ error: errorMessage, isLoading: false })
      console.error('[SessionStore] セッション読み込みエラー:', err)
    }
  },

  /**
   * 画像を追加
   */
  addImage: async (imageData: Blob) => {
    const { currentSession, currentImages } = get()

    if (!currentSession) {
      console.error('[SessionStore] セッションが存在しません')
      return
    }

    const now = Date.now()
    const order = currentImages.length

    const newImage: CapturedImage = {
      sessionId: currentSession.id,
      imageData,
      timestamp: now,
      order,
    }

    const imageId = await db.images.add(newImage)
    const addedImage = { ...newImage, id: imageId }

    // セッションの更新日時と画像枚数を更新
    await db.sessions.update(currentSession.id, {
      updatedAt: now,
      imageCount: currentImages.length + 1,
    })

    set({
      currentImages: [...currentImages, addedImage],
      currentSession: {
        ...currentSession,
        updatedAt: now,
        imageCount: currentImages.length + 1,
      },
    })

    console.log('[SessionStore] 画像を追加しました:', imageId, '（合計', currentImages.length + 1, '枚）')
  },

  /**
   * 画像を削除
   */
  deleteImage: async (imageId: number) => {
    const { currentSession, currentImages } = get()

    if (!currentSession) {
      console.error('[SessionStore] セッションが存在しません')
      return
    }

    await db.images.delete(imageId)

    const updatedImages = currentImages.filter(img => img.id !== imageId)

    // order を再割り当て
    for (let i = 0; i < updatedImages.length; i++) {
      if (updatedImages[i].id) {
        await db.images.update(updatedImages[i].id!, { order: i })
        updatedImages[i].order = i
      }
    }

    // セッションの更新日時と画像枚数を更新
    const now = Date.now()
    await db.sessions.update(currentSession.id, {
      updatedAt: now,
      imageCount: updatedImages.length,
    })

    set({
      currentImages: updatedImages,
      currentSession: {
        ...currentSession,
        updatedAt: now,
        imageCount: updatedImages.length,
      },
    })

    console.log('[SessionStore] 画像を削除しました:', imageId)
  },

  /**
   * 画像の順序を変更
   */
  reorderImages: async (fromIndex: number, toIndex: number) => {
    const { currentImages } = get()

    const reordered = [...currentImages]
    const [removed] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, removed)

    // order を再割り当て
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].id) {
        await db.images.update(reordered[i].id!, { order: i })
        reordered[i].order = i
      }
    }

    set({ currentImages: reordered })

    console.log('[SessionStore] 画像の順序を変更しました:', fromIndex, '→', toIndex)
  },

  /**
   * セッションをクリア
   */
  clearSession: () => {
    set({
      currentSession: null,
      currentImages: [],
      error: null,
    })
    console.log('[SessionStore] セッションをクリアしました')
  },

  /**
   * セッションを削除
   */
  deleteSession: async (sessionId: string) => {
    // セッションに紐づく画像を削除
    await db.images.where('sessionId').equals(sessionId).delete()

    // セッション自体を削除
    await db.sessions.delete(sessionId)

    console.log('[SessionStore] セッションを削除しました:', sessionId)
  },
  /**
   * ユーザーロールを設定（簡易）
   */
  setUserRoles: (roles: string[]) => {
    set({ userRoles: roles })
    try { localStorage.setItem('userRoles', JSON.stringify(roles)) } catch {}
  },
}))
