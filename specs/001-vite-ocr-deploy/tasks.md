# Tasks: API Routes配信とViteフロント統合デプロイ

## Phase 1 – Setup
- [X] T001 確認: 技術コンテキストと構成が plan に反映されていることを点検する（specs/001-vite-ocr-deploy/plan.md）

## Phase 2 – Foundational
- [X] T002 [P] OCR APIコントラクトを現行エンドポイント仕様と整合確認・必要に応じて更新する（specs/001-vite-ocr-deploy/contracts/ocr-api.yaml）

## Phase 3 – User Story 1 (フロントから同一ドメインAPIを利用)
- [X] T003 [P] [US1] Viteビルドのbaseを`/ui/`に設定し、同一オリジンAPIを呼ぶためのプロキシを確認する（frontend/vite.config.ts）
- [X] T004 [P] [US1] Routerのbasenameをサブパス配信(`/ui/`)に対応させ、リンクを`Link`コンポーネントに統一する（frontend/src/App.tsx）
- [X] T005 [US1] APIクライアントを同一オリジン`/api/ocr`デフォルト＆エラー表示を明確にする（frontend/src/api/healthReportApi.ts）
- [X] T006 [US1] アップロード画面でOCRエラー時に利用者へ原因を提示するUIを実装する（frontend/src/pages/ConfirmEditPage.tsx）
- [X] T007 [US1] `/ui/`配信時のリロード/直リンクで404にならないようリライトを設定する（next.config.js）

## Phase 4 – User Story 2 (デプロイ後の健全性確認)
- [X] T008 [US2] ヘルスチェックレスポンスで設定有無・外部依存の状態を判別できるようメッセージを整備する（app/api/ocr/health/route.ts）
- [X] T009 [P] [US2] ランディングにヘルスチェック導線と状態表示を追加し、運用確認を容易にする（app/page.tsx）

## Phase 5 – User Story 3 (単一ビルドで両方を提供)
- [X] T010 [US3] 単一ビルドでVite成果物を`public/ui/`へコピーしNextビルドまで行うスクリプト/コマンドを整備する（package.json; scripts/sync-frontend.js）
- [X] T011 [P] [US3] `public/ui/`のgit除外と手順書更新で手動コピー不要を明示する（.gitignore; README.md）
- [X] T012 [US3] デプロイ設定を単一コマンドに揃え、出力先`.next`を宣言する（vercel.json）

## Phase 6 – Polish & Cross-cutting
- [X] T013 [P] クイックスタートを最新ビルド/検証手順に同期させる（specs/001-vite-ocr-deploy/quickstart.md）

## Dependencies (Story Order)
- 完了順序: US1 → US2 → US3（US1がフロント/リライト前提、US2はAPI健全性確認、US3で単一ビルド/デプロイ統合）

## Parallel Execution Examples
- US1内: T003 と T004 は並列可（Vite設定とRouter修正が独立）、完了後にT005/T006/T007を進行
- US2内: T009を先行でUI導線追加しつつ、T008でレスポンス文言を整備
- US3内: T010とT011は並列可（ビルドスクリプトとドキュメント/ignore）、T012はビルドコマンド確定後に実施

## Independent Test Criteria
- US1: `/ui/`から画像送信で同一ドメイン`/api/ocr`が成功し、エラー時も原因が表示される
- US2: `/api/ocr/health`が設定状態を返し、ランディング導線から確認できる
- US3: `npm run build` でフロント+APIが一括生成され、デプロイ後 `/ui/` と `/api/ocr` が手動コピーなしで動作する

## Implementation Strategy
- MVP: US1を最優先で実装（同一ドメイン配信とエラー表示まで完結）
- その後US2で運用確認性を高め、US3でビルド/デプロイを一体化して作業コストとヒューマンエラーを削減
