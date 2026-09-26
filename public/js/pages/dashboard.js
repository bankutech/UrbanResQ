import { api } from '../api.js';
import { esc, num, pill, fmtDate } from '../ui.js';

const SEV = ['low', 'moderate', 'high', 'critical'];

export async function render(root) {
  const draw = async () => {
    const [d, low] = await Promise.all([api('/dashboard'), api('/stock/low')]);
    const c = d.counters;
    const sev = Object.fromEntries(d.severity.map(s => [s.severity, s.n]));
    const max = Math.max(1, ...Object.values(sev));
    const stat = (n, l, hot) => `<div class="stat ${hot ? 'hot' : ''}"><h3>${num(n)}</h3><p>${l}</p></div>`;
    root.innerHTML = `
      <div class="stats">${stat(c.active_incidents, 'Active disasters')}${stat(c.critical_incidents, 'Critical', c.critical_incidents)}
        ${stat(c.affected_population, 'People affected')}${stat(c.units_available, 'Units in stock')}
        ${stat(c.pending_requests, 'Pending requests')}<div class="stat"><h3>${c.utilization_pct}%</h3><p>Stock deployed</p></div>${stat(c.low_stock_items, 'Low-stock lines', c.low_stock_items)}</div>
      <div class="cols">
        <div class="card"><h2>Severity mix</h2>${SEV.map(s => `<div class="barrow ${s}"><span>${s}</span><div class="bar"><u style="width:${(sev[s] || 0) / max * 100}%"></u></div><span>${sev[s] || 0}</span></div>`).join('')}</div>
        <div class="card"><h2>Requests by status</h2>${d.requests.length ? d.requests.map(r => `<div class="barrow"><span>${pill(r.status)}</span><span></span><span>${r.n}</span></div>`).join('') : '<p class="mut">No requests yet.</p>'}</div>
      </div>
      <div class="cols">
        <div class="card"><h2>Recent activity</h2><ul class="feed">${d.recent.map(r => `<li>${esc(r.event)}<small>${esc(r.code)} · ${fmtDate(r.created_at)}</small></li>`).join('') || '<li class="mut">Nothing yet.</li>'}</ul></div>
        <div class="card"><h2>Shortage watch</h2>${low.length ? `<table class="t"><tr><th>Depot</th><th>Item</th><th>Have</th><th>Min</th></tr>${low.map(r => `<tr><td>${esc(r.warehouse)}</td><td>${esc(r.resource)}</td><td class="err">${num(r.qty)}</td><td>${num(r.min_qty)}</td></tr>`).join('')}</table>` : '<p class="mut">Every depot is above its minimum.</p>'}</div>
      </div>`;
  };
  await draw();
  root.refresh = draw;
  const t = setInterval(() => { if (!root.isConnected) return clearInterval(t); draw().catch(() => {}); }, 30000);
}
