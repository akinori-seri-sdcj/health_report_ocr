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

  // 確認・編集画面の画像ペイン表示（セッション単位で保持）
  imagePaneVisible: boolean

  // 画像ビューア状態（同一レコードの確認中セッションで保持）
  viewerState?: {
    zoom: number
    pan: { x: number; y: number }
    pageIndex: number
    heightPreset: '30vh' | '40vh' | '50vh'
  }

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
  // 画像ペイン表示切り替え（セッション単位永続）
  setImagePaneVisible: (visible: boolean) => void

  // Viewer state setters/selectors
  loadViewerState: () => void
  resetViewerState: () => void
  setViewerZoom: (zoom: number) => void
  setViewerPan: (pan: { x: number; y: number }) => void
  setViewerPageIndex: (index: number) => void
  setViewerHeightPreset: (preset: '30vh' | '40vh' | '50vh') => void
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
  imagePaneVisible: true,
  viewerState: undefined,
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
        imagePaneVisible: (() => {
          try {
            const v = localStorage.getItem(`imagePaneVisible:${sessionId}`)
            if (v === 'true') return true
            if (v === 'false') return false
          } catch {}
          return true
        })(),
        viewerState: (() => {
          try {
            const raw = localStorage.getItem(`viewerState:${sessionId}`)
            if (raw) {
              const parsed = JSON.parse(raw)
              // basic shape guard
              if (
                typeof parsed?.zoom === 'number' &&
                parsed?.pan && typeof parsed.pan.x === 'number' && typeof parsed.pan.y === 'number' &&
                typeof parsed?.pageIndex === 'number' &&
                (parsed?.heightPreset === '30vh' || parsed?.heightPreset === '40vh' || parsed?.heightPreset === '50vh')
              ) {
                return parsed
              }
            }
          } catch {}
          return { zoom: 1, pan: { x: 0, y: 0 }, pageIndex: 0, heightPreset: '40vh' as const }
        })(),
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
  // 画像ペイン表示切り替え（セッション単位永続）
  setImagePaneVisible: (visible: boolean) => {
    const { currentSession } = get()
    set({ imagePaneVisible: visible })
    try {
      if (currentSession) {
        localStorage.setItem(`imagePaneVisible:${currentSession.id}`, String(visible))
      }
    } catch {}
  },

  // Viewer state helpers
  loadViewerState: () => {
    const { currentSession } = get()
    if (!currentSession) return
    try {
      const raw = localStorage.getItem(`viewerState:${currentSession.id}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        set({ viewerState: parsed })
      }
    } catch {}
  },
  resetViewerState: () => {
    const base = { zoom: 1, pan: { x: 0, y: 0 }, pageIndex: 0, heightPreset: '40vh' as const }
    set({ viewerState: base })
    const { currentSession } = get()
    try { if (currentSession) localStorage.setItem(`viewerState:${currentSession.id}`, JSON.stringify(base)) } catch {}
  },
  setViewerZoom: (zoom) => {
    const { viewerState, currentSession } = get()
    const next = { ...(viewerState || { zoom: 1, pan: { x: 0, y: 0 }, pageIndex: 0, heightPreset: '40vh' as const }), zoom }
    set({ viewerState: next })
    try { if (currentSession) localStorage.setItem(`viewerState:${currentSession.id}`, JSON.stringify(next)) } catch {}
  },
  setViewerPan: (pan) => {
    const { viewerState, currentSession } = get()
    const next = { ...(viewerState || { zoom: 1, pan: { x: 0, y: 0 }, pageIndex: 0, heightPreset: '40vh' as const }), pan }
    set({ viewerState: next })
    try { if (currentSession) localStorage.setItem(`viewerState:${currentSession.id}`, JSON.stringify(next)) } catch {}
  },
  setViewerPageIndex: (index) => {
    const { viewerState, currentSession } = get()
    const next = { ...(viewerState || { zoom: 1, pan: { x: 0, y: 0 }, pageIndex: 0, heightPreset: '40vh' as const }), pageIndex: index }
    set({ viewerState: next })
    try { if (currentSession) localStorage.setItem(`viewerState:${currentSession.id}`, JSON.stringify(next)) } catch {}
  },
  setViewerHeightPreset: (preset) => {
    const { viewerState, currentSession } = get()
    const next = { ...(viewerState || { zoom: 1, pan: { x: 0, y: 0 }, pageIndex: 0, heightPreset: '40vh' as const }), heightPreset: preset }
    set({ viewerState: next })
    try { if (currentSession) localStorage.setItem(`viewerState:${currentSession.id}`, JSON.stringify(next)) } catch {}
  },
}))







