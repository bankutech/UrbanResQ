import { api, can } from '../api.js';
import { esc, $, toast, dialog, formData } from '../ui.js';

export async function render(root) {
  const load = async () => {
    const ss = await api('/shelters');
    root.innerHTML = `${can('coordinator') ? '<div class="bar"><button class="btn" id="adds">+ Add shelter</button></div>' : ''}<div class="card"><table class="t"><tr><th>Shelter</th><th>Area</th><th>Occupancy</th><th></th><th>Needs</th><th></th></tr>
      ${ss.map(s => { const pct = s.occupancy / s.capacity * 100; return `<tr><td>${esc(s.name)}</td><td>${esc(s.area)}</td><td>${s.occupancy} / ${s.capacity} (${Math.round(pct)}%)</td>
        <td><div class="bar2 ${pct > 90 ? 'hot' : ''}"><u style="width:${pct}%"></u></div></td><td>${esc(s.needs || '–')}</td>
        <td>${can('coordinator', 'field_team') ? `<button class="btn ghost sm" data-edit="${s.shelter_id}">Update</button>` : ''}</td></tr>`; }).join('')}</table></div>`;
    root.onclick = e => {
      if (e.target.id === 'adds') return add(load);
      const s = ss.find(x => String(x.shelter_id) === e.target.dataset.edit);
      if (!s) return;
      const d = dialog(`<h2>${esc(s.name)}</h2><label style="margin-top:14px">Occupancy (capacity ${s.capacity})</label><input id="o" type="number" min="0" max="${s.capacity}" value="${s.occupancy}">
        <label>Supplies needed</label><input id="n" maxlength="255" value="${esc(s.needs || '')}"><div class="actions"><button class="btn" id="ok">Save</button><button class="btn ghost" data-close>Cancel</button></div>`);
      $('#ok', d).onclick = async () => {
        try { await api('/shelters/' + s.shelter_id, { method: 'PATCH', body: { occupancy: $('#o', d).value, needs: $('#n', d).value } }); toast('Updated'); d.close(); load(); }
        catch (err) { toast(err.message, true); }
      };
    };
  };
  await load();
  root.refresh = load;
}

async function add(reload) {
  const areas = await api('/areas');
  const d = dialog(`<h2>Add shelter</h2><form style="margin-top:14px"><label>Name</label><input name="name" required maxlength="100"><label>Area</label><select name="area_id">${areas.map(a => `<option value="${a.area_id}">${esc(a.name)}</option>`).join('')}</select>
    <div class="row2"><div><label>Latitude</label><input name="lat" type="number" step="any" required></div><div><label>Longitude</label><input name="lng" type="number" step="any" required></div></div>
    <div class="row2"><div><label>Capacity</label><input name="capacity" type="number" min="1" required></div><div><label>Occupancy now</label><input name="occupancy" type="number" min="0" value="0"></div></div>
    <label>Supplies needed</label><input name="needs" maxlength="255"><div class="actions"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
  d.querySelector('form').onsubmit = async ev => { ev.preventDefault(); try { await api('/shelters', { method: 'POST', body: Object.fromEntries(Object.entries(formData(ev.target)).filter(([, v]) => v !== '')) }); toast('Shelter added'); d.close(); reload(); } catch (err) { toast(err.message, true); } };
}
