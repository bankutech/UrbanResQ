import { api, can } from '../api.js';
import { esc, $, pill, toast, dialog, opts, formData } from '../ui.js';

export async function render(root) {
  const load = async () => {
    const hs = await api('/hospitals');
    root.innerHTML = `${can('coordinator') ? '<div class="bar"><button class="btn" id="addh">+ Add hospital</button></div>' : ''}<div class="card"><table class="t"><tr><th>Hospital</th><th>Area</th><th>Beds free</th><th></th><th>Ambulances</th><th>ER</th><th>Updated</th><th></th></tr>
      ${hs.map(h => { const pct = h.beds_total ? h.beds_available / h.beds_total * 100 : 0; return `<tr><td>${esc(h.name)}</td><td>${esc(h.area)}</td><td>${h.beds_available} / ${h.beds_total}</td>
        <td><div class="bar2 ${pct < 10 ? 'hot' : ''}"><u style="width:${pct}%"></u></div></td><td>${h.ambulances_available}</td><td>${pill(h.er_status)}</td><td class="mut">${esc(h.updated_at)}</td>
        <td>${can('coordinator') ? `<button class="btn ghost sm" data-edit="${h.hospital_id}">Update</button>` : ''}</td></tr>`; }).join('')}</table></div>`;
    root.onclick = e => {
      if (e.target.id === 'addh') return add(load);
      const h = hs.find(x => String(x.hospital_id) === e.target.dataset.edit);
      if (!h) return;
      const d = dialog(`<h2>${esc(h.name)}</h2><div class="row2" style="margin-top:14px"><div><label>Beds available (max ${h.beds_total})</label><input id="b" type="number" min="0" max="${h.beds_total}" value="${h.beds_available}"></div>
        <div><label>Ambulances</label><input id="a" type="number" min="0" value="${h.ambulances_available}"></div></div><label>ER status</label><select id="er">${opts(['open', 'busy', 'diverted'], h.er_status)}</select>
        <div class="actions"><button class="btn" id="ok">Save</button><button class="btn ghost" data-close>Cancel</button></div>`);
      $('#ok', d).onclick = async () => {
        try { await api('/hospitals/' + h.hospital_id, { method: 'PATCH', body: { beds_available: $('#b', d).value, ambulances_available: $('#a', d).value, er_status: $('#er', d).value } }); toast('Updated'); d.close(); load(); }
        catch (err) { toast(err.message, true); }
      };
    };
  };
  await load();
  root.refresh = load;
}

async function add(reload) {
  const areas = await api('/areas');
  const d = dialog(`<h2>Add hospital</h2><form style="margin-top:14px"><label>Name</label><input name="name" required maxlength="100"><label>Area</label><select name="area_id">${areas.map(a => `<option value="${a.area_id}">${esc(a.name)}</option>`).join('')}</select>
    <div class="row2"><div><label>Latitude</label><input name="lat" type="number" step="any" required></div><div><label>Longitude</label><input name="lng" type="number" step="any" required></div></div>
    <div class="row2"><div><label>Total beds</label><input name="beds_total" type="number" min="0" required></div><div><label>Ambulances</label><input name="ambulances_available" type="number" min="0" value="0"></div></div>
    <div class="actions"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
  d.querySelector('form').onsubmit = async ev => { ev.preventDefault(); try { await api('/hospitals', { method: 'POST', body: formData(ev.target) }); toast('Hospital added'); d.close(); reload(); } catch (err) { toast(err.message, true); } };
}
