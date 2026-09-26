import { api, user } from '../api.js';
import { esc, $, pill, fmtDate, toast, dialog, pager, opts, formData } from '../ui.js';

const ROLES = ['admin', 'coordinator', 'field_team'];

export async function render(root) {
  let tab = 'users', page = 1;
  const draw = async () => {
    const tabs = `<div class="tabs">${['users', 'audit'].map(t => `<button class="btn ghost ${t === tab ? 'on' : ''}" data-tab="${t}">${t === 'users' ? 'Users & roles' : 'Audit log'}</button>`).join('')}</div>`;
    if (tab === 'users') {
      const us = await api('/admin/users');
      root.innerHTML = tabs + `<div class="bar"><button class="btn" id="new">+ Add user</button></div><div class="card"><table class="t"><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th></tr>
        ${us.map(u => { const me = u.user_id === user().id; return `<tr><td>${esc(u.full_name)}</td><td>${esc(u.email)}</td>
          <td><select data-role="${u.user_id}" style="margin:0;width:auto" ${me ? 'disabled' : ''}>${opts(ROLES, u.role)}</select></td>
          <td><button class="btn ghost sm" data-act="${u.user_id}:${u.is_active ? 0 : 1}" ${me ? 'disabled' : ''}>${u.is_active ? 'Active — disable' : 'Disabled — enable'}</button></td></tr>`; }).join('')}</table></div>`;
    } else {
      const r = await api('/admin/audit?limit=20&page=' + page);
      root.innerHTML = tabs + `<div class="card"><table class="t"><tr><th>When</th><th>User</th><th>Action</th><th>Entity</th></tr>
        ${r.data.map(l => `<tr><td>${fmtDate(l.created_at)}</td><td>${esc(l.user || '–')}</td><td>${esc(l.action)}</td><td>${esc(l.entity)}${l.entity_id ? ' #' + l.entity_id : ''}</td></tr>`).join('')}</table>${pager(r)}</div>`;
    }
  };
  await draw();
  root.onchange = async e => {
    if (!e.target.dataset.role) return;
    try { await api('/admin/users/' + e.target.dataset.role, { method: 'PATCH', body: { role: e.target.value } }); toast('Role updated'); } catch (err) { toast(err.message, true); draw(); }
  };
  root.onclick = async e => {
    const t = e.target;
    try {
      if (t.dataset.tab) { tab = t.dataset.tab; page = 1; return draw(); }
      if (t.closest('[data-page]')) { page = Number(t.closest('[data-page]').dataset.page); return draw(); }
      if (t.dataset.act) { const [id, on] = t.dataset.act.split(':'); await api('/admin/users/' + id, { method: 'PATCH', body: { is_active: on === '1' } }); return draw(); }
      if (t.id === 'new') {
        const d = dialog(`<h2>Add user</h2><form style="margin-top:14px"><label>Full name</label><input name="full_name" required><label>Email</label><input name="email" type="email" required>
          <label>Role</label><select name="role">${opts(ROLES, 'field_team')}</select><label>Password (10+ characters)</label><input name="password" type="password" minlength="10" required autocomplete="new-password">
          <div class="actions"><button class="btn">Create</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
        d.querySelector('form').onsubmit = async ev => { ev.preventDefault(); try { await api('/admin/users', { method: 'POST', body: formData(ev.target) }); toast('User created'); d.close(); draw(); } catch (err) { toast(err.message, true); } };
      }
    } catch (err) { toast(err.message, true); }
  };
}
