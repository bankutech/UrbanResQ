import { api, can } from '../api.js';
import { esc, num, fmtDate, toast, dialog, opts, $ } from '../ui.js';

export async function render(root) {
  const load = async () => {
    const d = await api('/donations');
    root.innerHTML = `<div class="bar">${can('coordinator') ? '<button class="btn" id="goods">+ Goods donation</button><button class="btn ghost" id="cash">+ Cash donation</button>' : ''}<span class="mut">Cash received: <b>${num(d.cash_total)}</b></span></div>
      <div class="card"><table class="t"><tr><th>Date</th><th>Donor</th><th>Type</th><th>Detail</th><th>Received by</th></tr>${d.data.map(x => `<tr><td>${fmtDate(x.received_at)}</td><td>${esc(x.donor_name)}</td><td>${esc(x.kind)}</td>
        <td>${x.kind === 'cash' ? num(x.amount) : `${num(x.qty)} ${esc(x.unit)} ${esc(x.resource)} → ${esc(x.warehouse)} (batch ${esc(x.batch_no)})`}</td><td>${esc(x.received_by_name)}</td></tr>`).join('') || '<tr><td colspan="5" class="mut">No donations logged.</td></tr>'}</table></div>`;
  };
  await load();
  root.refresh = load;
  root.onclick = async e => {
    const id = e.target.id;
    if (id !== 'goods' && id !== 'cash') return;
    let extra = '<label>Amount</label><input name="amount" type="number" min="1" step="0.01" required>';
    if (id === 'goods') {
      const [r, w] = await Promise.all([api('/resources'), api('/warehouses')]);
      extra = `<label>Resource</label><select name="resource_id">${r.map(x => `<option value="${x.resource_id}">${esc(x.name)} (${esc(x.unit)})</option>`).join('')}</select>
        <label>Depot</label><select name="warehouse_id">${w.map(x => `<option value="${x.warehouse_id}">${esc(x.name)}</option>`).join('')}</select>
        <div class="row2"><div><label>Quantity</label><input name="qty" type="number" min="1" required></div><div><label>Batch no.</label><input name="batch_no" required maxlength="30"></div></div><label>Expiry (optional)</label><input name="expiry_date" type="date">`;
    }
    const d = dialog(`<h2>${id === 'goods' ? 'Goods' : 'Cash'} donation</h2><form style="margin-top:14px"><label>Donor</label><input name="donor_name" required maxlength="100">${extra}<label>Note</label><input name="note" maxlength="255">
      <div class="actions"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
    d.querySelector('form').onsubmit = async ev => {
      ev.preventDefault();
      const body = Object.fromEntries([...new FormData(ev.target)].filter(([, v]) => v !== '')); body.kind = id;
      try { await api('/donations', { method: 'POST', body }); toast('Donation recorded'); d.close(); load(); } catch (err) { toast(err.message, true); }
    };
  };
}
