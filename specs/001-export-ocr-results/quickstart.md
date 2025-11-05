# Quickstart: Export OCR Results

## Run the app

Frontend
- cd frontend
- npm install
- npm run dev (http://localhost:5173)

Backend (only for OCR/GPT flows; export is client-side)
- cd backend
- npm install
- npm run dev (http://localhost:8080)

## Validate export

1) Navigate to 確認・修正 screen and load OCR results.
2) Click the existing bottom-right Export button.
3) In the modal, choose:
   - Format: CSV or Excel
   - Scope: Filtered or Selected
   - Encoding (CSV): UTF-8 (default) or Shift_JIS
4) Confirm and download.

Expected
- CSV opens correctly in common spreadsheets; non-ASCII displays properly.
- Excel contains one sheet named "Export" with headers in row 1.
- Filenames include dataset/context, type, and timestamp.

## Manual QA: Non-ASCII Validation

1) Create data with Japanese characters (e.g., 氏名: 佐藤 太郎, 項目名: 中性脂肪, 値: 120, 単位: mg/dL, 判定: 要経過観察).
2) Export CSV with UTF-8 (default). Open in Excel (latest) and Google Sheets. Confirm characters render correctly; commas/newlines are preserved.
3) Export CSV with Shift_JIS. Open in legacy Excel configured for Japanese locale. Confirm characters render correctly. Note: Characters outside SJIS range may be replaced.
4) Export Excel (.xlsx). Open in Excel and confirm sheet name, headers, and values display without mojibake.
