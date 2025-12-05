# Quickstart: フロント+API同梱デプロイ

1. 依存インストール  
   - `npm install`（ルート。postinstallでfrontendも導入）

2. 開発起動  
   - API/Next: `npm run dev` → http://localhost:3000  
   - フロント(Vite): `npm run dev:frontend` → http://localhost:5173 （APIは同一オリジン3000を利用）

3. 本番ビルド  
   - `npm run build`（Viteビルド→public/uiコピー→Nextビルド）

4. 検証  
   - フロント: http://localhost:3000/ui/ をリロード・直リンクで確認  
   - APIヘルス: http://localhost:3000/api/ocr/health  
   - OCR送信: `/ui/` から画像を選択し、正常レスポンスを得る

5. デプロイ設定（Vercel想定）  
   - Framework: Next.js / Build Command: `npm run build` / Output: `.next`  
   - 環境変数: `OPENAI_API_KEY`（必須）、`MOCK_OCR`（任意）、必要ならタイムアウト設定  
   - デプロイ後: `/ui/` と `/api/ocr/health` を確認
