import { api, user } from '../api.js';
import { esc, $, toast } from '../ui.js';

export async function render(root) {
  const [me, st] = await Promise.all([api('/auth/me'), api('/system/status')]);
  const on = b => (b ? '<span class="pill approved">connected</span>' : '<span class="pill cancelled">not configured</span>');
  root.innerHTML = `<div class="cols">
    <div class="card"><h2>Your account</h2><p class="mut">${esc(me.name)} · ${esc(me.role)}</p>
      <form id="pf" style="margin-top:14px"><label>Mobile number (used for SMS alerts)</label><input name="phone" value="${esc(me.phone || '')}" maxlength="30" placeholder="+91 …"><button class="btn">Save number</button></form></div>
    <div class="card"><h2>Change password</h2><form id="pw"><label>Current password</label><input name="current" type="password" required autocomplete="current-password">
      <label>New password (10+ characters)</label><input name="next" type="password" minlength="10" required autocomplete="new-password"><button class="btn">Change password</button></form></div>
    <div class="card"><h2>Connected services</h2><table class="t"><tr><td>Email alerts</td><td>${on(st.email)}${st.email_dry_run ? ' <span class="mut">dry run</span>' : ''}</td></tr><tr><td>SMS alerts</td><td>${on(st.sms)}</td></tr><tr><td>Road routing</td><td>${on(st.routing)}</td></tr></table>
      <p class="mut" style="margin-top:10px">Services are switched on by the server administrator in the .env file. See the README.</p></div></div>`;
  $('#pf', root).onsubmit = async e => { e.preventDefault(); try { await api('/auth/profile', { method: 'PATCH', body: { phone: e.target.elements.phone.value } }); toast('Saved'); } catch (err) { toast(err.message, true); } };
  $('#pw', root).onsubmit = async e => {
    e.preventDefault();
    try { await api('/auth/password', { method: 'POST', body: { current: e.target.elements.current.value, next: e.target.elements.next.value } }); toast('Password changed'); e.target.reset(); }
    catch (err) { toast(err.message, true); }
  };
}
