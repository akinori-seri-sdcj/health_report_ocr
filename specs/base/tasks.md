# Tasks: OCR 読み取り元画像の上部表示（確認・編集）

## Phase 1 — Setup

- [X] T001 Ensure active spec pointer is correct in specs/base/spec.md
- [X] T002 Update plan summary and context in specs/base/plan.md

## Phase 2 — Foundational (blocking)

- [X] T003 Implement viewer state slice (zoom/pan/pageIndex/heightPreset) in frontend/src/store/sessionStore.ts
- [X] T004 [P] Expose viewer state setters/selectors in frontend/src/store/sessionStore.ts
- [X] T005 [P] Add keyboard handlers (±, 0, ←, →) support in frontend/src/components/ImagePreview.tsx

## Phase 3 — User Story 1 (P1): 画像を参照しながら結果を確認・編集できる（縦配置）

Goal: 上部 sticky 画像ペイン（fit‑width, 40vh/35vh, 独立スクロール）と下部結果の縦配置。右上ツールバー（ズーム±/リセット、前/次、ページ表示）。高さは 30/40/50vh プリセット切替が可能。
Independent Test: 画像が上部に横幅フィットで表示され、ツールバーでページ前後・倍率調整・リセットができる。高さプリセットを切替可能。横スクロールは発生しない。

- [X] T006 [US1] Implement sticky top image pane container in frontend/src/pages/ConfirmEditPage.tsx
- [X] T007 [P] [US1] Fit image to width (object-contain) in viewer; ensure independent scroll in frontend/src/components/ImagePreview.tsx
- [X] T008 [P] [US1] Add top-right toolbar (zoom ±, reset, prev/next, page indicator) in frontend/src/components/ImagePreview.tsx
- [X] T009 [P] [US1] Add height preset switcher (30/40/50vh) with session persistence in frontend/src/pages/ConfirmEditPage.tsx
- [X] T010 [US1] Wire page array and index to viewer (pages/pageIndex/onPageChange) in frontend/src/pages/ConfirmEditPage.tsx

## Phase 4 — User Story 2 (P2): 細部を拡大して読みやすくする（ズーム・パン・復元）

Goal: 50%–200%のズーム、パン境界制御、リセット、セッション内復元（同一レコード内）。
Independent Test: 200%までの拡大が可能で、背景が露出しないパンができる。リセットでfitへ戻る。同一セッション内の再訪で倍率/位置が復元される。

- [X] T011 [US2] Enforce zoom range 0.5–2.0 and maintain crispness in frontend/src/components/ImagePreview.tsx
- [X] T012 [P] [US2] Implement pan bounding within image bounds in frontend/src/components/ImagePreview.tsx
- [X] T013 [P] [US2] Persist and restore zoom/pan by session+record in frontend/src/pages/ConfirmEditPage.tsx
- [X] T014 [US2] Add visible “Reset” control and ensure returns to fit‑width in frontend/src/components/ImagePreview.tsx

## Phase 5 — User Story 3 (P3): 必要に応じてワークスペースを広げる（表示/非表示）

Goal: 画像ペインの表示/非表示を切替、同一セッション内で保持。
Independent Test: トグルで画像ペインの表示/非表示が切替り、同一セッションで状態が保持される。結果編集は継続可能。

- [X] T015 [US3] Add show/hide toggle control in frontend/src/pages/ConfirmEditPage.tsx
- [X] T016 [P] [US3] Persist visibility per sessionId using store setter in frontend/src/pages/ConfirmEditPage.tsx

## Final Phase — Polish & Cross-Cutting

- [ ] T017 Add aria-labels and keyboard focus order for toolbar buttons in frontend/src/components/ImagePreview.tsx
- [ ] T018 [P] Ensure no horizontal page scroll and adjust container CSS if needed in frontend/src/index.css
- [ ] T019 [P] Log first-image visible time (basic performance marker) in frontend/src/pages/ConfirmEditPage.tsx

## Dependencies

- US1 → US2（ズーム/パンの復元はUS1のレイアウト/ツールバー前提）
- US1 → US3（表示/非表示対象はUS1の画像ペイン）

## Parallel Execution Examples

- In Phase 3, T007/T008/T009 can proceed in parallel（別ファイル or 独立箇所）
- In Phase 4, T012/T014はT011と並行可能（パン境界/リセットUIと倍率ロジックの分離）
- In Final Phase, T018/T019も並行可能

## Implementation Strategy (MVP first)

- MVP: Phase 3（US1）の完了を以って一旦リリース（sticky上部ペイン、ツールバー、ページ前後、fit‑width、プリセット高さ）。
- Increment 2: Phase 4（US2）のズーム/パン/復元で操作性向上。
- Increment 3: Phase 5（US3）の表示/非表示トグルと最終Polish。
