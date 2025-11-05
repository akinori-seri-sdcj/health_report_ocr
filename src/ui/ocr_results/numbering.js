/**
 * Numbering utilities for OCR results view
 * Policy: fixed ID -> global continuous numbering (1..N), stable across sort/filter
 * Exports:
 *  - buildNumberMap(items, sorter) => Map<id, number>
 *  - renderNumberForRow(rowEl, numberMap) => void
 *  - applyNumbering(container, numberMap) => void
 *  - reapplyNumbering(container, numberMap) => void
 *  - validateContinuity(numberMap, allItems) => { ok:boolean, missing:number[], duplicates:number[] }
 */

/**
 * Build a map from stable item id to display number.
 * @param {Array<{id:string, label?:string, value?:any, sectionId?:string}>} items
 * @param {(a: string, b: string) => number} [idSorter] Optional sorter for stable ordering
 * @returns {Map<string, number>} id -> number
 */
export function buildNumberMap(items, idSorter) {
  const ids = Array.from(new Set((items || []).map(i => i.id).filter(Boolean)));
  ids.sort(idSorter || ((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  const map = new Map();
  let n = 1;
  for (const id of ids) map.set(id, n++);
  return map;
}

/**
 * Render number element before label for a given row element.
 * The row is expected to have data-id attribute with the stable id.
 * @param {HTMLElement} rowEl
 * @param {Map<string, number>} numberMap
 */
export function renderNumberForRow(rowEl, numberMap) {
  if (!rowEl) return;
  // Skip hidden/disabled rows
  const ariaHidden = rowEl.getAttribute('aria-hidden') === 'true';
  if (rowEl.hasAttribute('hidden') || ariaHidden || rowEl.classList?.contains('is-hidden') || rowEl.hasAttribute('disabled')) {
    return;
  }
  const id = rowEl.getAttribute('data-id');
  if (!id || !numberMap.has(id)) return;
  // Avoid duplicate injection
  if (rowEl.querySelector(':scope > .ocr-item-number')) return;
  const num = numberMap.get(id);
  const span = rowEl.ownerDocument.createElement('span');
  span.className = 'ocr-item-number';
  span.textContent = String(num);
  // A11y: explicit label for clarity (screen readers announce number first)
  span.setAttribute('role', 'text');
  span.setAttribute('aria-label', `番号 ${num}`);
  // Insert before label
  const label = rowEl.querySelector(':scope > .ocr-item-label') || rowEl.firstChild;
  rowEl.insertBefore(span, label);
}

/**
 * Apply numbering to a container of item rows.
 * @param {HTMLElement} container
 * @param {Map<string, number>} numberMap
 */
export function applyNumbering(container, numberMap) {
  if (!container || !numberMap) return;
  const rows = container.querySelectorAll('[data-role="ocr-item-row"], .ocr-item-row');
  rows.forEach(row => renderNumberForRow(row, numberMap));
}

/**
 * Re-apply numbering after UI updates like sort/filter/lazy-load.
 * Safe to call repeatedly; guards against duplicate injection.
 * @param {HTMLElement} container
 * @param {Map<string, number>} numberMap
 */
export function reapplyNumbering(container, numberMap) {
  applyNumbering(container, numberMap);
}

/**
 * Validate global continuity: ensure numbers cover 1..N with no duplicates.
 * @param {Map<string, number>} numberMap
 * @param {Array<{id:string}>} allItems
 */
export function validateContinuity(numberMap, allItems) {
  const result = { ok: true, missing: [], duplicates: [] };
  if (!numberMap) return { ok: false, missing: [], duplicates: [] };
  const nums = Array.from(numberMap.values());
  const max = nums.length ? Math.max(...nums) : 0;
  const set = new Set();
  for (const n of nums) {
    if (set.has(n)) result.duplicates.push(n); else set.add(n);
  }
  for (let i = 1; i <= max; i++) {
    if (!set.has(i)) result.missing.push(i);
  }
  result.ok = result.missing.length === 0 && result.duplicates.length === 0;
  return result;
}
