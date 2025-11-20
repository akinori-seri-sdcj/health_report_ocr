---

description: "Task list for OCR処理デプロイアーキテクチャの改善"
---

# Tasks: OCR処理デプロイアーキテクチャの改善

**Input**: Design documents from `/specs/001-ocr-deploy-architecture/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: このfeatureでは明示的なTDD指定はないため、テストタスクは最小限に留め、必要に応じて追加できる余地を残します。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: OCR用バックエンドAPIおよびフロントエンドクライアントの作業準備

- [ ] T001 環境設定ファイルのOCR関連キーを確認・整理する（例: 外部OCRサービスURLなど） `backend/src/config`
- [ ] T002 既存バックエンドのルーティング構成を確認し、OCR用API経路の設計メモを追加する `backend/src/routes`
- [ ] T003 [P] フロントエンドでOCR API呼び出し用サービスの配置先ディレクトリを確認し、READMEメモを追加する `frontend/src/services`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのユーザーストーリーに共通するOCR APIの土台を整える

**CRITICAL**: このフェーズ完了前にユーザーストーリーの実装を開始しない

- [ ] T004 OCRデータモデルに基づき、`OCRRequest` と `OCRResult` 用の型定義を作成する `backend/src/types/ocr.ts`
- [ ] T005 [P] OCR依頼ID・状態・エラーを記録するサービス層のインターフェースを定義する `backend/src/services/ocr.service.ts`
- [ ] T006 バックエンドでOCR関連の環境変数を読み込む設定ヘルパーを追加する `backend/src/config/ocrConfig.ts`
- [ ] T007 [P] 共通エラーハンドリング方針（ログに個人情報を出さない）を整理し、コメントとして記録する `backend/src/middleware/errorHandler.ts`
- [ ] T008 OCR API用の基本ルートファイルを作成し、Expressルーターにマウントする `backend/src/routes/ocr.routes.ts`

**Checkpoint**: OCR用の型・サービスインターフェース・ルートが揃い、各ユーザーストーリーから利用できる状態

---

## Phase 3: User Story 1 - 事務担当者が健康診断結果をOCRで取り込める (Priority: P1) ※MVP

**Goal**: 単一の健康診断レポートファイルをアップロードし、エラーなくOCR処理を実行して結果を画面に表示できること

**Independent Test**: テスト用ファイルを1件アップロードし、フロント画面上でエラーなくOCR結果が表示されることを確認する

### Implementation for User Story 1

- [ ] T009 [P] [US1] `POST /api/ocr` エンドポイントを実装し、ファイル受け付けと `OCRRequest` 作成を行う `backend/src/controllers/ocr.controller.ts`
- [ ] T010 [US1] `ocr.service` に実際のOCR処理呼び出しロジックを追加し、完了時に `OCRResult` を返す `backend/src/services/ocr.service.ts`
- [ ] T011 [US1] 既存の健康診断レポート処理フローにOCR呼び出しを統合する（必要であれば `processHealthReport` から委譲する） `backend/src/controllers/health-report.controller.ts`
- [ ] T012 [P] [US1] フロントエンドにOCR API呼び出しクライアントを実装する `frontend/src/services/ocrClient/index.ts`
- [ ] T013 [US1] フロントエンドの画面からOCR実行ボタンと進行中インジケータを追加する `frontend/src/pages/HealthReportOcrPage.tsx`
- [ ] T014 [US1] OCR結果の表示領域を追加し、結果が取得できた場合に画面に表示する `frontend/src/pages/HealthReportOcrPage.tsx`
- [ ] T015 [US1] 成功時と失敗時の基本的なトースト／メッセージ表示を実装する `frontend/src/components/OcrResultMessage.tsx`

**Checkpoint**: 単件の健康診断レポートについて、アップロード〜OCR実行〜結果表示までが一連の流れでエラーなく完了する

---

## Phase 4: User Story 2 - 繰り返し利用してもサービスが安定している (Priority: P2)

**Goal**: 1日に複数回・複数レポートを連続処理しても、途中でサービスが落ちたり極端に遅くなったりしないこと

**Independent Test**: 複数のテスト用ファイルを連続で処理し、全てが一定時間内に完了し、サービスが利用不能にならないことを確認する

### Implementation for User Story 2

- [ ] T016 [P] [US2] `POST /api/ocr` にリクエスト数制限やファイル枚数チェックを追加する `backend/src/controllers/ocr.controller.ts`
- [ ] T017 [US2] OCR処理時間が一定しきい値を超えた場合のタイムアウト方針とレスポンス内容を実装する `backend/src/services/ocr.service.ts`
- [ ] T018 [P] [US2] OCRリクエスト・エラー数・平均処理時間を集計できるよう、簡易的なメトリクスフックを追加する `backend/src/utils/ocrMetrics.ts`
- [ ] T019 [US2] フロントエンドで連続実行時にもUIが固まらないように、ボタン状態とローディング表示を調整する `frontend/src/pages/HealthReportOcrPage.tsx`

**Checkpoint**: 通常業務レベルの連続処理で安定して動作し、エラー率やタイムアウトが許容範囲内に収まる

---

## Phase 5: User Story 3 - システム管理者がリリース後の稼働状況を確認できる (Priority: P3)

**Goal**: リリースや設定変更の後に、OCRが正しく動いているかをシステム管理者が簡単に確認できること

**Independent Test**: 用意された確認手順に従ってテスト用ファイルでOCRを1件実行し、結果と稼働状況を確認できること

### Implementation for User Story 3

- [ ] T020 [P] [US3] OCR依頼IDと状態を一覧表示するための簡易管理用エンドポイントを追加する `backend/src/routes/ocr-admin.routes.ts`
- [ ] T021 [US3] 管理用エンドポイントで返すデータ構造（直近のOCR依頼・状態・エラー概要）を実装する `backend/src/controllers/ocr-admin.controller.ts`
- [ ] T022 [US3] 運用確認用の手順書／QuickstartにOCRの稼働チェック手順を追記する `specs/001-ocr-deploy-architecture/quickstart.md`
- [ ] T023 [P] [US3] OCR関連ログの出力方針を見直し、個人情報を含まない形で原因追跡しやすいログを残す `backend/src/utils/logger.ts`

**Checkpoint**: 管理者がリリース後にOCRの稼働状況を確認し、問題発生時に概ね切り分けができる状態

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: 横断的な改善と最終仕上げ

- [ ] T024 [P] 開発者向けドキュメントにOCR APIの利用方法と注意点を追記する `docs/ocr-api.md`
- [ ] T025 コードの簡易リファクタリングと命名・コメントの整理を行う `backend/src` / `frontend/src`
- [ ] T026 [P] 必要に応じて追加の単体テスト・統合テストを作成する `backend/tests` / `frontend/tests`
- [ ] T027 セキュリティ観点からの簡易チェック（環境変数の扱い・エラーメッセージ内容）を行う `backend/src`
- [ ] T028 Quickstart手順に沿った最終スモークテストを実施する `specs/001-ocr-deploy-architecture/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): 依存なし。最初に実施。
- Foundational (Phase 2): Setup 完了に依存。すべてのユーザーストーリーの前提。
- User Stories (Phase 3〜5): Foundational 完了に依存。US1〜US3は原則独立して実装・テスト可能。
- Polish (Final Phase): すべての対象ユーザーストーリーが完了した後に実施。

