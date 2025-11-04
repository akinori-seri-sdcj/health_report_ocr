// OCR results view integration for numbering
import { buildNumberMap, applyNumbering, reapplyNumbering, validateContinuity } from './numbering.js';

/**
 * Initialize numbering on the OCR results view.
 * @param {{items: Array<{id:string}>, container: HTMLElement, idSorter?: (a:string,b:string)=>number}} options
 */
export function initOcrResultNumbering(options) {
  const { items, container, idSorter } = options || {};
  if (!container) return;
  const map = buildNumberMap(items || [], idSorter);
  applyNumbering(container, map);
  enhanceAccessibility(container);

  // Example hooks to call after UI updates; actual wiring depends on host app
  function onDataUpdated() {
    reapplyNumbering(container, map);
    enhanceAccessibility(container);
  }

  // Expose minimal API for host wiring
  return {
    numberMap: map,
    reapply: () => onDataUpdated(),
    attachEventHooks: () => {
      // Listen to generic custom events for sort/filter/async-load
      const handler = () => onDataUpdated();
      container.addEventListener('ocr:sorted', handler);
      container.addEventListener('ocr:filtered', handler);
      container.addEventListener('ocr:dataLoaded', handler);
      return () => {
        container.removeEventListener('ocr:sorted', handler);
        container.removeEventListener('ocr:filtered', handler);
        container.removeEventListener('ocr:dataLoaded', handler);
      };
    },
    validate: () => validateGlobal(container, map),
  };
}

/**
 * Ensure screen readers announce number -> label -> value for each row
 * and mark decorative elements as aria-hidden.
 * Expects rows with [data-role="ocr-item-row"] or .ocr-item-row
 * and children: .ocr-item-number, .ocr-item-label, .ocr-item-value
 */
function enhanceAccessibility(container) {
  if (!container) return;
  const rows = container.querySelectorAll('[data-role="ocr-item-row"], .ocr-item-row');
  rows.forEach((row) => {
    const id = row.getAttribute('data-id') || Math.random().toString(36).slice(2);
    const numEl = row.querySelector(':scope > .ocr-item-number');
    const labelEl = row.querySelector(':scope > .ocr-item-label');
    const valueEl = row.querySelector(':scope > .ocr-item-value');
    if (numEl) {
      if (!numEl.id) numEl.id = `num-${id}`;
      numEl.setAttribute('aria-hidden', 'false');
    }
    if (labelEl && !labelEl.id) labelEl.id = `label-${id}`;
    if (valueEl && !valueEl.id) valueEl.id = `val-${id}`;
    const parts = [numEl?.id, labelEl?.id, valueEl?.id].filter(Boolean).join(' ');
    if (parts) row.setAttribute('aria-labelledby', parts);
    // Mark common decorative elements as hidden from SRs
    row.querySelectorAll('.icon, .decorative, [role="presentation"], [aria-role="presentation"]').forEach(el => {
      if (!el.classList.contains('ocr-item-number') && !el.classList.contains('ocr-item-label') && !el.classList.contains('ocr-item-value')) {
        el.setAttribute('aria-hidden', 'true');
      }
    });
  });
}

function validateGlobal(container, numberMap) {
  const rows = container?.querySelectorAll('[data-role="ocr-item-row"], .ocr-item-row') || [];
  const ids = Array.from(rows).map(r => r.getAttribute('data-id')).filter(Boolean);
  const res = validateContinuity(numberMap, ids.map(id => ({ id })));
  if (!res.ok) console.warn('[ocr-numbering] continuity issue', res);
  return res;
}
