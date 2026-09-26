import { api } from '../api.js';
import { esc, $, fmtDate, toast, pager } from '../ui.js';

export async function render(root) {
  let page = 1, unread = false;
  const load = async () => {
    const r = await api(`/notifications?limit=20&page=${page}${unread ? '&unread=1' : ''}`);
    root.innerHTML = `<div class="bar"><button class="btn ghost ${unread ? '' : 'on'}" data-f="all">All</button><button class="btn ghost ${unread ? 'on' : ''}" data-f="unread">Unread (${r.unread})</button><button class="btn ghost" id="all">Mark all read</button></div>
      <div class="card"><ul class="feed">${r.data.map(n => `<li data-n="${n.notification_id}" style="${n.read_at ? 'opacity:.6' : 'border-left:2px solid var(--acid);padding-left:10px'}"><b>${esc(n.title)}</b><br>${esc(n.body || '')}<small>${esc(n.kind.replace(/_/g, ' '))} · ${fmtDate(n.created_at)} ${n.read_at ? '' : '· <a href="#" data-read="' + n.notification_id + '">mark read</a>'}</small></li>`).join('') || '<li class="mut">No notifications.</li>'}</ul>${pager(r)}</div>`;
  };
  await load();
  root.refresh = load;
  root.onclick = async e => {
    const t = e.target;
    try {
      if (t.dataset.f) { unread = t.dataset.f === 'unread'; page = 1; return load(); }
      if (t.closest('[data-page]')) { page = Number(t.closest('[data-page]').dataset.page); return load(); }
      if (t.id === 'all') { await api('/notifications/read', { method: 'POST', body: { all: true } }); toast('All marked read'); return load(); }
      if (t.dataset.read) { e.preventDefault(); await api('/notifications/read', { method: 'POST', body: { ids: [Number(t.dataset.read)] } }); return load(); }
    } catch (err) { toast(err.message, true); }
  };
}
