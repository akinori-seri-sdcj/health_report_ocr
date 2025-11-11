 Here’s my best-ranked conjecture for why you still see “HTTP error! status: 500”, plus how to verify each quickly.

  Likely Causes

  - OpenAI call failing in backend
      - Invalid/missing key, no access to model gpt-4o, or network failure triggers an exception in
        extractHealthReportData and returns 500 via the error handler.
      - Code path: backend/src/services/llm.service.ts:118 and backend/src/services/llm.service.ts:196
  - Backend not reloaded after fixes
      - If the backend process wasn’t restarted after my changes, it still returns the old 500 behavior and nested error
        shape.
      - Code path: backend/src/middleware/error-handler.ts:12
  - Upload rejected by Multer (pre-LLM)
      - Unsupported MIME (e.g., HEIC on Windows often shows as application/octet-stream) leads to a fileFilter error
        that currently surfaces as 500.
      - Oversize file (>10MB) or >10 files also triggers Multer limits and returns 500.
      - Code path: backend/src/middleware/upload.ts:20
  - API base URL mismatch or mixed content
      - If the app is served over HTTPS but the frontend forces VITE_API_URL=http://localhost:8080, the browser can
        block/mis-route, and Nginx proxy isn’t used. The frontend normally chooses /api in HTTPS, but an overridden .env
        can break that.
      - File: frontend/.env:5 and frontend/src/api/healthReportApi.ts:64

  How To Check (fast)

  - Confirm backend health
      - curl: curl http://localhost:8080/health → expect {"status":"ok",...,"services":{"llm":"healthy"}}
          - If “llm” is unhealthy or request fails, it’s the OpenAI path or the server isn’t running.
  - See if mock mode is active
      - Backend logs should show: “USE_MOCK_OCR is enabled. Returning mock OCR results.”
      
      - Docker Compose
		  - Tail backend logs: docker-compose logs -f backend
		  - Last N lines: docker-compose logs --tail=200 backend
		  - Restart then follow: docker-compose restart backend && docker-compose logs -f backend
		  - Exec and print env: docker-compose exec backend sh -lc "printenv | grep -E 'OPENAI|NODE_ENV|LOG_LEVEL|MOCK_OCR'"

	  - Local Dev
		  - Run backend and watch logs: cd backend; npm run dev
		  - Save to file (PowerShell): cd backend; npm run dev 2>&1 | Tee-Object -FilePath ..\log\backend.log
      
      - If not present, you’re not in mock mode (either no restart or env not set).
  - Reproduce via API directly
      - Small PNG under 1MB: curl -F "images=@C:\path\to\small.png" http://localhost:8080/process-health-report
      - Expect HTTP 200 with { "success": true, "data": ... }. If 500, the backend logs will state whether it failed in
        upload validation (Multer) or in LLM.
  - Check for Multer limit/type issues
      - If your test uses HEIC or big files (>10MB), try a small JPG/PNG instead. If that succeeds, the 500 is from
        Multer limits or type filtering.
  - Verify frontend API URL
      - If accessing via HTTPS (https://localhost), ensure the request goes to /api/process-health-report (DevTools
        → Network).
      - If the request goes to http://localhost:8080/... from an HTTPS page, fix VITE_API_URL or rely on the default (/
        api) for HTTPS.

  Quick Fixes to Try

  - Use mock OCR to isolate LLM causes
      - Set MOCK_OCR=1 in backend/.env:1 (Docker) or .env:1 (local root), restart backend, and retry.
      - If 200 now, the 500 was from the OpenAI call (invalid key or model access).
  - If you need real OCR
      - Set a valid OPENAI_API_KEY in the env file your backend actually loads:
          - Docker: backend/.env:1
          - Local root: .env:1
      - Ensure the key has access to gpt-4o or switch the model to one you have access to; I can change it to an
        available model if you confirm which one you can use.
  - Avoid Multer 500s
      - Test with a small PNG/JPG (<10MB).
      - If you must upload HEIC, tell me and I’ll apply a patch to accept application/octet-stream by filename extension
        and map Multer errors to HTTP 400 instead of 500.

  If you can share:

  - The exact image type/size you used,
  - Whether you run via Docker or local dev,
  - The backend log lines around the failed request,

  I can pinpoint which of the above is the culprit and patch further (e.g., MIME fallback and Multer error mapping)
  right away.
