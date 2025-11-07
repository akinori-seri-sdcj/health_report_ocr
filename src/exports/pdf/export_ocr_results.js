/**
 * Conceptual PDF/print preparation including item number left of label.
 * Actual PDF generation is host-specific; here we prepare a render-ready model.
 * @param {Array<{id:string,label:string,value:any}>} items
 * @param {Map<string, number>} numberMap
 * @returns {Array<{itemNo:number,label:string,value:any}>}
 */
export function preparePdfModel(items, numberMap) {
  const out = [];
  for (const it of items || []) {
    out.push({
      itemNo: numberMap?.get(it.id) ?? null,
      label: it.label,
      value: it.value,
    });
  }
  return out;
}