### User Story Dependencies

- User Story 1 (P1): Foundational 完了後に着手可能。他ストーリーへの依存なし（MVP）。
- User Story 2 (P2): Foundational 完了後に着手可能。US1のAPI/サービスを再利用するが、連続実行の性能・安定性にフォーカスして独立検証可能。
- User Story 3 (P3): Foundational 完了後に着手可能。US1/US2 の存在を前提に、運用可視化に特化した機能として独立検証可能。

### Within Each User Story

- サービス層・ルート・フロント実装は、それぞれ依存関係を意識しつつも、同じストーリー内で完結するように設計する。
- 各ストーリーのCheckpoint時点で、単独で動作確認可能な状態を目指す。

### Parallel Opportunities

- [P] が付いたタスクは、ファイル競合がなければ並行実行可能。
- Phase 1, 2 では T003, T005, T007, T008 などが並行候補。
- User Story 1〜3 も、チーム体制次第でフェーズ単位で並行に進められる。

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup を完了する（T001〜T003）。
2. Phase 2: Foundational を完了し、OCR APIの土台を整える（T004〜T008）。
3. Phase 3: User Story 1 のタスク（T009〜T015）を完了し、単件OCRの成功パスを確認する。
4. 必要に応じてMVPとしてデプロイ／デモを行い、現場の不安（「APIが本当に動いているか」）を解消する。

### Incremental Delivery

1. MVP（US1）で単件OCRを安定稼働させる。
2. US2で連続利用時の安定性・性能を高める。
3. US3でリリース後の稼働確認・運用可視性を追加する。
4. 最後にPolishフェーズでドキュメント・テスト・簡易セキュリティ確認を行う。

