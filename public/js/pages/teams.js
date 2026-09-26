import { api, can } from '../api.js';
import { esc, $, pill, toast, dialog, opts, formData } from '../ui.js';

let track = null;
const stopTrack = () => { if (track) { navigator.geolocation.clearWatch(track.watchId); track = null; } };
window.addEventListener('uq:logout', stopTrack);
function startTrack(teamId, changed) {
  if (!navigator.geolocation) return toast('This device cannot share its location', true);
  stopTrack();
  const t = { teamId, last: 0, watchId: null };
  t.watchId = navigator.geolocation.watchPosition(async p => {
    if (Date.now() - t.last < 15000) return;
    t.last = Date.now();
    try { await api(`/teams/${teamId}/position`, { method: 'POST', body: { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy } }); }
    catch (e) { if (/deployed|not found/i.test(e.message)) { stopTrack(); changed(); } }
  }, err => { toast('Location unavailable: ' + err.message, true); stopTrack(); changed(); }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
  track = t;
  toast('Sharing this device\'s location with the command center');
  changed();
}

export async function render(root) {
  const load = async () => {
    const teams = await api('/teams');
    root.innerHTML = `${can('coordinator') ? '<div class="bar"><button class="btn" id="new">+ Register team</button></div>' : ''}
      <div class="card"><table class="t"><tr><th>Team</th><th>Specialty</th><th>Members</th><th>Status</th><th>Mission</th><th>Done</th><th></th></tr>
      ${teams.map(t => `<tr><td>${esc(t.name)}<br><span class="mut">${esc(t.certifications || '')}</span></td><td>${esc(t.specialty)}</td><td>${t.members}</td><td>${pill(t.status)}</td>
        <td>${esc(t.current_incident || '–')} ${t.assignment_status ? pill(t.assignment_status) : ''}${t.seen_min_ago != null ? `<br><span class="mut">location ${t.seen_min_ago < 1 ? 'just now' : t.seen_min_ago + ' min ago'}</span>` : ''}</td><td>${t.missions_done}</td>
        <td><button class="btn ghost sm" data-crew="${t.team_id}">Crew</button> ${t.status === 'available' && can('coordinator') ? `<button class="btn sm" data-assign="${t.team_id}">Assign</button> <button class="btn ghost sm" data-set="${t.team_id}:off_duty">Off duty</button>` : ''}
        ${t.status === 'off_duty' && can('coordinator') ? `<button class="btn ghost sm" data-set="${t.team_id}:available">Back on duty</button>` : ''}
        ${t.status === 'deployed' && can('coordinator', 'field_team') ? (track && track.teamId === t.team_id ? `<button class="btn ghost sm" data-stop="1">Stop sharing</button>` : `<button class="btn ghost sm" data-share="${t.team_id}">Share my location</button>`) : ''}
        ${t.assignment_status === 'assigned' ? `<button class="btn sm" data-chk="${t.assignment_id}:in">Check in</button>` : ''}
        ${t.assignment_status === 'active' ? `<button class="btn sm" data-chk="${t.assignment_id}:out">Check out</button>` : ''}</td></tr>`).join('')}</table></div>`;
  };
  await load();
  root.refresh = load;
  root.onclick = async e => {
    const t = e.target;
    try {
      if (t.id === 'new') return register(load);
      if (t.dataset.crew) return crew(t.dataset.crew);
      if (t.dataset.share) return startTrack(Number(t.dataset.share), load);
      if (t.dataset.stop) { stopTrack(); return load(); }
      if (t.dataset.assign) return assign(t.dataset.assign, load);
      if (t.dataset.set) { const [id, status] = t.dataset.set.split(':'); await api(`/teams/${id}/status`, { method: 'PATCH', body: { status } }); return load(); }
      if (t.dataset.chk) { const [id, direction] = t.dataset.chk.split(':'); await api(`/team-assignments/${id}/check`, { method: 'POST', body: { direction } }); toast('Checked ' + direction); return load(); }
    } catch (err) { toast(err.message, true); }
  };
}

async function assign(teamId, reload) {
  const inc = (await api('/incidents?limit=100')).data.filter(i => i.status !== 'resolved');
  const d = dialog(`<h2>Assign team</h2><label style="margin-top:14px">Incident</label><select id="inc">${inc.map(i => `<option value="${i.incident_id}">${esc(i.code)} · ${esc(i.area)} · ${esc(i.severity)}</option>`).join('')}</select>
    <div class="actions"><button class="btn" id="ok">Assign</button><button class="btn ghost" data-close>Cancel</button></div>`);
  $('#ok', d).onclick = async () => {
    try { await api(`/teams/${teamId}/assign`, { method: 'POST', body: { incident_id: $('#inc', d).value } }); toast('Team assigned'); d.close(); reload(); }
    catch (err) { toast(err.message, true); }
  };
}

async function register(reload) {
  const areas = await api('/areas');
  const d = dialog(`<h2>Register team</h2><form style="margin-top:14px"><label>Name</label><input name="name" required maxlength="80">
    <div class="row2"><div><label>Specialty</label><input name="specialty" required maxlength="80"></div><div><label>Members</label><input name="members" type="number" min="1" value="4"></div></div>
    <label>Certifications</label><input name="certifications" maxlength="255"><label>Base area</label><select name="base_area_id">${areas.map(a => `<option value="${a.area_id}">${esc(a.name)}</option>`).join('')}</select>
    <div class="actions"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
  d.querySelector('form').onsubmit = async ev => {
    ev.preventDefault();
    try { await api('/teams', { method: 'POST', body: formData(ev.target) }); toast('Team registered'); d.close(); reload(); }
    catch (err) { toast(err.message, true); }
  };
}

async function crew(id) {
  const rows = await api(`/teams/${id}/personnel`);
  const d = dialog(`<h2>Crew</h2><table class="t"><tr><th>Name</th><th>Role</th><th>Skills</th><th>Phone</th><th></th></tr>${rows.map(p => `<tr><td>${esc(p.full_name)}</td><td>${esc(p.role)}</td><td>${esc(p.skills || '–')}</td><td>${esc(p.phone || '–')}</td><td>${can('coordinator') ? `<button class="btn danger sm" data-del="${p.person_id}">Remove</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="5" class="mut">No crew listed.</td></tr>'}</table>
    ${can('coordinator') ? `<form id="cf" style="margin-top:16px"><div class="row2"><div><label>Name</label><input name="full_name" required></div><div><label>Role</label><input name="role" required></div></div><div class="row2"><div><label>Skills</label><input name="skills"></div><div><label>Phone</label><input name="phone"></div></div><button class="btn">Add member</button></form>` : ''}
    <div class="actions"><button class="btn ghost" data-close>Close</button></div>`, true);
  const again = () => { d.close(); crew(id); };
  d.addEventListener('click', async e => { if (e.target.dataset.del) { try { await api('/personnel/' + e.target.dataset.del, { method: 'DELETE' }); again(); } catch (err) { toast(err.message, true); } } });
  const f = $('#cf', d);
  if (f) f.onsubmit = async ev => { ev.preventDefault(); try { await api(`/teams/${id}/personnel`, { method: 'POST', body: Object.fromEntries(Object.entries(formData(ev.target)).filter(([, v]) => v !== '')) }); again(); } catch (err) { toast(err.message, true); } };
}
