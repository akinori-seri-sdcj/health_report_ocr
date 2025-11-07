# Contracts for Export OCR Results

No new backend API endpoints are required for this feature. Export is performed entirely on the client using currently visible/selected data.

Notes:
- Existing authentication/authorization continues to gate data visibility; UI restricts export to Admin/Data Exporter roles.
- If future auditing of exports is required, introduce an optional endpoint (e.g., POST /audit/exports) to record export events.

