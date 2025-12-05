# health_report_ocr Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-04

## Active Technologies
- TypeScript (frontend and backend) + exceljs (Excel export), encoding-japanese (Shift_JIS CSV), existing table/store components (001-export-ocr-results)
- N/A (client-side generation; no persistence required) (001-export-ocr-results)
- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (base)
- [if applicable, e.g., PostgreSQL, CoreData, files or N/A] (base)
- TypeScript 5.x; React 18.x + React, Zustand, React Router; reuse existing `frontend/src/components/ImagePreview.tsx` where feasible; no new libraries planned (base)
- N/A for this feature (UI only); session prefs may use in-memory store or existing client storage (base)
- TypeScript / Node 18+ (Next.js 14) + Next.js API Routes, OpenAI SDK (gpt-4o vision), zod schema validation (001-migrate-ocr-next-api)
- None (stateless) (001-migrate-ocr-next-api)
- TypeScript 5.x, Node 18 (Next.js 14, Viteフロント) + Next.js API Routes, React 18, Vite, OpenAI SDK (OCR呼び出し), zod (APIバリデーション) (001-vite-ocr-deploy)
- なし（サーバレス、ステートレス） (001-vite-ocr-deploy)

- TypeScript (frontend), TypeScript (backend) + exceljs (Excel export), encoding-japanese (CSV Shift_JIS encoding), existing state/store and table components (001-fix-export-spec)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript (frontend), TypeScript (backend): Follow standard conventions

## Recent Changes
- 001-vite-ocr-deploy: Added TypeScript 5.x, Node 18 (Next.js 14, Viteフロント) + Next.js API Routes, React 18, Vite, OpenAI SDK (OCR呼び出し), zod (APIバリデーション)
- 001-migrate-ocr-next-api: Added TypeScript / Node 18+ (Next.js 14) + Next.js API Routes, OpenAI SDK (gpt-4o vision), zod schema validation
- 001-migrate-ocr-next-api: Added [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
