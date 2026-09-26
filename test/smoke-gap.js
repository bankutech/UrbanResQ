require('dotenv').config();
const base = process.env.API || 'http://localhost:4000';
const mock = process.env.MOCK_URL;
const pw = process.env.SMOKE_PASSWORD || process.env.SEED_PASSWORD;
let pass = 0, fail = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function call(method, path, token, body, raw) {
  const r = await fetch(base + path, { method, headers: { ...(!(body instanceof FormData) && { 'Content-Type': 'application/json' }), ...(token && { Authorization: 'Bearer ' + token }) },
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined });
  if (raw) return r;
  return { s: r.status, j: await r.json().catch(() => ({})) };
}
const check = (n, c, x) => { c ? pass++ : fail++; console.log(c ? 'PASS' : 'FAIL', n, c ? '' : JSON.stringify(x)); };
async function until(fn, ms = 4000) { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn(); if (v) return v; await sleep(150); } return null; }
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const file = (buf, type, name) => { const f = new FormData(); f.append('file', new Blob([buf], { type }), name); return f; };

(async () => {
  const login = async e => (await call('POST', '/api/auth/login', null, { email: e + '@urbanresq.local', password: pw })).j.token;
  const coord = await login('coord'), field = await login('field'), admin = await login('admin');
  const fieldId = (await call('GET', '/api/auth/me', field)).j.id, coordId = (await call('GET', '/api/auth/me', coord)).j.id;
  const status = (await call('GET', '/api/system/status', field)).j;

  // accounts
  const email = 'pw' + Date.now() + '@example.org';
  await call('POST', '/api/admin/users', admin, { full_name: 'Pw Test', email, password: 'first-password-1', role: 'field_team' });
  const tok = async p => (await call('POST', '/api/auth/login', null, { email, password: p })).j.token;
  const t1 = await tok('first-password-1');
  check('wrong current password is 403', (await call('POST', '/api/auth/password', t1, { current: 'nope-nope-nope', next: 'second-password-2' })).s === 403);
  check('short new password is 400', (await call('POST', '/api/auth/password', t1, { current: 'first-password-1', next: 'short' })).s === 400);
  check('password changed', (await call('POST', '/api/auth/password', t1, { current: 'first-password-1', next: 'second-password-2' })).s === 200);
  check('old password rejected, new accepted', !(await tok('first-password-1')) && !!(await tok('second-password-2')));
  check('unknown email gets same 401', (await call('POST', '/api/auth/login', null, { email: 'nobody@example.org', password: 'whatever-long' })).s === 401);
  check('phone profile saved', (await call('PATCH', '/api/auth/profile', field, { phone: '+91 90000 00001' })).s === 200);

  // stock rule
  check('restock with different expiry is 409', (await call('POST', '/api/stock/batches', coord, { warehouse_id: 1, resource_id: 1, batch_no: 'F-A', qty: 5, expiry_date: '2027-01-01' })).s === 409);
  check('restock with same expiry ok', (await call('POST', '/api/stock/batches', coord, { warehouse_id: 1, resource_id: 1, batch_no: 'F-A', qty: 5, expiry_date: '2026-12-20' })).s === 201);

  // incidents: critical alert, commander, deadline
  const crit = await call('POST', '/api/incidents', field, { kind: 'earthquake', severity: 'critical', area_id: 1, affected_pop: 4000, lat: 19.07, lng: 72.88 });
  check('critical incident created', crit.s === 201, crit);
  const iid = crit.j.incident_id;
  const n1 = await until(async () => (await call('GET', '/api/notifications', coord)).j.data?.find(n => n.kind === 'critical_incident' && n.incident_id === iid));
  check('coordinator notified of critical incident', !!n1);
  check('field not notified of critical incident', !(await call('GET', '/api/notifications', field)).j.data.some(n => n.kind === 'critical_incident' && n.incident_id === iid));
  if (status.sms && mock) {
    const hit = await until(async () => (await (await fetch(mock + '/_sms')).json()).find(m => m.to === '+910000000099' && /Critical incident/.test(m.text)));
    check('SMS sent through provider webhook', !!hit);
  }
  if (status.email_dry_run) check('email dry-run recorded', (await until(async () => (await call('GET', '/api/admin/audit?action=email_dry_run', admin)).j.total > 0)) === true);
  else if (status.email && mock) {
    const m = await until(async () => (await (await fetch(mock + '/_mail')).json()).find(x => x.to.includes('coord@urbanresq.local') && /Critical incident/.test(x.raw)));
    check('real SMTP delivery of critical alert', !!m && /Subject: \[UrbanResQ\]/.test(m.raw));
  }
  check('assign commander', (await call('PATCH', '/api/incidents/' + iid, coord, { commander_id: coordId, respond_by: '2026-12-31T10:00', priority: 5 })).s === 200);
  check('field cannot be commander', (await call('PATCH', '/api/incidents/' + iid, coord, { commander_id: fieldId })).s === 400);
  check('field cannot edit incident', (await call('PATCH', '/api/incidents/' + iid, field, { priority: 1 })).s === 403);
  const det = (await call('GET', '/api/incidents/' + iid, field)).j;
  check('commander + deadline stored', det.commander_id === coordId && /2026-12-31/.test(det.respond_by) && det.timeline.length >= 3, det);

  // broadcast + read
  check('field cannot broadcast', (await call('POST', '/api/broadcasts', field, { audience: 'all', message: 'x' })).s === 403);
  const bc = await call('POST', '/api/broadcasts', coord, { audience: 'field_team', message: 'Move to Shelter B', incident_id: iid, external: true });
  check('broadcast sent', bc.s === 201 && bc.j.recipients >= 1, bc);
  const fn = (await call('GET', '/api/notifications?unread=1', field)).j;
  check('field receives broadcast', fn.data.some(n => n.kind === 'broadcast') && fn.unread >= 1, fn);
  await call('POST', '/api/notifications/read', field, { ids: [fn.data[0].notification_id] });
  check('mark one read', (await call('GET', '/api/notifications', field)).j.unread === fn.unread - 1);
  await call('POST', '/api/notifications/read', field, { all: true });
  check('mark all read', (await call('GET', '/api/notifications', field)).j.unread === 0);
  check('read needs ids', (await call('POST', '/api/notifications/read', field, {})).s === 400);

  // request / dispatch notifications
  const rq = await call('POST', '/api/requests', field, { incident_id: iid, priority: 'critical', items: [{ resource_id: 4, qty: 5 }] });
  check('urgent request alerts coordinator', !!(await until(async () => (await call('GET', '/api/notifications', coord)).j.data.find(n => n.kind === 'urgent_request'))));
  await call('POST', `/api/requests/${rq.j.request_id}/decision`, coord, { decision: 'approve', note: 'go' });
  check('requester told of decision', !!(await until(async () => (await call('GET', '/api/notifications', field)).j.data.find(n => n.kind === 'request_decision' && /approved/.test(n.title)))));
  const al = await call('POST', '/api/allocations', coord, { request_id: rq.j.request_id, warehouse_id: 3 });
  check('allocate from low depot', al.s === 201, al);
  check('requester told of dispatch', !!(await until(async () => (await call('GET', '/api/notifications', field)).j.data.find(n => n.kind === 'dispatch_update'))));
  check('low-stock alert for coordinators', !!(await until(async () => (await call('GET', '/api/notifications', coord)).j.data.find(n => n.kind === 'low_stock'))));

  // incident messages
  check('post incident message', (await call('POST', `/api/incidents/${iid}/messages`, field, { message: 'Road blocked at junction' })).s === 201);
  const msgs = (await call('GET', `/api/incidents/${iid}/messages`, field)).j;
  check('message log has broadcast + note', msgs.length >= 2, msgs);

  // attachments
  const up = await call('POST', `/api/incidents/${iid}/attachments`, field, file(PNG, 'image/png', '../../evil name.png'));
  check('upload png', up.s === 201, up);
  check('fake png rejected', (await call('POST', `/api/incidents/${iid}/attachments`, field, file(Buffer.from('not an image at all'), 'image/png', 'a.png'))).s === 400);
  check('exe rejected', (await call('POST', `/api/incidents/${iid}/attachments`, field, file(Buffer.from('MZ....'), 'application/x-msdownload', 'a.exe'))).s === 400);
  check('6 MB file rejected', (await call('POST', `/api/incidents/${iid}/attachments`, field, file(Buffer.concat([Buffer.from('%PDF-1.4'), Buffer.alloc(6 * 1024 * 1024)]), 'application/pdf', 'big.pdf'))).s === 400);
  const list = (await call('GET', `/api/incidents/${iid}/attachments`, field)).j;
  check('attachment listed with safe name', list.length === 1 && !/[\\/]/.test(list[0].file_name), list);
  const dl = await call('GET', `/api/attachments/${up.j.attachment_id}/download`, coord, null, true);
  const bytes = Buffer.from(await dl.arrayBuffer());
  check('attachment downloads intact', dl.status === 200 && bytes.equals(PNG));
  check('download needs login', (await call('GET', `/api/attachments/${up.j.attachment_id}/download`, null, null, true)).status === 401);
  check('delete attachment', (await call('DELETE', `/api/attachments/${up.j.attachment_id}`, coord)).s === 200);

  // registry
  check('field blocked from registry', (await call('GET', '/api/registry/victims', field)).s === 403);
  const vic = await call('POST', '/api/registry/victims', coord, { incident_id: iid, full_name: 'Test Person', age: 34, condition_note: 'minor injury', status: 'sheltered', shelter_id: 1 });
  check('register victim', vic.s === 201, vic);
  check('age out of range is 400', (await call('POST', '/api/registry/victims', coord, { incident_id: iid, full_name: 'X', age: 400 })).s === 400);
  check('victim search', (await call('GET', '/api/registry/victims?q=Test', coord)).j.data.some(v => v.victim_id === vic.j.victim_id));
  check('registry reads are audited', (await call('GET', '/api/admin/audit?action=view', admin)).j.total >= 1);
  const mp = await call('POST', '/api/registry/missing', coord, { full_name: 'Lost Person', age: 9, description: 'red jacket', last_seen_area_id: 1, reporter_name: 'Parent', reporter_contact: '+910000000555' });
  check('missing report', mp.s === 201, mp);
  check('reunify before located is 409', (await call('POST', `/api/registry/missing/${mp.j.missing_id}/reunify`, coord, { handed_to: 'Parent', id_checked: true })).s === 409);
  check('mark located', (await call('POST', `/api/registry/missing/${mp.j.missing_id}/located`, coord, { identified: true, note: 'at Shelter A' })).s === 200);
  check('handover needs ID check', (await call('POST', `/api/registry/missing/${mp.j.missing_id}/reunify`, coord, { handed_to: 'Parent' })).s === 400);
  check('reunified', (await call('POST', `/api/registry/missing/${mp.j.missing_id}/reunify`, coord, { handed_to: 'Parent', id_checked: true })).s === 200);

  // map extras
  const rb = await call('POST', '/api/road-blocks', field, { lat: 19.06, lng: 72.89, description: 'Flooded underpass' });
  check('mark blocked road', rb.s === 201, rb);
  check('bad coordinates rejected', (await call('POST', '/api/road-blocks', field, { lat: 999, lng: 0, description: 'x' })).s === 400);
  check('blocked roads listed', (await call('GET', '/api/road-blocks', field)).j.some(b => b.block_id === rb.j.block_id));
  if (status.routing) {
    const rt = await call('GET', '/api/route?from=19.07,72.88&to=19.05,72.90', field);
    check('route returned', rt.s === 200 && rt.j.distance_km === 2.5 && rt.j.coordinates.length === 3, rt);
    check('route warns about blocked road', rt.j.blocked_warning.some(b => b.block_id === rb.j.block_id), rt.j);
    check('bad route params are 400', (await call('GET', '/api/route?from=abc&to=1,2', field)).s === 400);
  } else check('routing reports 501 when unconfigured', (await call('GET', '/api/route?from=1,2&to=3,4', field)).s === 501);
  check('clear road block', (await call('POST', `/api/road-blocks/${rb.j.block_id}/clear`, field)).s === 200);
  if (mock) { const w = await call('GET', '/api/weather', field); check('weather with alert flag', w.s === 200 && w.j.available && w.j.data[0].alert === true, w); }

  // damage, donations, personnel, resources, facilities
  check('damage assessment saved', (await call('POST', `/api/incidents/${iid}/damage`, field, { buildings_damaged: 12, roads_affected: 'Link Rd', est_loss: 250000 })).s === 201);
  check('damage list', (await call('GET', `/api/incidents/${iid}/damage`, field)).j.length === 1);
  check('negative damage is 400', (await call('POST', `/api/incidents/${iid}/damage`, field, { buildings_damaged: -1 })).s === 400);
  const before = (await call('GET', '/api/stock?warehouse_id=1', coord)).j.find(r => r.resource_id === 3).qty;
  check('goods donation', (await call('POST', '/api/donations', coord, { donor_name: 'Local NGO', kind: 'goods', resource_id: 3, warehouse_id: 1, qty: 100, batch_no: 'D-1', expiry_date: '2027-08-01' })).s === 201);
  check('donation adds stock', (await call('GET', '/api/stock?warehouse_id=1', coord)).j.find(r => r.resource_id === 3).qty === before + 100);
  check('cash donation', (await call('POST', '/api/donations', coord, { donor_name: 'Anon', kind: 'cash', amount: 5000 })).s === 201);
  check('cash needs amount', (await call('POST', '/api/donations', coord, { donor_name: 'Anon', kind: 'cash' })).s === 400);
  check('donation totals', (await call('GET', '/api/donations', coord)).j.cash_total >= 5000);
  check('field cannot log donations', (await call('POST', '/api/donations', field, { donor_name: 'x', kind: 'cash', amount: 1 })).s === 403);
  const crew = (await call('GET', '/api/teams/1/personnel', field)).j;
  check('crew list', crew.length >= 2);
  const np = await call('POST', '/api/teams/1/personnel', coord, { full_name: 'New Crew', role: 'Medic' });
  check('add crew + remove', np.s === 201 && (await call('DELETE', '/api/personnel/' + np.j.person_id, coord)).s === 200);
  const nm = 'Test resource ' + Date.now();
  check('new resource', (await call('POST', '/api/resources', coord, { category_id: 1, name: nm, unit: 'box' })).s === 201);
  check('duplicate resource is 409', (await call('POST', '/api/resources', coord, { category_id: 1, name: nm, unit: 'box' })).s === 409);
  check('new hospital', (await call('POST', '/api/hospitals', coord, { name: 'Test Hospital', area_id: 1, lat: 19.07, lng: 72.88, beds_total: 50 })).s === 201);
  check('hospital needs coordinates', (await call('POST', '/api/hospitals', coord, { name: 'No Geo', area_id: 1, beds_total: 5 })).s === 400);
  const sh = await call('POST', '/api/shelters', coord, { name: 'Test Shelter', area_id: 1, lat: 19.07, lng: 72.88, capacity: 100, occupancy: 10 });
  check('new shelter', sh.s === 201, sh);
  await call('PATCH', '/api/shelters/' + sh.j.shelter_id, field, { occupancy: 55 });

  // analytics + exports
  const an = (await call('GET', '/api/analytics', field)).j;
  check('shelter trend present', an.shelter_trend.length > 0 && an.shortages.every(s => 'times_short' in s), an.shelter_trend);
  const risk = await call('GET', '/api/analytics/risk', field);
  check('risk bands', risk.s === 200 && risk.j.data.length >= 6 && ['low', 'moderate', 'high'].includes(risk.j.data[0].band), risk);
  const fc = await call('GET', '/api/analytics/forecast', field);
  check('forecast from dispatch history', fc.s === 200 && fc.j.data.some(d => d.used_30d > 0 && d.next_7d >= 0), fc);
  const dash = (await call('GET', '/api/dashboard', field)).j;
  check('utilization on dashboard', typeof dash.counters.utilization_pct === 'number');
  const x = await call('GET', '/api/analytics/export/stock?format=xlsx', coord, null, true);
  check('xlsx export', x.status === 200 && /spreadsheetml/.test(x.headers.get('content-type')) && Buffer.from(await x.arrayBuffer()).subarray(0, 2).toString() === 'PK');
  const pd = await call('GET', '/api/analytics/export/incidents?format=pdf', coord, null, true);
  check('pdf export', pd.status === 200 && Buffer.from(await pd.arrayBuffer()).subarray(0, 4).toString() === '%PDF');
  check('bad export format is 400', (await call('GET', '/api/analytics/export/stock?format=exe', coord)).s === 400);
  check('field cannot export xlsx', (await call('GET', '/api/analytics/export/stock?format=xlsx', field)).s === 403);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
