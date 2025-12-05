# Research: API Routes配信とViteフロント統合デプロイ

## Decision 1: フロント配信パスとルーティング
- **Decision**: Vite成果物を `public/ui/` に配置し、`/ui/` へのHTMLリクエストを Next リライトで `public/ui/index.html` にフォールバックさせる。Vite `base` と Router `basename` を `/ui/` に揃える。
- **Rationale**: 同一ドメイン・サブパス配信でリロードやディープリンク時の404を防ぎ、単一ホスティングで完結させるため。
- **Alternatives considered**:
  - 別Vercelプロジェクト/サブドメインにViteをデプロイ: CORSと設定の分離が増え、同一オリジン要件を外れるため不採用。
  - Next.jsへ全面移植: 工数増と既存Vite資産の活用度低下のため今回は見送り。

## Decision 2: API呼び出し先
- **Decision**: フロントのデフォルトAPIエンドポイントを同一オリジンの `/api/ocr` とし、環境変数で上書え可能にする。ヘルスチェック `/api/ocr/health` を公開し、設定有無を確認可能に保つ。
- **Rationale**: CORS不要で最小構成、環境差異がある場合でも環境変数で制御できる柔軟性を確保するため。
- **Alternatives considered**:
  - フル固定URL（本番のみ）: プレビューやローカルでの接続切替が困難になるため不採用。
  - 毎回ユーザー入力でAPI先指定: 運用負荷と誤設定リスクが増すため不採用。

## Decision 3: ビルド手順とアセット配置
- **Decision**: 単一ビルドコマンドで Vite ビルド→成果物コピー→Next ビルドの順に実行し、`public/ui/` を `.gitignore` する。環境変数はサーバ側に保持しフロントへ露出させない。
- **Rationale**: 手動コピーや二重ビルドを排除し、再現性のあるCI/CDを維持するため。機密キーをフロントに含めない原則を守る。
- **Alternatives considered**:
  - Vite成果物をリポジトリコミット: 差分ノイズと更新漏れリスクが高いため不採用。
  - NextとViteを別ビルド・別デプロイ: シンプルさと同一オリジン要件に反するため不採用。
