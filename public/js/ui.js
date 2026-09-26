export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const num = n => Number(n || 0).toLocaleString();
export const fmtDate = s => s ? new Date(String(s).replace(' ', 'T')).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '–';
export const pill = v => `<span class="pill ${esc(v)}">${esc(String(v).replace(/_/g, ' '))}</span>`;
export const opts = (list, sel) => list.map(v => `<option ${v === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');
export const formData = f => Object.fromEntries(new FormData(f));

export function toast(msg, bad) {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.append(box); }
  const t = document.createElement('div');
  t.className = 'toast' + (bad ? ' bad' : '');
  t.textContent = msg;
  box.append(t);
  setTimeout(() => t.remove(), 3800);
}

export function dialog(html, drawer) {
  const d = document.createElement('dialog');
  if (drawer) d.className = 'drawer';
  d.innerHTML = html;
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', e => { if (e.target.closest('[data-close]')) d.close(); });
  document.body.append(d);
  d.showModal();
  return d;
}

export const pager = m => `<div class="pager"><span>${num(m.total)} records</span><span>
  <button class="btn ghost sm" data-page="${m.page - 1}" ${m.page <= 1 ? 'disabled' : ''}>←</button>
  ${m.page} / ${Math.max(1, Math.ceil(m.total / m.limit))}
  <button class="btn ghost sm" data-page="${m.page + 1}" ${m.page * m.limit >= m.total ? 'disabled' : ''}>→</button></span></div>`;

export function debounce(fn, ms = 300) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
