# Data Model: OCR 読み取り元画像の上部表示（確認・編集）

## Entities

- SourceImage (existing)
  - pageCount: number
  - dimensions: { width: number; height: number } (optional/if known)
  - urls/blobs: existing `currentImages` を使用（実装はフロントのストア）

- ViewerState (new, client-side)
  - zoom: number (min 0.5, max 2.0, default 1.0)
  - pan: { x: number; y: number } (default {0,0})
  - pageIndex: number (default 0)
  - heightPreset: '30vh' | '40vh' | '50vh' (default '40vh', mobile default相当 35vh は実装で分岐)
  - visible: boolean (default true)
  - persistedScope: 'session-record'（同一レコードの確認中セッションに限定）

- ReviewSession (existing)
  - currentImages: SourceImage[]
  - imagePaneVisible: boolean
  - sessionId: string

## Relationships
- ReviewSession 1 — * SourceImage（撮影/アップロード順）
- ViewerState は ReviewSession + Record のキーで参照（永続化は不要、セッション内のみ）

## Validation Rules
- zoom ∈ [0.5, 2.0]
- pageIndex ∈ [0, pageCount-1]
- heightPreset ∈ {30vh, 40vh, 50vh}
- visible は結果編集と独立して切替可

## State Transitions
- Reset View: zoom=1.0, pan=(0,0)
- Page Change: pageIndex±1、Reset Viewを同時適用
- Toggle Visibility: visible ↔︎ !visible（結果表示は維持）
- Height Preset Change: heightPreset ∈ プリセット、セッション内保持
