# Phase 0 Research: OCR処理デプロイアーキテクチャの改善

## Overview

This document resolves the NEEDS CLARIFICATION items captured in the Technical Context
for the OCR deployment feature, and records architectural decisions that address the
concerns summarized in `documents/2b0d0227d8c28083b5f4f46173abbaac.md`.

---

## Unknown 1: OCRエンジン側の実装言語・技術スタック

### Decision

Existing OCRエンジン実装を再利用し、本機能では「エンジン内の言語や実装技術」は変更しない。

### Rationale

- 本機能の目的は「OCR処理が本番デプロイ後も安定して動くアーキテクチャ」を整えることであり、
  OCRアルゴリズム自体の改善やエンジン乗り換えはスコープ外。
- 既にプロジェクト内で動作実績のあるOCR処理が存在する前提で、エラーハンドリングやAPI公開方法を
  見直す方が短期的な価値が高い。
- エンジンの変更を同時に行うと、障害発生時に「アーキテクチャ由来かアルゴリズム由来か」の切り分けが
  困難になり、2b0d...ドキュメントにある「不安」の解消が遠のく。

### Alternatives considered

- 別言語（例: Python, Go）による新規OCRサービスを立ち上げる  
  → デプロイ・監視・依存関係の複雑さが増し、本機能のゴールから逸れる。
- ブラウザ内ライブラリのみでOCRを完結させる  
  → 2b0d...ドキュメントで懸念されている「フロントだけで完結しているのでは」という不信感を助長する。

---

## Unknown 2: Supabase Edge Functions をOCR実行ランタイムとして使うか

### Decision

OCR処理の「一次責務」は既存の`backend`アプリケーション内のAPIとして実装し、  
Supabase Edge Functions は、必要であれば補助的な用途（例: 非同期処理キューや補助API）に限定して使う。

### Rationale

- 2b0d... ドキュメントでは「Supabase にバックエンドを丸投げすること」への不安が明示されている。
- 既存の `backend/` プロジェクトは Express ベースのAPIとして構成されており、ここに `/ocr` あるいは
  `/health-report/ocr` 相当のエンドポイントを追加する方が、運用・監視・責任範囲をチーム内に保ちやすい。
- Supabase を使う場合でも、「永続化や通知などの補助的な役割」に絞ることで、OCR本体の可用性・責任を
  自チーム側でコントロールできる。

### Alternatives considered

- Supabase Edge Functions を唯一の OCR 実行環境とする  
  → 障害時の調査がSupabase依存となり、内部構成のブラックボックス化が進むため、現場からの不安が増大する。
- Supabase を一切使わずに完全に排除する  
  → 既に他用途でSupabaseを利用している場合は整合性が崩れ、全体構成としての説明コストが高くなる。

---

## Integration Pattern for OCR API

### Decision

フロントエンドは、モノレポ内の `backend` が提供する HTTP API（例: `POST /api/ocr`）を唯一の窓口として利用し、  
ブラウザからSupabaseや外部OCRサービスへ直接アクセスしない。

### Rationale

- 「フロントのTypeScriptだけで完結している」という印象を排し、明示的に「サーバ側で責任を持つOCR API」を用意できる。
- 認証・認可やレート制限などの横断的な関心事を `backend` 側で制御できる。
- 外部OCRサービスを変更する場合でも、`backend` 内部の依存だけを差し替えればよく、フロントの契約は安定する。

### Alternatives considered

- フロントエンドから Supabase Edge Functions を直接叩く  
  → 接続先や認証情報が分散し、デバッグ時に経路が複雑化する。
- フロントエンドからブラウザ内のOCRライブラリを直接呼び出し、結果だけをバックエンドに送る  
  → 端末性能やブラウザ環境に依存しやすく、再現性・安定性の観点でリスクが高い。

---

## Operational Visibility and Error Handling

### Decision

OCR API には、最低限以下の運用観点を組み込む:

- リクエスト単位の識別子（OCR依頼ID）の採番
- 処理状態（受付中／処理中／完了／エラー）の記録
- ログには個人情報を含めず、技術的なエラー原因にフォーカスしたメッセージを残す

### Rationale

- 2b0d... ドキュメントで挙げられていた「APIが本当にデプロイされているのか」「どこで落ちているのか分からない」
  という不安を軽減するため。
- Constitution の「Data Privacy and Auditability」に従い、トレーサビリティとプライバシー保護を両立する。

### Alternatives considered

- 最低限のログのみに留める（IDや状態管理を行わない）  
  → 障害時の調査が困難となり、再発防止策が取りづらい。

