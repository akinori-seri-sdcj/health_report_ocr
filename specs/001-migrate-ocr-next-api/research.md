# Research Notes: 健康診断OCR API Routes移行

## Findings

### Decision: Use Next.js API Route (`app/api/ocr/route.ts`) on Vercel serverless
- **Rationale**: Aligns with Vercel’s native runtime; removes Express dependency that failed on deploy. Keeps OCR reachable from frontend without custom server.
- **Alternatives considered**: Keep Express behind a custom server (rejected: Vercel incompatibility); switch to Edge Functions (rejected: image upload size constraints and OpenAI SDK compatibility).

### Decision: Multipart handling via `req.formData()` with size/type guards
- **Rationale**: Next 13+/14 server runtime supports formData parsing; matches existing validation (≤10 files, 10MB, allowed mime types). Avoids Multer/Express middleware.
- **Alternatives considered**: Client-side base64 JSON (rejected: payload bloat); streaming uploads to object storage (deferred until size/timeout issues are observed).

### Decision: Maintain OpenAI Vision (gpt-4o) with server-side env vars
- **Rationale**: Matches current OCR behavior; keeps `OPENAI_API_KEY` secret server-side; `MOCK_OCR` toggle for offline/dev continuity.
- **Alternatives considered**: Different OCR API (Google Vision/AWS Textract) (rejected for scope/time); moving to Edge runtime (rejected due to binary support limits).

### Decision: Timeout/latency guard at ~10s user-facing target
- **Rationale**: Spec success criteria requires 90% <10s; Vercel serverless hard timeout ~10–60s depending on plan—assume standard (10s–15s) and document need for graceful timeout/fallback.
- **Alternatives considered**: Background job + polling (deferred unless timeouts observed); synchronous longer runtimes (unsupported on hobby plan).

### Decision: Testing approach for API Route
- **Rationale**: Use Next runtime with integration-style calls (e.g., `next dev` + fetch or route handler unit tests) focusing on: multipart validation, mock mode responses, and OpenAI call shape (can be stubbed).
- **Alternatives considered**: Keep Express supertest suite (not applicable after migration).

## Remaining Risks / Notes
- Large images or many pages may approach serverless timeouts; consider pre-validation and early rejection or a future async/polling path if metrics show slow responses.
- Ensure Vercel env vars set: `OPENAI_API_KEY` (required), `MOCK_OCR` optional. Avoid exposing keys via `NEXT_PUBLIC_*`.
