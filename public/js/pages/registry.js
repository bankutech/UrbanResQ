import { api } from '../api.js';
import { esc, $, pill, fmtDate, toast, dialog, pager, opts, debounce } from '../ui.js';

const ST = ['registered', 'sheltered', 'hospitalised', 'discharged'];
const clean = f => Object.fromEntries([...new FormData(f)].filter(([, v]) => v !== ''));

export async function render(root) {
  let tab = 'victims', page = 1, q = '';
  const draw = async () => {
    const tabs = `<div class="tabs"><button class="btn ghost ${tab === 'victims' ? 'on' : ''}" data-tab="victims">Victim registry</button><button class="btn ghost ${tab === 'missing' ? 'on' : ''}" data-tab="missing">Missing persons</button></div>
      <p class="mut" style="margin-bottom:12px">Restricted access. Every view of these records is written to the audit log.</p>`;
    if (tab === 'victims') {
      const r = await api(`/registry/victims?limit=15&page=${page}${q ? '&q=' + encodeURIComponent(q) : ''}`);
      root.innerHTML = tabs + `<div class="bar"><input id="q" placeholder="Search by name" value="${esc(q)}"><button class="btn" id="newv">+ Register person</button></div><div class="card"><table class="t"><tr><th>Name</th><th>Age</th><th>Incident</th><th>Status</th><th>Placed at</th><th>Note</th><th></th></tr>
        ${r.data.map(v => `<tr><td>${esc(v.full_name)}</td><td>${v.age ?? '–'}</td><td>${esc(v.incident)}</td><td>${pill(v.status)}</td><td>${esc(v.shelter || v.hospital || '–')}</td><td>${esc(v.condition_note || '')}</td><td><button class="btn ghost sm" data-up="${v.victim_id}">Update</button></td></tr>`).join('') || '<tr><td colspan="7" class="mut">No records.</td></tr>'}</table>${pager(r)}</div>`;
      const qi = $('#q', root); if (qi) qi.oninput = debounce(e => { q = e.target.value; page = 1; draw().then(() => { const n = $('#q', root); n.focus(); n.setSelectionRange(q.length, q.length); }); });
    } else {
      const m = await api('/registry/missing');
      root.innerHTML = tabs + `<div class="bar"><button class="btn" id="newm">+ Report missing person</button></div><div class="card"><table class="t"><tr><th>Name</th><th>Age</th><th>Last seen</th><th>Reporter</th><th>Status</th><th>Identified</th><th></th></tr>
        ${m.map(p => `<tr><td>${esc(p.full_name)}<br><span class="mut">${esc(p.description || '')}</span></td><td>${p.age ?? '–'}</td><td>${esc(p.last_seen_area || '–')}</td><td>${esc(p.reporter_name)}<br><span class="mut">${esc(p.reporter_contact)}</span></td><td>${pill(p.status)}</td><td>${p.identified ? 'yes' : 'no'}</td>
        <td>${p.status === 'missing' ? `<button class="btn sm" data-loc="${p.missing_id}">Mark located</button>` : ''}${p.status === 'located' ? `<button class="btn sm" data-hand="${p.missing_id}">Hand over</button>` : ''}${p.status === 'reunified' ? `<span class="mut">to ${esc(p.handed_to)}</span>` : ''}</td></tr>`).join('') || '<tr><td colspan="7" class="mut">No reports.</td></tr>'}</table></div>`;
    }
  };
  await draw();

  const form = (title, html, run) => {
    const d = dialog(`<h2>${title}</h2><form style="margin-top:14px">${html}<div class="actions"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
    d.querySelector('form').onsubmit = async ev => { ev.preventDefault(); try { await run(clean(ev.target), ev.target); d.close(); draw(); } catch (err) { toast(err.message, true); } };
  };
  root.onclick = async e => {
    const t = e.target;
    try {
      if (t.dataset.tab) { tab = t.dataset.tab; page = 1; return draw(); }
      if (t.closest('[data-page]')) { page = Number(t.closest('[data-page]').dataset.page); return draw(); }
      if (t.id === 'newv') {
        const [inc, sh] = await Promise.all([api('/incidents?limit=100'), api('/shelters')]);
        form('Register person', `<label>Incident</label><select name="incident_id">${inc.data.map(i => `<option value="${i.incident_id}">${esc(i.code)} · ${esc(i.area)}</option>`).join('')}</select><label>Full name</label><input name="full_name" required maxlength="100">
          <div class="row2"><div><label>Age</label><input name="age" type="number" min="0" max="120"></div><div><label>Status</label><select name="status">${opts(ST)}</select></div></div>
          <label>Shelter (if placed)</label><select name="shelter_id"><option value="">None</option>${sh.map(s => `<option value="${s.shelter_id}">${esc(s.name)}</option>`).join('')}</select><label>Condition note</label><input name="condition_note" maxlength="255">`,
          b => api('/registry/victims', { method: 'POST', body: b }).then(() => toast('Registered')));
      }
      if (t.dataset.up) {
        const [sh, hs] = await Promise.all([api('/shelters'), api('/hospitals')]);
        form('Update status', `<label>Status</label><select name="status">${opts(ST)}</select><label>Shelter</label><select name="shelter_id"><option value="">None</option>${sh.map(s => `<option value="${s.shelter_id}">${esc(s.name)}</option>`).join('')}</select>
          <label>Hospital</label><select name="hospital_id"><option value="">None</option>${hs.map(h => `<option value="${h.hospital_id}">${esc(h.name)}</option>`).join('')}</select>`,
          b => api('/registry/victims/' + t.dataset.up, { method: 'PATCH', body: b }).then(() => toast('Updated')));
      }
      if (t.id === 'newm') {
        const areas = await api('/areas');
        form('Report missing person', `<label>Full name</label><input name="full_name" required maxlength="100"><div class="row2"><div><label>Age</label><input name="age" type="number" min="0" max="120"></div><div><label>Last seen area</label><select name="last_seen_area_id">${areas.map(a => `<option value="${a.area_id}">${esc(a.name)}</option>`).join('')}</select></div></div>
          <label>Description</label><input name="description" maxlength="500"><div class="row2"><div><label>Reporter name</label><input name="reporter_name" required></div><div><label>Reporter contact</label><input name="reporter_contact" required maxlength="60"></div></div>`,
          b => api('/registry/missing', { method: 'POST', body: b }).then(() => toast('Report filed')));
      }
      if (t.dataset.loc) form('Mark located', '<label>Where / how</label><input name="note" maxlength="255"><label style="display:flex;gap:8px;align-items:center;text-transform:none;letter-spacing:0"><input type="checkbox" name="identified" style="width:auto;margin:0"> Identity confirmed</label>',
        (b, f) => api(`/registry/missing/${t.dataset.loc}/located`, { method: 'POST', body: { note: b.note, identified: f.elements.identified.checked } }).then(() => toast('Marked located')));
      if (t.dataset.hand) form('Confirm handover', '<label>Handed over to</label><input name="handed_to" required maxlength="100"><label style="display:flex;gap:8px;align-items:center;text-transform:none;letter-spacing:0"><input type="checkbox" name="id_checked" style="width:auto;margin:0"> I checked the receiving person\'s identity</label>',
        (b, f) => api(`/registry/missing/${t.dataset.hand}/reunify`, { method: 'POST', body: { handed_to: b.handed_to, id_checked: f.elements.id_checked.checked } }).then(() => toast('Reunification recorded')));
    } catch (err) { toast(err.message, true); }
  };
}
