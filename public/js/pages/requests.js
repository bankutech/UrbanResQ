import { api, can, user } from '../api.js';
import { esc, $, $$, pill, fmtDate, toast, dialog, pager, opts, num } from '../ui.js';

const ST = ['pending', 'approved', 'rejected', 'partially_fulfilled', 'fulfilled', 'cancelled'];
const PR = ['low', 'medium', 'high', 'critical'];

export async function render(root) {
  const f = { page: 1, status: '', priority: '' };
  root.innerHTML = `<div class="bar"><select id="status"><option value="">All statuses</option>${opts(ST)}</select><select id="priority"><option value="">All priorities</option>${opts(PR)}</select><button class="btn" id="new">+ New request</button></div><div id="list"></div>`;
  const load = async () => {
    const qs = new URLSearchParams({ limit: 15, page: f.page });
    if (f.status) qs.set('status', f.status);
    if (f.priority) qs.set('priority', f.priority);
    const r = await api('/requests?' + qs);
    $('#list', root).innerHTML = `<div class="card"><table class="t"><tr><th>#</th><th>Incident</th><th>Area</th><th>Priority</th><th>Status</th><th>By</th><th>Submitted</th></tr>
      ${r.data.map(q => `<tr data-id="${q.request_id}"><td>${q.request_id}</td><td>${esc(q.incident)}</td><td>${esc(q.area)}</td><td>${pill(q.priority)}</td><td>${pill(q.status)}</td><td>${esc(q.requested_by)}</td><td>${fmtDate(q.created_at)}</td></tr>`).join('') || '<tr><td colspan="7" class="mut">No requests.</td></tr>'}</table>${pager(r)}</div>`;
  };
  await load();
  root.refresh = load;
  for (const k of ['status', 'priority']) $('#' + k, root).onchange = e => { f[k] = e.target.value; f.page = 1; load(); };
  root.onclick = e => {
    const pg = e.target.closest('[data-page]');
    if (pg) { f.page = Number(pg.dataset.page); return load(); }
    const tr = e.target.closest('tr[data-id]');
    if (tr) detail(tr.dataset.id, load);
  };
  $('#new', root).onclick = () => create(load);
}

async function create(reload) {
  const [inc, res] = await Promise.all([api('/incidents?limit=100'), api('/resources')]);
  const live = inc.data.filter(i => i.status !== 'resolved');
  if (!live.length) return toast('No open incidents to request for', true);
  const row = () => `<div class="item"><select name="res">${res.map(r => `<option value="${r.resource_id}">${esc(r.name)} (${esc(r.unit)})</option>`).join('')}</select><input name="qty" type="number" min="1" value="1"><button type="button" class="btn ghost sm" data-rm>×</button></div>`;
  const d = dialog(`<h2>New request</h2><form id="rf" style="margin-top:16px">
    <label>Incident</label><select name="incident_id">${live.map(i => `<option value="${i.incident_id}">${esc(i.code)} · ${esc(i.area)}</option>`).join('')}</select>
    <label>Priority</label><select name="priority">${opts(PR, 'medium')}</select>
    <label>Items</label><div id="items">${row()}</div>
    <button type="button" class="btn ghost sm" id="add">+ item</button>
    <div class="actions"><button class="btn">Submit request</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
  $('#add', d).onclick = () => $('#items', d).insertAdjacentHTML('beforeend', row());
  d.addEventListener('click', e => { if (e.target.matches('[data-rm]') && $$('.item', d).length > 1) e.target.closest('.item').remove(); });
  $('#rf', d).onsubmit = async ev => {
    ev.preventDefault();
    const items = $$('.item', d).map(r => ({ resource_id: r.querySelector('[name=res]').value, qty: r.querySelector('[name=qty]').value }));
    try {
      const body = { incident_id: ev.target.elements.incident_id.value, priority: ev.target.elements.priority.value, items };
      const r = await api('/requests', { method: 'POST', body });
      toast('Request #' + r.request_id + ' submitted'); d.close(); reload();
    } catch (err) { toast(err.message, true); }
  };
}

async function detail(id, reload) {
  const q = await api('/requests/' + id);
  const mine = q.requested_by === user().id;
  const d = dialog(`<h2>Request #${q.request_id}</h2><p>${pill(q.status)} ${pill(q.priority)}</p>
    <dl class="kv"><dt>Submitted</dt><dd>${fmtDate(q.created_at)}</dd><dt>Decision</dt><dd>${q.decided_at ? fmtDate(q.decided_at) + ' · ' + esc(q.decision_note || '') : '–'}</dd></dl>
    <table class="t"><tr><th>Item</th><th>Asked</th><th>Allocated</th></tr>${q.items.map(i => `<tr><td>${esc(i.name)}</td><td>${num(i.qty_requested)} ${esc(i.unit)}</td><td>${num(i.qty_allocated)}</td></tr>`).join('')}</table>
    ${q.status === 'pending' && can('coordinator') ? `<label style="margin-top:16px">Decision note</label><textarea id="note" rows="2" maxlength="255"></textarea>
      <div class="actions"><button class="btn" data-dec="approve">Approve</button><button class="btn danger" data-dec="reject">Reject</button></div>` : ''}
    <div class="actions">${['pending', 'approved'].includes(q.status) && (mine || can('coordinator')) ? '<button class="btn ghost" id="cx">Cancel request</button>' : ''}<button class="btn ghost" data-close>Close</button></div>`, true);
  d.addEventListener('click', async e => {
    const dec = e.target.dataset.dec;
    try {
      if (dec) { await api(`/requests/${id}/decision`, { method: 'POST', body: { decision: dec, note: $('#note', d).value } }); toast('Request ' + dec + 'd'); d.close(); reload(); }
      if (e.target.id === 'cx') { await api(`/requests/${id}/cancel`, { method: 'POST' }); toast('Cancelled'); d.close(); reload(); }
    } catch (err) { toast(err.message, true); }
  });
}
