# Contract Validation: Export Audit API

- Spec file: specs/001-fix-export-spec/contracts/export-audit.openapi.yaml
- Backend route registered: POST /audit/exports (backend/src/routes/audit.routes.ts)
- Controller: backend/src/controllers/audit.controller.ts (returns 501 Not Implemented)
- Server wiring: backend/src/index.ts mounts `/audit`

Conclusion: Route path and method align with the OpenAPI contract. Endpoint is intentionally non-functional in this build.

