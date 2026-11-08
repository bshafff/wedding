// Tambahkan sebagai file baru di Apps Script (File > + > Script), nama bebas, mis. "WedBackend"
const WED = 'Wedding';
function wedNorm_(x) { x = (x && typeof x === 'object') ? x : {}; return { vendors: Array.isArray(x.vendors) ? x.vendors : [], kv: (x.kv && typeof x.kv === 'object') ? x.kv : {}, del: (x.del && typeof x.del === 'object') ? x.del : {} }; }
function wedMerge_(a, b) {
  a = wedNorm_(a); b = wedNorm_(b);
  const del = Object.assign({}, a.del); Object.keys(b.del).forEach(k => { del[k] = Math.max(del[k] || 0, b.del[k] || 0); });
  const m = {}; [a, b].forEach(s => s.vendors.forEach(v => { if (!m[v.id] || (v.u || 0) >= (m[v.id].u || 0)) m[v.id] = v; }));
  const vendors = Object.keys(m).map(k => m[k]).filter(v => !((del[v.id] || 0) > (v.u || 0)));
  const kv = Object.assign({}, a.kv); Object.keys(b.kv).forEach(k => { if (!kv[k] || (b.kv[k].u || 0) >= (kv[k].u || 0)) kv[k] = b.kv[k]; });
  const cutoff = Date.now() - 90 * 86400000; Object.keys(del).forEach(k => { if (del[k] < cutoff) delete del[k]; });
  return { vendors: vendors, kv: kv, del: del };
}
function wedSave_(data) {
  const ss = SpreadsheetApp.getActive(); let s = ss.getSheetByName(WED);
  if (!s) { s = ss.insertSheet(WED); s.getRange(1, 1).setValue('Data'); s.setColumnWidth(1, 800); }
  let cur = {}; try { cur = JSON.parse(String(s.getRange(2, 1).getValue() || '{}')); } catch (e) {}
  const merged = wedMerge_(cur, data), str = JSON.stringify(merged);
  if (str.length > 49000) return json_({ error: 'Data vendor terlalu besar (batas 50.000 karakter)' });
  s.getRange(2, 1).setValue(str);
  return json_({ ok: true, data: merged });
}
