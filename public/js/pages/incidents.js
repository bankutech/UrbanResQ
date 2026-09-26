import { api, apiBlob, apiUpload, can } from '../api.js';
import { esc, $, num, pill, fmtDate, toast, dialog, pager, opts, formData, debounce } from '../ui.js';

const KINDS = ['flood', 'fire', 'earthquake', 'cyclone', 'landslide', 'industrial'];
const SEV = ['low', 'moderate', 'high', 'critical'];
const ST = ['reported', 'verified', 'responding', 'contained', 'resolved'];

export async function render(root) {
  const areas = await api('/areas');
  const f = { page: 1, q: '', kind: '', severity: '', status: '' };
  const filt = (id, label, list) => `<select id="${id}"><option value="">${label}</option>${opts(list)}</select>`;
  root.innerHTML = `<div class="bar"><input id="q" placeholder="Search code, area, notes">${filt('kind', 'All types', KINDS)}${filt('severity', 'All severities', SEV)}${filt('status', 'All statuses', ST)}<button class="btn" id="new">+ Report incident</button></div><div id="list"></div>`;

  const load = async () => {
    const qs = new URLSearchParams({ limit: 15, page: f.page });
    for (const k of ['q', 'kind', 'severity', 'status']) if (f[k]) qs.set(k, f[k]);
    const r = await api('/incidents?' + qs);
    $('#list', root).innerHTML = `<div class="card"><table class="t"><tr><th>Code</th><th>Area</th><th>Type</th><th>Severity</th><th>Status</th><th>Affected</th><th>Pri</th><th>Reported</th></tr>
      ${r.data.map(i => `<tr data-id="${i.incident_id}"><td>${esc(i.code)}</td><td>${esc(i.area)}</td><td>${esc(i.kind)}</td><td>${pill(i.severity)}</td><td>${pill(i.status)}</td><td>${num(i.affected_pop)}</td><td>${i.priority}</td><td>${fmtDate(i.reported_at)}</td></tr>`).join('') || '<tr><td colspan="8" class="mut">No incidents match.</td></tr>'}</table>${pager(r)}</div>`;
  };
  await load();
  root.refresh = load;

  for (const k of ['kind', 'severity', 'status']) $('#' + k, root).onchange = e => { f[k] = e.target.value; f.page = 1; load(); };
  $('#q', root).oninput = debounce(e => { f.q = e.target.value; f.page = 1; load(); });
  root.onclick = e => {
    const pg = e.target.closest('[data-page]');
    if (pg) { f.page = Number(pg.dataset.page); return load(); }
    const tr = e.target.closest('tr[data-id]');
    if (tr) detail(tr.dataset.id, load);
  };
  $('#new', root).onclick = () => {
    const d = dialog(`<h2>Report incident</h2><form id="nf" style="margin-top:16px">
      <div class="row2"><div><label>Type</label><select name="kind">${opts(KINDS)}</select></div><div><label>Severity</label><select name="severity">${opts(SEV, 'moderate')}</select></div></div>
      <label>Area</label><select name="area_id">${areas.map(a => `<option value="${a.area_id}">${esc(a.name)}</option>`).join('')}</select>
      <div class="row2"><div><label>People affected</label><input name="affected_pop" type="number" min="0" value="0"></div><div><label>Priority (1-5)</label><input name="priority" type="number" min="1" max="5" value="3"></div></div>
      <div class="row2"><div><label>Latitude</label><input name="lat" type="number" step="any" min="-90" max="90"></div><div><label>Longitude</label><input name="lng" type="number" step="any" min="-180" max="180"></div></div>
      <label>Respond by</label><input name="respond_by" type="datetime-local">
      <label>Description</label><textarea name="description" rows="3" maxlength="2000"></textarea>
      <div class="actions"><button class="btn">Submit</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
    $('#nf', d).onsubmit = async ev => {
      ev.preventDefault();
      try { const r = await api('/incidents', { method: 'POST', body: Object.fromEntries(Object.entries(formData(ev.target)).filter(([, v]) => v !== '')) }); toast('Reported ' + r.code); d.close(); load(); }
      catch (err) { toast(err.message, true); }
    };
  };
}

async function detail(id, reload) {
  const [i, files, dmg, cmds] = await Promise.all([api('/incidents/' + id), api(`/incidents/${id}/attachments`), api(`/incidents/${id}/damage`), can('coordinator') ? api('/commanders') : Promise.resolve([])]);
  const d = dialog(`<h2>${esc(i.code)}</h2><p class="mut">${esc(i.area)} · ${esc(i.kind)}</p>
    <dl class="kv"><dt>Severity</dt><dd>${pill(i.severity)}</dd><dt>Status</dt><dd>${pill(i.status)}</dd><dt>Affected</dt><dd>${num(i.affected_pop)}</dd><dt>Priority</dt><dd>${i.priority} / 5</dd>
    <dt>Commander</dt><dd>${esc(i.commander || 'not assigned')}</dd><dt>Respond by</dt><dd>${fmtDate(i.respond_by)}</dd>
    <dt>Location</dt><dd>${i.lat ? esc(i.lat + ', ' + i.lng) : '–'}</dd><dt>Reported</dt><dd>${fmtDate(i.reported_at)}</dd></dl>
    <p>${esc(i.description || '')}</p>
    ${can('coordinator') ? `<div class="actions"><select id="st" style="width:auto;margin:0">${opts(ST, i.status)}</select><button class="btn" id="setst">Update status</button></div>
      <div class="actions"><select id="cmd" style="width:auto;margin:0"><option value="">No commander</option>${cmds.map(c => `<option value="${c.user_id}" ${c.user_id === i.commander_id ? 'selected' : ''}>${esc(c.full_name)}</option>`).join('')}</select>
      <input id="dl" type="datetime-local" style="width:auto;margin:0"><button class="btn ghost" id="setcmd">Set commander / deadline</button></div>` : ''}
    <h2 style="margin-top:26px">Files</h2><ul class="feed">${files.map(f => `<li><a href="#" data-dl="${f.attachment_id}" data-name="${esc(f.file_name)}">${esc(f.file_name)}</a><small>${Math.max(1, Math.round(f.size_bytes / 1024))} KB · ${esc(f.uploader)} ${can('coordinator') ? `· <a href="#" data-rm="${f.attachment_id}">remove</a>` : ''}</small></li>`).join('') || '<li class="mut">No files yet.</li>'}</ul>
    <div class="actions"><input type="file" id="fl" accept="image/png,image/jpeg,image/webp,application/pdf" style="width:auto;margin:0"><button class="btn ghost sm" id="upl">Upload</button></div>
    <h2 style="margin-top:26px">Damage assessment</h2><ul class="feed">${dmg.map(x => `<li>${x.buildings_damaged} buildings${x.roads_affected ? ' · ' + esc(x.roads_affected) : ''}${x.est_loss != null ? ' · est. loss ' + num(x.est_loss) : ''}<small>${esc(x.assessor)} · ${fmtDate(x.created_at)}</small></li>`).join('') || '<li class="mut">None recorded.</li>'}</ul>
    <form id="df"><div class="row2"><div><label>Buildings damaged</label><input name="buildings_damaged" type="number" min="0" value="0"></div><div><label>Estimated loss</label><input name="est_loss" type="number" min="0" step="0.01"></div></div>
      <label>Roads affected</label><input name="roads_affected" maxlength="200"><button class="btn ghost sm">Add assessment</button></form>
    <h2 style="margin-top:26px">Timeline</h2><ul class="feed">${i.timeline.map(t => `<li>${esc(t.event)}<small>${fmtDate(t.created_at)}${t.by_user ? ' · ' + esc(t.by_user) : ''}</small></li>`).join('')}</ul>
    <div class="actions"><button class="btn ghost" data-close>Close</button></div>`, true);
  const again = () => { d.close(); detail(id, reload); };
  d.addEventListener('click', async e => {
    const t = e.target;
    try {
      if (t.dataset.dl) { e.preventDefault(); const url = URL.createObjectURL(await apiBlob(`/attachments/${t.dataset.dl}/download`)); const a = document.createElement('a'); a.href = url; a.download = t.dataset.name; a.click(); URL.revokeObjectURL(url); }
      if (t.dataset.rm) { e.preventDefault(); await api('/attachments/' + t.dataset.rm, { method: 'DELETE' }); again(); }
      if (t.id === 'upl') { const f = $('#fl', d).files[0]; if (!f) return toast('Choose a file first', true); const fd = new FormData(); fd.append('file', f); await apiUpload(`/incidents/${id}/attachments`, fd); toast('Uploaded'); again(); }
      if (t.id === 'setcmd') { const dl = $('#dl', d).value; await api('/incidents/' + id, { method: 'PATCH', body: { commander_id: $('#cmd', d).value || null, ...(dl ? { respond_by: dl } : {}) } }); toast('Saved'); again(); }
      if (t.id === 'setst') { await api(`/incidents/${id}/status`, { method: 'PATCH', body: { status: $('#st', d).value } }); toast('Status updated'); d.close(); reload(); }
    } catch (err) { toast(err.message, true); }
  });
  $('#df', d).onsubmit = async ev => {
    ev.preventDefault();
    try { await api(`/incidents/${id}/damage`, { method: 'POST', body: Object.fromEntries(Object.entries(formData(ev.target)).filter(([, v]) => v !== '')) }); toast('Assessment saved'); again(); }
    catch (err) { toast(err.message, true); }
  };
}
