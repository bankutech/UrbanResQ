import { api, user, setSession, clearSession, can, openStream, stopStream } from './api.js';
import { esc, $, $$, formData, toast } from './ui.js';
import { NAV } from './nav.js';

const root = document.getElementById('root');

function loginScreen() {
  root.innerHTML = `<main class="login"><form id="lf">
    <h1>URBAN<b>RESQ</b></h1><p class="mut" style="margin-bottom:26px">Disaster resource allocation. Sign in.</p>
    <label>Email</label><input name="email" type="email" required autocomplete="username">
    <label>Password</label><input name="password" type="password" required autocomplete="current-password">
    <button class="btn" style="width:100%">Sign in</button></form></main>`;
  $('#lf').onsubmit = async e => {
    e.preventDefault();
    try {
      const r = await api('/auth/login', { method: 'POST', body: formData(e.target) });
      setSession(r.token, r.user);
      boot();
    } catch (err) { toast(err.message, true); }
  };
}

function shell() {
  const u = user();
  const groups = NAV.map(g => {
    const items = g.items.filter(i => !i.roles || can(...i.roles));
    return items.length ? `<div class="grp"><p>${esc(g.group)}</p>${items.map(i => `<a href="#/${i.id}" data-id="${i.id}">${esc(i.label)}</a>`).join('')}</div>` : '';
  }).join('');
  root.innerHTML = `<div id="app"><aside id="side"><div class="brand">URBAN<b>RESQ</b></div>${groups}
    <div class="me">${esc(u.name)}<br><span class="mut">${esc(u.role)}</span><br><a href="#" id="out" class="mut">Sign out</a></div></aside>
    <section><header><button class="btn ghost sm" id="burger">Menu</button><span id="title"></span><span id="live" class="mut" style="font-size:11px">offline</span><a href="#/notifications" class="btn ghost sm" id="bell">Alerts <b id="bellN"></b></a></header><main id="view"></main></section></div>`;
  $('#burger').onclick = () => $('#side').classList.toggle('open');
  $('#out').onclick = e => { e.preventDefault(); stopStream(); window.dispatchEvent(new Event('uq:logout')); clearSession(); location.hash = ''; boot(); };
}

async function route() {
  const id = location.hash.replace('#/', '') || 'dashboard';
  const item = NAV.flatMap(g => g.items).find(i => i.id === id);
  const view = $('#view');
  if (!view) return;
  if (!item) { view.innerHTML = '<p class="mut">Page not found.</p>'; return; }
  $$('#side a').forEach(a => a.classList.toggle('on', a.dataset.id === id));
  $('#title').textContent = item.label;
  $('#side').classList.remove('open');
  const box = document.createElement('div');
  box.innerHTML = '<p class="mut">Loading…</p>';
  view.replaceChildren(box);
  try {
    const m = await import(`./pages/${id}.js`);
    box.innerHTML = '';
    await m.render(box);
    current = { id, box };
    if (id === 'notifications') pollBell();
  } catch (e) { box.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}

let bellTimer, current = null, refreshTimer;
async function tickBell() {
  if (!$('#bellN')) return;
  try { $('#bellN').textContent = (await api('/notifications?unread=1&limit=1')).unread || ''; } catch { /* ignore */ }
}
function pollBell() {
  clearInterval(bellTimer);
  tickBell();
  bellTimer = setInterval(tickBell, 60000);
}

function onStream(ev, data) {
  const live = $('#live');
  if (ev === 'open' && live) { live.textContent = '● live'; live.style.color = 'var(--ok)'; }
  if (ev === 'closed' && live) { live.textContent = 'reconnecting…'; live.style.color = 'var(--warn)'; }
  if (ev === 'notification') { toast(data.title); tickBell(); }
  if (ev === 'team_position') window.dispatchEvent(new CustomEvent('uq:team_position', { detail: data }));
  if (ev === 'refresh') {
    tickBell();
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (!current || !current.box.isConnected || document.querySelector('dialog[open]')) return;
      if (typeof current.box.refresh === 'function') current.box.refresh().catch(() => {});
    }, 300);
  }
}

function boot() {
  if (!user()) return loginScreen();
  shell();
  route();
  pollBell();
  openStream(onStream);
}
addEventListener('hashchange', () => route());
boot();
