/**
 * CSV export including ItemNo column before Label, matching on stable id -> number map.
 * @param {Array<{id:string,label:string,value:any,sectionName?:string}>} items
 * @param {Map<string, number>} numberMap
 * @returns {string} CSV content
 */
export function exportOcrResultsCsv(items, numberMap) {
  const header = ['ItemNo', 'Label', 'Value'];
  const rows = [header];
  for (const it of items || []) {
    const no = numberMap?.get(it.id) ?? '';
    rows.push([String(no), safe(it.label), safe(String(it.value ?? ''))]);
  }
  return rows.map(r => r.map(csvEscape).join(',')).join('\n');
}

function safe(s) { return s == null ? '' : String(s); }
function csvEscape(field) {
  const needs = /[",\n]/.test(field);
  let out = field.replace(/"/g, '""');
  return needs ? `"${out}"` : out;
}

