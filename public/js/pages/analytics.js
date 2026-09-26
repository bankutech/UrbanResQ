import { api, apiBlob, can } from '../api.js';
import { esc, num, toast } from '../ui.js';

const mins = m => m == null ? '–' : m >= 60 ? (m / 60).toFixed(1) + ' h' : m + ' min';

export async function render(root) {
  const a = await api('/analytics');
  const maxK = Math.max(1, ...a.incidents_by_kind.map(k => k.n));
  const stat = (v, l) => `<div class="stat"><h3>${v}</h3><p>${l}</p></div>`;
  root.innerHTML = `
    <div class="stats">${stat(mins(a.minutes.response), 'Avg time to first team')}${stat(mins(a.minutes.approval), 'Avg request approval')}${stat(mins(a.minutes.fulfilment), 'Avg time to first dispatch')}</div>
    ${can('coordinator') ? `<div class="bar"><span class="mut">Export CSV:</span>${['incidents', 'requests', 'stock'].map(r => ['csv', 'xlsx', 'pdf'].map(f => `<button class="btn ghost sm" data-exp="${r}:${f}">${r} ${f}</button>`).join('')).join('')}</div>` : ''}
    <div class="cols">
      <div class="card"><h2>Incidents by type</h2>${a.incidents_by_kind.map(k => `<div class="barrow"><span>${esc(k.kind)}</span><div class="bar"><u style="width:${k.n / maxK * 100}%"></u></div><span>${k.n}</span></div>`).join('')}</div>
      <div class="card"><h2>Shelter occupancy</h2>${a.shelters.map(s => `<div class="barrow" style="grid-template-columns:120px 1fr 44px"><span>${esc(s.name)}</span><div class="bar2 ${s.pct > 90 ? 'hot' : ''}"><u style="width:${s.pct}%"></u></div><span>${s.pct}%</span></div>`).join('')}</div>
    </div>
    <div class="card" style="margin-bottom:14px"><h2>Shelter occupancy, last 14 days</h2>${(() => { const g = {}; a.shelter_trend.forEach(t => (g[t.name] ||= []).push(t)); const k = Object.keys(g); return k.length ? k.map(n => `<div class="barrow" style="grid-template-columns:200px 1fr"><span>${esc(n)}</span><span style="display:flex;align-items:flex-end;gap:3px;height:34px">${g[n].map(t => `<u title="${esc(t.day)}: ${t.occupancy}/${t.capacity}" style="display:block;width:14px;height:${Math.max(3, Math.round(t.occupancy / t.capacity * 34))}px;background:${t.occupancy / t.capacity > .9 ? 'var(--red)' : 'var(--acid)'}"></u>`).join('')}</span></div>`).join('') : '<p class="mut">No history yet.</p>'; })()}</div>
    <div class="cols">
      <div class="card"><h2>Requested vs in stock</h2><table class="t"><tr><th>Resource</th><th>Requested</th><th>Allocated</th><th>In stock</th></tr>
        ${a.demand.map(d => { const unmet = d.requested - d.allocated; return `<tr><td>${esc(d.resource)}</td><td>${num(d.requested)}</td><td>${num(d.allocated)}</td><td class="${unmet > d.in_stock ? 'err' : ''}">${num(d.in_stock)}${unmet > d.in_stock ? ' ▼ short' : ''}</td></tr>`; }).join('')}</table></div>
      <div class="card"><h2>Biggest unmet needs</h2>${a.shortages.length ? a.shortages.map(s => `<div class="barrow" style="grid-template-columns:1fr 120px"><span>${esc(s.resource)}</span><span>${num(s.unmet)} · ${s.times_short}×</span></div>`).join('') : '<p class="mut">Nothing outstanding.</p>'}
        <p class="mut" style="margin-top:14px">Risk and demand forecasting need months of real history. They aren't modelled here.</p></div>
    </div>`;
  root.onclick = async e => {
    const x = e.target.dataset.exp;
    if (!x) return;
    const [r, fmt] = x.split(':');
    try {
      const url = URL.createObjectURL(await apiBlob(`/analytics/export/${r}?format=${fmt}`));
      const link = document.createElement('a'); link.href = url; link.download = `urbanresq-${r}.${fmt}`; link.click(); URL.revokeObjectURL(url);
    } catch (err) { toast(err.message, true); }
  };
}
