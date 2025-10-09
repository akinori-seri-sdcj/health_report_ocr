 エラー原因の分析

  1. APIキー問題（初期エラー）

  原因:
  - docker-compose.yml で環境変数の読み込み方法が間違っていた
  - OPENAI_API_KEY=${OPENAI_API_KEY} はホスト側の環境変数を参照する設定だったが、ホスト側に設定されていなかった

  解決策:
  # 修正前（誤り）
  environment:
    - OPENAI_API_KEY=${OPENAI_API_KEY}

  # 修正後（正しい）
  env_file:
    - ./backend/.env

  防止策:
  - Docker環境での環境変数は env_file ディレクティブで .env ファイルを直接指定する
  - ホスト側の環境変数を使う場合は、事前に export OPENAI_API_KEY=xxx で設定が必要

  ---
  2. CORS問題（主要エラー）

  原因:
  - test-api.html を file:// プロトコルで開いているため、オリジンが null になる
  - バックエンドのCORS設定が特定のオリジン（https://localhost）のみ許可していた
  - 開発環境では柔軟なCORS設定が必要だった

  解決策:
  // 修正前
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://localhost',
    credentials: true
  }))

  // 修正後
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? (process.env.CORS_ORIGIN || 'https://localhost')
      : '*', // 開発環境では全てのオリジンを許可
    credentials: process.env.NODE_ENV === 'production'
  }))

  防止策:
  - 開発環境と本番環境でCORS設定を分ける
  - 開発中は origin: '*' で全オリジンを許可
  - credentials: true と origin: '*' は同時に使えないため、環境ごとに分岐

  ---
  3. Zodバリデーション問題（データ型エラー）

  原因:
  - LLMが返すJSONデータに null 値が含まれる場合がある
  - 実際の健康診断結果では氏名が隠されていたり、一部の検査値が空欄の場合がある
  - スキーマが厳格すぎて null を許容していなかった

  解決策:
  // 修正前（厳格すぎる）
  export const PatientInfoSchema = z.object({
    氏名: z.string().min(1, '氏名は必須です'),
    受診日: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })

  // 修正後（柔軟）
  export const PatientInfoSchema = z.object({
    氏名: z.string().nullable().optional(),
    受診日: z.string().nullable().optional(),
  })

  防止策:
  - 実データを想定して、null値を許容する柔軟なスキーマ設計
  - .nullable() と .optional() を適切に使用
  - LLMの出力は完璧ではないことを前提にする

  ---
  4. Nodemon自動再起動の問題

  原因:
  - Dockerボリュームマウントの監視がうまく機能しないことがある（特にWindows環境）
  - ファイル変更がコンテナ内で即座に検知されない場合がある

  解決策:
  - ファイル変更後、docker-compose restart backend で手動再起動
  - または docker-compose up -d --build backend で再ビルド

  防止策:
  - 重要な設定変更後は必ず手動再起動を行う
  - ログで設定値を確認する（例: CORS origin: *）
  - 再起動後のログメッセージで変更が反映されているか確認

  ---
  今後の効率的なやり取りのためのポイント

  1. エラーメッセージの完全な共有

  - ブラウザのコンソールエラーを最初から共有すると診断が早くなる
  - 今回の場合、最初に「CORS policy」エラーが見えていれば即座に対応できた

  2. 環境の明示

  - Docker環境であること
  - Windows + Git Bash環境であること
  - これらを最初に伝えることで、環境特有の問題を予測できる

  3. 段階的なテスト

  - まずシンプルなテストから始める（例: /health エンドポイントへの curl）
  - 成功を確認してから複雑なテストに進む

  4. ログの確認タイミング

  - エラー発生時は必ず docker-compose logs backend --tail 50 で確認
  - 「Failed to fetch」のような曖昧なエラーの場合、バックエンドログが真の原因を教えてくれる

  5. 設定変更後の確認

  - Docker環境では設定変更が反映されるまでに時間がかかることがある
  - 変更後は必ずログで確認する習慣をつける

  ---
  まとめ

  今回の主な教訓:

  1. Docker + .env: env_file ディレクティブを使う
  2. 開発環境のCORS: 環境に応じて柔軟に設定する
  3. LLMデータのバリデーション: null値を許容する柔軟なスキーマ
  4. 変更の確認: 設定変更後は必ずログで確認

  これらを意識することで、今後のトラブルシューティングが大幅に効率化されます。