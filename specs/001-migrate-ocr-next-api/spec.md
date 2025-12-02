# Feature Specification: 健康診断OCR API Routes移行

**Feature Branch**: `001-migrate-ocr-next-api`  
**Created**: 2025-11-28  
**Status**: Draft  
**Input**: User description: "AIへの指示プロンプト：健康診断OCR機能のNext.js API Routes移行【前提条件】 現在はReactフロントエンドと独自のExpressサーバー（server.js 等）を組み合わせた構成でOCR機能を実装していますが、Vercelへのデプロイ時にサーバーが正しく動作しない問題が発生しています。 この問題を解決するため、Expressサーバーを廃止し、Next.jsの標準機能である「API Routes」へバックエンドロジックを移行します。 【タスクの目的】 Vercel（サーバーレス環境）上でOCR機能が正常に動作するアーキテクチャへ変更する。 【実行ステップ】"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 健康診断書のOCR結果を受け取る (Priority: P1)

利用者として、健康診断書の画像をアップロードすると、待たずにOCR結果が返ってきて内容を確認できる。

**Why this priority**: OCR結果が得られないとサービスの主目的が達成できず、Vercel上での安定稼働が最重要となるため。

**Independent Test**: デプロイ済み環境からサンプルの健康診断書画像を送信し、規定のフィールドが埋まった結果が返ることを単体で確認できる。

**Acceptance Scenarios**:

1. **Given** Vercelにデプロイされた環境で、**When** 利用者がサポートされる形式・サイズの健康診断書画像をアップロードする、**Then** OCR結果がタイムアウトせずに返却され、主要フィールド（例: 受診者名、検査日、主要検査値）が表示される。
2. **Given** OCR処理で解析不能な箇所がある場合、**When** 利用者がアップロードを行う、**Then** 不明箇所は明示しつつも処理が失敗せず部分的な結果が返る。

---

### User Story 2 - デプロイ後の稼働確認を行う (Priority: P2)

運用担当として、Vercelにデプロイした直後に疎通テストを実行し、OCR APIがエラーなく呼び出せることを確認したい。

**Why this priority**: デプロイ時のサーバーレス特有の制約で機能停止が起きやすく、早期検知がビジネス継続に直結するため。

**Independent Test**: ステージング/本番の各環境でヘルスチェックとテスト画像送信を行い、レスポンスが規定時間内かつ期待フォーマットで返ることを検証できる。

**Acceptance Scenarios**:

1. **Given** 新しいリリースをVercelへ反映した直後、**When** テスト用のOCR呼び出しを行う、**Then** HTTPエラーが発生せず、結果フォーマットと主要フィールドが返る。

---

### User Story 3 - エラー時のフォールバックを把握する (Priority: P3)

運用担当として、OCRが外部サービス障害や入力不備で失敗したときに、利用者へ分かりやすい案内を返し、原因を特定できるログが残るようにしたい。

**Why this priority**: エラー原因を迅速に把握しないと復旧が遅れ、ユーザー体験と信頼性が低下するため。

**Independent Test**: 意図的に無効な入力や外部サービス不通を模擬し、ユーザー向けメッセージと内部ログが期待通りに生成されるか単体で検証できる。

**Acceptance Scenarios**:

1. **Given** サポート外形式や過大サイズのファイルを送信する、**When** OCR APIを呼び出す、**Then** 処理が拒否され、ユーザー向けに原因と再試行条件を含むメッセージが表示される。
2. **Given** 外部OCRサービスが一時的に応答しない、**When** APIが処理を試行する、**Then** 規定回数のリトライ後にタイムアウトし、利用者へ案内メッセージを返しつつ、運用調査用にタイムアウト原因とトレースIDが記録される。

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- アップロードされた画像が最大許容サイズを超える、または非対応の拡張子である。
- OCR外部サービスがダウン・高遅延・レートリミットを返す。
- 必要な環境変数や認証情報が未設定のままデプロイされる。
- リクエストが短時間に集中し、サーバーレス実行時間の上限に達する。
- OCR結果の一部フィールドが抽出不能または不確実な信頼度で返る。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: サービスは独自サーバーに依存せず、フロントエンドから呼び出せるOCR APIエンドポイントを提供し続ける。
- **FR-002**: APIは現行と同等の入力仕様（画像形式・サイズ・必要メタデータ）を検証し、不備があれば理由を明示して拒否する。
- **FR-003**: OCR処理はサーバーレス制約内で完了し、実行時間上限を超える前に安全にタイムアウトまたはフォールバックを返す。
- **FR-004**: 返却するOCR結果のフィールド構造と値のフォーマットは現行フロントエンドが解釈できる形式を維持する。
- **FR-005**: エラー時にはユーザー向けに再試行可否・入力見直しポイントを含むメッセージを返し、同時に運用調査用のトレース情報を記録する。
- **FR-006**: 環境ごとの機密情報（APIキー・エンドポイントURLなど）は環境変数経由で設定でき、欠落時はデプロイ/起動時に検知される。
- **FR-007**: デプロイ後のヘルスチェックおよび疎通テストを実行できる仕組み（軽量な確認エンドポイントまたはテストジョブ）を備える。

### Key Entities *(include if feature involves data)*

- **OCRリクエスト**: 利用者が送信する健康診断書画像と付随メタデータ（例: ファイル名、サイズ、送信時刻、認証情報）。
- **OCR結果**: 抽出されたテキストと構造化フィールド（受診者情報、検査日、主要検査値、信頼度、未抽出項目の状態フラグ）。

**Dependencies / Assumptions**:

- 既存のOCRエンジンおよびAPIキーは引き続き利用可能で、サーバーレス環境から到達できる。
- フロントエンドの入力・表示仕様は現行を維持し、APIレスポンス構造に互換性が必要。
- デプロイ先はサーバーレス実行環境であり、環境変数による設定注入が可能。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: サンプル健康診断書でのOCRリクエストの90%以上が10秒以内に完了し、ユーザーへ結果が表示される。
- **SC-002**: サーバーレス環境へのデプロイ後の初回疎通テストで、HTTP 5xx/デプロイ起因エラーの発生率が0%である。
- **SC-003**: 現行比でOCR主要フィールドの抽出精度に回帰が生じず（±1%以内）、QA比較テストで差分が許容範囲内に収まる。
- **SC-004**: エラー応答の95%以上でユーザーが取れる次のアクション（再試行・入力修正・サポート連絡先）が明記され、運用ログに原因特定に足るトレース情報が残る。
