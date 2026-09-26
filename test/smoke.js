require('dotenv').config();
const base = process.env.API || 'http://localhost:4000';
const pw = process.env.SMOKE_PASSWORD || process.env.SEED_PASSWORD;
let pass = 0, fail = 0;

async function call(method, path, token, body) {
  const r = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body ? JSON.stringify(body) : undefined });
  return { s: r.status, j: await r.json().catch(() => ({})) };
}
function check(name, cond, extra) {
  cond ? pass++ : fail++;
  console.log(cond ? 'PASS' : 'FAIL', name, cond ? '' : JSON.stringify(extra));
}

(async () => {
  const login = async e => (await call('POST', '/api/auth/login', null, { email: e + '@urbanresq.local', password: pw })).j.token;
  const coord = await login('coord'), field = await login('field'), admin = await login('admin');
  check('login gives tokens', coord && field);
  check('bad password is 401', (await call('POST', '/api/auth/login', null, { email: 'coord@urbanresq.local', password: 'nope' })).s === 401);
  check('no token is 401', (await call('GET', '/api/incidents')).s === 401);

  const bad = await call('POST', '/api/incidents', field, { kind: 'flood', severity: 'huge', area_id: 1 });
  check('bad severity is 400', bad.s === 400, bad);
  const inc = await call('POST', '/api/incidents', field, { kind: 'flood', severity: 'high', area_id: 2, affected_pop: 800, description: 'smoke test' });
  check('field creates incident', inc.s === 201 && /^INC-/.test(inc.j.code), inc);

  const rq = await call('POST', '/api/requests', field, { incident_id: inc.j.incident_id, priority: 'high', items: [{ resource_id: 7, qty: 2 }] });
  check('field creates request', rq.s === 201, rq);
  const id = rq.j.request_id;
  check('field cannot approve', (await call('POST', `/api/requests/${id}/decision`, field, { decision: 'approve' })).s === 403);
  check('allocate before approval is 409', (await call('POST', '/api/allocations', coord, { request_id: id, warehouse_id: 1 })).s === 409);
  check('coordinator approves', (await call('POST', `/api/requests/${id}/decision`, coord, { decision: 'approve', note: 'ok' })).s === 200);
  check('double approval is 409', (await call('POST', `/api/requests/${id}/decision`, coord, { decision: 'approve' })).s === 409);

  const al = await call('POST', '/api/allocations', coord, { request_id: id, warehouse_id: 1 });
  check('allocation dispatches 2 units', al.s === 201 && Number(al.j.units) === 2, al);
  const aid = al.j.allocation_id;
  check('skip to delivered is 409', (await call('PATCH', `/api/allocations/${aid}/status`, field, { status: 'delivered', recipient_name: 'X' })).s === 409);
  check('in transit', (await call('PATCH', `/api/allocations/${aid}/status`, field, { status: 'in_transit' })).s === 200);
  check('delivered needs recipient', (await call('PATCH', `/api/allocations/${aid}/status`, field, { status: 'delivered' })).s === 400);
  check('delivered', (await call('PATCH', `/api/allocations/${aid}/status`, field, { status: 'delivered', recipient_name: 'Ward office' })).s === 200);
  check('cannot cancel delivered', (await call('POST', `/api/allocations/${aid}/cancel`, coord)).s === 409);

  check('field cannot restock', (await call('POST', '/api/stock/batches', field, { warehouse_id: 1, resource_id: 7, batch_no: 'X', qty: 5 })).s === 403);
  const list = await call('GET', '/api/incidents?severity=critical&limit=5', field);
  check('incident filter + paging', list.s === 200 && list.j.total >= 1 && list.j.data.length <= 5, list);
  const dash = await call('GET', '/api/dashboard', field);
  check('dashboard counters', dash.s === 200 && dash.j.counters.active_incidents >= 1, dash);
  const low = await call('GET', '/api/stock/low', field);
  check('low stock list', low.s === 200 && Array.isArray(low.j), low);
  const detail = await call('GET', `/api/incidents/${inc.j.incident_id}`, field);
  check('timeline logged', detail.s === 200 && detail.j.timeline.length >= 3, detail);

  // phase 4
  const teams = await call('GET', '/api/teams', field);
  check('teams list', teams.s === 200 && teams.j.length >= 4, teams);
  const tinc = await call('POST', '/api/incidents', field, { kind: 'fire', severity: 'high', area_id: 2, affected_pop: 100 });
  check('field cannot assign team', (await call('POST', '/api/teams/1/assign', field, { incident_id: tinc.j.incident_id })).s === 403);
  const asg = await call('POST', '/api/teams/1/assign', coord, { incident_id: tinc.j.incident_id });
  check('coordinator assigns team', asg.s === 201, asg);
  check('busy team cannot be re-assigned', (await call('POST', '/api/teams/1/assign', coord, { incident_id: tinc.j.incident_id })).s === 409);
  check('check-out before check-in is 409', (await call('POST', `/api/team-assignments/${asg.j.assignment_id}/check`, field, { direction: 'out' })).s === 409);
  check('team checks in', (await call('POST', `/api/team-assignments/${asg.j.assignment_id}/check`, field, { direction: 'in' })).s === 200);
  check('team checks out', (await call('POST', `/api/team-assignments/${asg.j.assignment_id}/check`, field, { direction: 'out' })).s === 200);
  const t1 = (await call('GET', '/api/teams', field)).j.find(t => t.team_id === 1);
  check('team available again', t1.status === 'available' && t1.missions_done >= 1, t1);

  const vol = await call('POST', '/api/volunteers', field, { full_name: 'Test Volunteer', skills: 'driving' });
  check('field registers volunteer', vol.s === 201, vol);
  check('volunteer assigned', (await call('POST', `/api/volunteers/${vol.j.volunteer_id}/assign`, coord, { incident_id: tinc.j.incident_id, task: 'Run supplies' })).s === 201);
  check('volunteer cannot be double-booked', (await call('POST', `/api/volunteers/${vol.j.volunteer_id}/assign`, coord, { incident_id: tinc.j.incident_id, task: 'Again' })).s === 409);
  check('volunteer released', (await call('POST', `/api/volunteers/${vol.j.volunteer_id}/release`, field)).s === 200);

  check('hospital beds over total is 400', (await call('PATCH', '/api/hospitals/1', coord, { beds_available: 9999, ambulances_available: 1, er_status: 'open' })).s === 400);
  check('hospital update', (await call('PATCH', '/api/hospitals/1', coord, { beds_available: 70, ambulances_available: 5, er_status: 'busy' })).s === 200);
  check('field cannot update hospital', (await call('PATCH', '/api/hospitals/1', field, { beds_available: 70, ambulances_available: 5, er_status: 'busy' })).s === 403);
  check('shelter over capacity is 400', (await call('PATCH', '/api/shelters/1', field, { occupancy: 99999 })).s === 400);
  check('field updates shelter', (await call('PATCH', '/api/shelters/2', field, { occupancy: 150, needs: 'Food' })).s === 200);

  const map = await call('GET', '/api/map', field);
  check('map data', map.s === 200 && map.j.incidents.length && map.j.hospitals.length && map.j.shelters.length, map);
  const an = await call('GET', '/api/analytics', field);
  check('analytics', an.s === 200 && an.j.demand.length && an.j.minutes.approval != null, an);
  const csv = await fetch(base + '/api/analytics/export/incidents', { headers: { Authorization: 'Bearer ' + coord } });
  check('csv export', csv.status === 200 && /text\/csv/.test(csv.headers.get('content-type')) && (await csv.text()).startsWith('code,'));
  check('field cannot export', (await call('GET', '/api/analytics/export/incidents', field)).s === 403);

  check('coordinator cannot list users', (await call('GET', '/api/admin/users', coord)).s === 403);
  check('admin lists users', (await call('GET', '/api/admin/users', admin)).s === 200);
  check('short password is 400', (await call('POST', '/api/admin/users', admin, { full_name: 'X', email: 'x@example.org', password: 'short', role: 'field_team' })).s === 400);
  const nu = await call('POST', '/api/admin/users', admin, { full_name: 'New Person', email: 'new' + Date.now() + '@example.org', password: 'a-long-password-1', role: 'field_team' });
  check('admin creates user', nu.s === 201, nu);
  check('admin audit log', (await call('GET', '/api/admin/audit?limit=5', admin)).j.total > 5);
  const me = await call('GET', '/api/auth/me', admin);
  check('admin cannot edit self', (await call('PATCH', '/api/admin/users/' + me.j.id, admin, { is_active: false })).s === 409);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
