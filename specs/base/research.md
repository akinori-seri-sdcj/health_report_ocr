# Research: OCR 読み取り元画像の上部表示（確認・編集）

## Decisions

- Decision: 縦配置＋上部sticky（40vh/35vh）＋fit‑width＋独立スクロール
  - Rationale: 常時参照性（上部固定）と見比べやすさ（幅優先表示）を両立。横スクロールを排除し、編集効率を高める。
  - Alternatives considered:
    - Side-by-side（左右表示）: デスクトップは良いが狭幅で圧迫。縦配置に統一。
    - Fit-height 優先: 横スクロールや小さすぎ問題が増える。

- Decision: 高さは3段階プリセット（30/40/50vh）、セッション内保持
  - Rationale: ドラッグリサイズより実装・操作が単純で崩れにくい。A11y面でも明快。
  - Alternatives considered:
    - ドラッグリサイズ: 柔軟だが誤操作/複雑化リスク。
    - 固定のみ: 画面/画像多様性に弱い。

- Decision: ツールバーは画像ペイン内 右上（ズーム±/リセット、前/次、KB対応）
  - Rationale: 近接配置で操作負担を低減。既存 `ImagePreview` のUIとも整合。
  - Alternatives considered:
    - 画面ヘッダー集約: 視線移動が増える。
    - ホバー時のみ表示: モバイル/KB操作で不利。

- Decision: ページ切替は「前/次」＋中央にページ表示（例: 2 / 5）
  - Rationale: 直感的で省スペース。モバイルにも適合。
  - Alternatives considered:
    - サムネイル一覧: 面積コスト大。
    - ドロップダウン: 操作段数が増える。

- Decision: ズーム/パン/ページ/高さプリセットは同一レコードの確認中セッションで保持
  - Rationale: 連続作業の快適性を確保。セッションを跨いだ永続化は不要。
  - Alternatives considered:
    - 永続保存（localStorage）: 共有端末/権限境界の懸念。

## Notes
- Backend API 追加は不要。既存 `/api/health-report` POST のみで足りる。
- A11y/パフォーマンス要件は Spec のFR/SCに準拠。
