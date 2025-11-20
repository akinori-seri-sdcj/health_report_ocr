# Quickstart: OCR処理デプロイアーキテクチャの改善（計画ベース）

This quickstart explains how developers and operators should think about running
and verifying OCR processing once the planned architecture changes are implemented.

## 1. Components Overview

- `frontend/`
  - Calls a single HTTP endpoint (see `contracts/ocr-api.yaml`) to submit health report files.
- `backend/`
  - Exposes `/api/ocr` and `/api/ocr/{requestId}`.
  - Internally delegates to the existing OCR engine implementation.

## 2. Local Development Flow

1. Start backend (existing command, e.g. `npm run dev` in `backend/`).
2. Start frontend (existing command in `frontend/`).
3. From the UI, upload a test health report and trigger OCR.
4. Confirm:
   - No network errors in the browser.
   - Backend logs show OCR request accepted and completed (without sensitive data).

## 3. Deployment Considerations

- Backend OCR endpoint (`/api/ocr`) MUST be deployed wherever the frontend is configured to call it.
- Environment-specific OCR settings (e.g. external OCR service URL, keys) SHOULD be centralized under backend configuration.
- Monitoring SHOULD include:
  - OCR request count and error rate.
  - Latency for typical single-report OCR calls.

## 4. Smoke Test After Deployment

After a release, operators can:

1. Use a pre-approved test health report.
2. Run OCR through the UI.
3. Verify that:
   - OCR result appears within the expected time window.
   - System does not expose personal health information in logs or error messages.

