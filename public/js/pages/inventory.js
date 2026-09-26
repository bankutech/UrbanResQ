import { api, can } from '../api.js';
import { esc, $, num, fmtDate, toast, dialog, pager, formData } from '../ui.js';

export async function render(root) {
  let tab = 'stock', page = 1;
  const today = new Date().toISOString().slice(0, 10);
  root.innerHTML = `<div class="bar"><div class="tabs" style="margin:0"><button class="btn ghost on" data-tab="stock">Stock levels</button><button class="btn ghost" data-tab="batches">Batches & expiry</button></div>
    ${can('coordinator') ? '<button class="btn" id="restock">+ Restock</button><button class="btn ghost" id="newres">+ New resource</button><button class="btn ghost" id="thr">Set minimum</button>' : ''}</div><div id="body"></div>`;

  const draw = async () => {
    for (const b of root.querySelectorAll('[data-tab]')) b.classList.toggle('on', b.dataset.tab === tab);
    if (tab === 'stock') {
      const rows = await api('/stock');
      const whs = [...new Map(rows.map(r => [r.warehouse_id, r.warehouse]))];
      const res = [...new Map(rows.map(r => [r.resource_id, r.resource]))];
      const at = (w, r) => rows.find(x => x.warehouse_id === w && x.resource_id === r);
      $('#body', root).innerHTML = `<div class="card"><table class="t"><tr><th>Resource</th>${whs.map(([, n]) => `<th>${esc(n)}</th>`).join('')}</tr>
        ${res.map(([rid, name]) => `<tr><td>${esc(name)}</td>${whs.map(([wid]) => { const c = at(wid, rid); const low = c.min_qty > 0 && c.qty < c.min_qty; return `<td class="${low ? 'err' : ''}">${num(c.qty)}${c.min_qty ? `<span class="mut"> / min ${num(c.min_qty)}</span>` : ''}${low ? ' ▼' : ''}</td>`; }).join('')}</tr>`).join('')}</table>
        <p class="mut" style="margin-top:12px">Counts exclude expired batches. ▼ marks a line under its minimum.</p></div>`;
    } else {
      const r = await api('/stock/batches?limit=20&page=' + page);
      $('#body', root).innerHTML = `<div class="card"><table class="t"><tr><th>Depot</th><th>Resource</th><th>Batch</th><th>Expiry</th><th>Qty</th></tr>
        ${r.data.map(b => `<tr><td>${esc(b.warehouse)}</td><td>${esc(b.resource)}</td><td>${esc(b.batch_no)}</td><td class="${b.expiry_date && b.expiry_date < today ? 'err' : ''}">${esc(b.expiry_date || 'none')}${b.expiry_date && b.expiry_date < today ? ' expired' : ''}</td><td>${num(b.qty)} ${esc(b.unit)}</td></tr>`).join('')}</table>${pager(r)}</div>`;
    }
  };
  await draw();
  root.refresh = draw;
  root.onclick = e => {
    const t = e.target;
    if (t.id === 'newres') return newResource(draw);
    if (t.dataset.tab) { tab = t.dataset.tab; page = 1; draw(); }
    if (t.closest('[data-page]')) { page = Number(t.closest('[data-page]').dataset.page); draw(); }
  };
  const pick = async () => { const [w, r] = await Promise.all([api('/warehouses'), api('/resources')]);
    return `<label>Depot</label><select name="warehouse_id">${w.map(x => `<option value="${x.warehouse_id}">${esc(x.name)}</option>`).join('')}</select>
            <label>Resource</label><select name="resource_id">${r.map(x => `<option value="${x.resource_id}">${esc(x.name)}</option>`).join('')}</select>`; };
  const form = (title, fields, path, method, okMsg) => async () => {
    const d = dialog(`<h2>${title}</h2><form style="margin-top:14px">${await pick()}${fields}<div class="actions"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
    d.querySelector('form').onsubmit = async ev => {
      ev.preventDefault();
      try { await api(path, { method, body: formData(ev.target) }); toast(okMsg); d.close(); draw(); }
      catch (err) { toast(err.message, true); }
    };
  };
  const rs = $('#restock', root), th = $('#thr', root);
  if (rs) rs.onclick = form('Restock', '<div class="row2"><div><label>Batch no.</label><input name="batch_no" required maxlength="30"></div><div><label>Quantity</label><input name="qty" type="number" min="1" required></div></div><label>Expiry (optional)</label><input name="expiry_date" type="date">', '/stock/batches', 'POST', 'Stock added');
  if (th) th.onclick = form('Minimum stock', '<label>Minimum quantity</label><input name="min_qty" type="number" min="0" required>', '/stock/thresholds', 'PUT', 'Minimum saved');
}

async function newResource(reload) {
  const cats = await api('/resource-categories');
  const d = dialog(`<h2>New resource</h2><form style="margin-top:14px"><label>Name</label><input name="name" required maxlength="80"><div class="row2"><div><label>Category</label><select name="category_id">${cats.map(c => `<option value="${c.category_id}">${esc(c.name)}</option>`).join('')}</select></div><div><label>Unit</label><input name="unit" required maxlength="20" placeholder="kit, litre, piece"></div></div>
    <label style="display:flex;gap:8px;align-items:center;text-transform:none;letter-spacing:0"><input type="checkbox" name="is_perishable" style="width:auto;margin:0"> Perishable</label>
    <div class="actions"><button class="btn">Add to catalog</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
  d.querySelector('form').onsubmit = async ev => {
    ev.preventDefault();
    const f = ev.target.elements;
    try { await api('/resources', { method: 'POST', body: { name: f.name.value, category_id: f.category_id.value, unit: f.unit.value, is_perishable: f.is_perishable.checked } }); toast('Resource added'); d.close(); reload(); }
    catch (err) { toast(err.message, true); }
  };
}
