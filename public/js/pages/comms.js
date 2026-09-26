import { api, can } from '../api.js';
import { esc, $, fmtDate, toast, opts } from '../ui.js';

export async function render(root) {
  const [inc, st] = await Promise.all([api('/incidents?limit=100'), api('/system/status')]);
  const ext = st.email || st.sms;
  const load = async () => {
    const bc = await api('/broadcasts');
    root.innerHTML = `<div class="cols">
      ${can('coordinator') ? `<div class="card"><h2>Broadcast an alert</h2><form id="bf">
        <label>Audience</label><select name="audience">${opts(['all', 'coordinator', 'field_team', 'admin'])}</select>
        <label>Incident (optional)</label><select name="incident_id"><option value="">None</option>${inc.data.map(i => `<option value="${i.incident_id}">${esc(i.code)} · ${esc(i.area)}</option>`).join('')}</select>
        <label>Instruction</label><textarea name="message" rows="3" maxlength="1000" required></textarea>
        <label style="display:flex;gap:8px;align-items:center;text-transform:none;letter-spacing:0"><input type="checkbox" name="external" style="width:auto;margin:0" ${ext ? '' : 'disabled'}> Also send by ${st.email ? 'email' : ''}${st.email && st.sms ? ' and ' : ''}${st.sms ? 'SMS' : ''}${ext ? '' : 'email/SMS (not configured on this server)'}</label>
        <div class="actions"><button class="btn">Send broadcast</button></div></form></div>` : ''}
      <div class="card"><h2>Sent broadcasts</h2><ul class="feed">${bc.map(b => `<li>${esc(b.message)}<small>to ${esc(b.audience)} · ${esc(b.sender)} · ${fmtDate(b.created_at)}${b.sent_external ? ' · email/SMS' : ''}</small></li>`).join('') || '<li class="mut">None yet.</li>'}</ul></div></div>
      <div class="card"><h2>Incident message log</h2><select id="mi">${inc.data.map(i => `<option value="${i.incident_id}">${esc(i.code)} · ${esc(i.area)}</option>`).join('')}</select><div id="log"></div>
      <div class="bar"><input id="mt" placeholder="Add a note for this incident" maxlength="1000" style="flex:1"><button class="btn" id="post">Post</button></div></div>`;
    const bf = $('#bf', root);
    if (bf) bf.onsubmit = async ev => {
      ev.preventDefault();
      const f = ev.target.elements;
      try {
        const r = await api('/broadcasts', { method: 'POST', body: { audience: f.audience.value, incident_id: f.incident_id.value || undefined, message: f.message.value, external: f.external.checked } });
        toast(`Sent to ${r.recipients} people`); load();
      } catch (err) { toast(err.message, true); }
    };
    const log = async () => {
      if (!$('#mi', root)) return;
      const m = await api(`/incidents/${$('#mi', root).value}/messages`);
      $('#log', root).innerHTML = `<ul class="feed">${m.map(x => `<li>${esc(x.message)}<small>${esc(x.author)} · ${fmtDate(x.created_at)}</small></li>`).join('') || '<li class="mut">No messages.</li>'}</ul>`;
    };
    if ($('#mi', root)) { $('#mi', root).onchange = log; await log(); }
    $('#post', root).onclick = async () => {
      try { await api(`/incidents/${$('#mi', root).value}/messages`, { method: 'POST', body: { message: $('#mt', root).value } }); $('#mt', root).value = ''; log(); }
      catch (err) { toast(err.message, true); }
    };
  };
  await load();
}
