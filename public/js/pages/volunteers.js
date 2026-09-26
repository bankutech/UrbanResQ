import { api, can } from '../api.js';
import { esc, $, pill, toast, dialog, formData } from '../ui.js';

export async function render(root) {
  const load = async () => {
    const vs = await api('/volunteers');
    root.innerHTML = `<div class="bar"><button class="btn" id="new">+ Register volunteer</button></div>
      <div class="card"><table class="t"><tr><th>Name</th><th>Phone</th><th>Skills</th><th>Status</th><th>Task</th><th></th></tr>
      ${vs.map(v => `<tr><td>${esc(v.full_name)}</td><td>${esc(v.phone || '–')}</td><td>${esc(v.skills || '–')}</td><td>${pill(v.is_available ? 'available' : 'assigned')}</td><td>${esc(v.current_task || '–')}</td>
        <td>${v.is_available && can('coordinator') ? `<button class="btn sm" data-assign="${v.volunteer_id}">Assign</button>` : ''}${!v.is_available ? `<button class="btn ghost sm" data-rel="${v.volunteer_id}">Release</button>` : ''}</td></tr>`).join('')}</table></div>`;
  };
  await load();
  root.refresh = load;
  root.onclick = async e => {
    const t = e.target;
    try {
      if (t.id === 'new') {
        const d = dialog(`<h2>Register volunteer</h2><form style="margin-top:14px"><label>Full name</label><input name="full_name" required maxlength="100"><label>Phone</label><input name="phone" maxlength="30"><label>Skills</label><input name="skills" maxlength="255" placeholder="First aid, driving…">
          <div class="actions"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
        d.querySelector('form').onsubmit = async ev => { ev.preventDefault(); try { await api('/volunteers', { method: 'POST', body: formData(ev.target) }); toast('Registered'); d.close(); load(); } catch (err) { toast(err.message, true); } };
      }
      if (t.dataset.rel) { await api(`/volunteers/${t.dataset.rel}/release`, { method: 'POST' }); toast('Released'); load(); }
      if (t.dataset.assign) {
        const inc = (await api('/incidents?limit=100')).data.filter(i => i.status !== 'resolved');
        const d = dialog(`<h2>Assign volunteer</h2><label style="margin-top:14px">Incident</label><select id="inc">${inc.map(i => `<option value="${i.incident_id}">${esc(i.code)} · ${esc(i.area)}</option>`).join('')}</select><label>Task</label><input id="task" maxlength="160" placeholder="Distribute water packets">
          <div class="actions"><button class="btn" id="ok">Assign</button><button class="btn ghost" data-close>Cancel</button></div>`);
        $('#ok', d).onclick = async () => { try { await api(`/volunteers/${t.dataset.assign}/assign`, { method: 'POST', body: { incident_id: $('#inc', d).value, task: $('#task', d).value } }); toast('Assigned'); d.close(); load(); } catch (err) { toast(err.message, true); } };
      }
    } catch (err) { toast(err.message, true); }
  };
}
