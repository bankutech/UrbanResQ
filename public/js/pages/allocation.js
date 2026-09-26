import { api, can } from '../api.js';
import { esc, $, num, pill, fmtDate, toast, dialog, pager } from '../ui.js';

export async function render(root) {
  let page = 1;
  const load = async () => {
    const [a, b, al] = await Promise.all([
      api('/requests?status=approved&limit=50'), api('/requests?status=partially_fulfilled&limit=50'), api(`/allocations?limit=12&page=${page}`)]);
    const ready = [...a.data, ...b.data];
    root.innerHTML = `
      <div class="card" style="margin-bottom:14px"><h2>Ready to dispatch</h2>
      ${ready.length ? `<table class="t"><tr><th>#</th><th>Incident</th><th>Area</th><th>Priority</th><th>Status</th><th></th></tr>${ready.map(q => `<tr><td>${q.request_id}</td><td>${esc(q.incident)}</td><td>${esc(q.area)}</td><td>${pill(q.priority)}</td><td>${pill(q.status)}</td><td>${can('coordinator') ? `<button class="btn sm" data-alloc="${q.request_id}">Allocate</button>` : ''}</td></tr>`).join('')}</table>` : '<p class="mut">No approved requests are waiting.</p>'}</div>
      <div class="card"><h2>Dispatches</h2><table class="t"><tr><th>#</th><th>Request</th><th>From</th><th>To</th><th>Status</th><th>Recipient</th><th></th></tr>
      ${al.data.map(x => `<tr><td>${x.allocation_id}</td><td>${x.request_id}</td><td>${esc(x.warehouse)}</td><td>${esc(x.area)}</td><td>${pill(x.status)}</td><td>${esc(x.recipient_name || '–')}</td>
        <td><button class="btn ghost sm" data-view="${x.allocation_id}">Items</button>
        ${x.status === 'allocated' ? `<button class="btn sm" data-go="${x.allocation_id}">In transit</button>` : ''}
        ${x.status === 'in_transit' ? `<button class="btn sm" data-done="${x.allocation_id}">Delivered</button>` : ''}
        ${['allocated', 'in_transit'].includes(x.status) && can('coordinator') ? `<button class="btn danger sm" data-cx="${x.allocation_id}">Cancel</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="7" class="mut">No dispatches yet.</td></tr>'}</table>${pager(al)}</div>`;
  };
  await load();
  root.refresh = load;

  root.onclick = async e => {
    const t = e.target, pg = t.closest('[data-page]');
    try {
      if (pg) { page = Number(pg.dataset.page); return load(); }
      if (t.dataset.alloc) return allocate(t.dataset.alloc, load);
      if (t.dataset.view) return items(t.dataset.view);
      if (t.dataset.go) { await api(`/allocations/${t.dataset.go}/status`, { method: 'PATCH', body: { status: 'in_transit' } }); toast('Marked in transit'); return load(); }
      if (t.dataset.done) return deliver(t.dataset.done, load);
      if (t.dataset.cx && confirm('Cancel this dispatch and return the stock?')) { await api(`/allocations/${t.dataset.cx}/cancel`, { method: 'POST' }); toast('Dispatch cancelled, stock returned'); load(); }
    } catch (err) { toast(err.message, true); }
  };
}

async function allocate(requestId, reload) {
  const [q, stock, whs] = await Promise.all([api('/requests/' + requestId), api('/stock'), api('/warehouses')]);
  const need = q.items.map(i => ({ id: i.resource_id, left: i.qty_requested - i.qty_allocated })).filter(n => n.left > 0);
  const total = need.reduce((s, n) => s + n.left, 0);
  const cover = w => need.reduce((s, n) => s + Math.min(n.left, stock.find(r => r.warehouse_id === w && r.resource_id === n.id)?.qty || 0), 0);
  const d = dialog(`<h2>Allocate request #${q.request_id}</h2>
    <table class="t"><tr><th>Item</th><th>Still needed</th></tr>${q.items.map(i => `<tr><td>${esc(i.name)}</td><td>${num(i.qty_requested - i.qty_allocated)} ${esc(i.unit)}</td></tr>`).join('')}</table>
    <label style="margin-top:16px">Dispatch from</label>
    <select id="wh">${whs.filter(w => w.is_active).map(w => `<option value="${w.warehouse_id}">${esc(w.name)}: covers ${num(cover(w.warehouse_id))} of ${num(total)} units</option>`).join('')}</select>
    <p class="mut">Oldest-expiring stock goes first. Expired batches are skipped.</p>
    <div class="actions"><button class="btn" id="go">Confirm dispatch</button><button class="btn ghost" data-close>Cancel</button></div>`);
  $('#go', d).onclick = async () => {
    try { const r = await api('/allocations', { method: 'POST', body: { request_id: requestId, warehouse_id: $('#wh', d).value } }); toast(`Dispatch #${r.allocation_id}: ${num(r.units)} units`); d.close(); reload(); }
    catch (err) { toast(err.message, true); }
  };
}

async function items(id) {
  const a = await api('/allocations/' + id);
  dialog(`<h2>Dispatch #${a.allocation_id}</h2><table class="t"><tr><th>Item</th><th>Batch</th><th>Expiry</th><th>Qty</th></tr>${a.items.map(i => `<tr><td>${esc(i.resource)}</td><td>${esc(i.batch_no)}</td><td>${esc(i.expiry_date || '–')}</td><td>${num(i.qty)} ${esc(i.unit)}</td></tr>`).join('')}</table><div class="actions"><button class="btn ghost" data-close>Close</button></div>`, true);
}

function deliver(id, reload) {
  const d = dialog(`<h2>Confirm delivery</h2><label style="margin-top:14px">Received by</label><input id="rcp" maxlength="100" placeholder="Name or office"><div class="actions"><button class="btn" id="ok">Confirm</button><button class="btn ghost" data-close>Cancel</button></div>`);
  $('#ok', d).onclick = async () => {
    try { await api(`/allocations/${id}/status`, { method: 'PATCH', body: { status: 'delivered', recipient_name: $('#rcp', d).value } }); toast('Delivery confirmed'); d.close(); reload(); }
    catch (err) { toast(err.message, true); }
  };
}
