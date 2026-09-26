require('dotenv').config();
const base = process.env.API || 'http://localhost:4000';
const pw = process.env.SMOKE_PASSWORD || process.env.SEED_PASSWORD;
let pass = 0, fail = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (n, c, x) => { c ? pass++ : fail++; console.log(c ? 'PASS' : 'FAIL', n, c ? '' : JSON.stringify(x)); };
async function call(method, path, token, body) {
  const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) }, body: body ? JSON.stringify(body) : undefined });
  return { s: r.status, j: await r.json().catch(() => ({})) };
}
async function listen(token) {
  const events = [], ac = new AbortController(), out = { events, ended: false, close: () => ac.abort() };
  const r = await fetch(base + '/api/stream', { headers: { Authorization: 'Bearer ' + token }, signal: ac.signal });
  out.status = r.status; out.type = r.headers.get('content-type');
  (async () => {
    const reader = r.body.getReader(), dec = new TextDecoder(); let buf = '';
    try { for (;;) { const { value, done } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true });
      let i; while ((i = buf.indexOf('\n\n')) >= 0) { const ch = buf.slice(0, i); buf = buf.slice(i + 2); const ev = /event: (.*)/.exec(ch)?.[1], d = /data: (.*)/.exec(ch)?.[1]; if (ev) events.push({ ev, data: JSON.parse(d) }); } } } catch { /* aborted */ }
    out.ended = true;
  })();
  return out;
}
async function until(fn, ms = 4000) { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn(); if (v) return v; await sleep(120); } return null; }

(async () => {
  const login = async e => (await call('POST', '/api/auth/login', null, { email: e + '@urbanresq.local', password: pw })).j.token;
  const coord = await login('coord'), field = await login('field');
  const hz = await fetch(base + '/healthz');
  check('healthz is open and ok', hz.status === 200 && (await hz.json()).ok === true);
  check('stream needs login', (await fetch(base + '/api/stream')).status === 401);

  const cs = await listen(coord), fs = await listen(field);
  check('stream is event-stream and says hello', cs.type.startsWith('text/event-stream') && !!(await until(() => cs.events.find(e => e.ev === 'hello'))));

  const inc = await call('POST', '/api/incidents', field, { kind: 'flood', severity: 'high', area_id: 5, affected_pop: 300 });
  check('coordinator stream gets refresh after a change', !!(await until(() => cs.events.find(e => e.ev === 'refresh' && e.data.topics.includes('incidents')))));
  await call('POST', '/api/broadcasts', coord, { audience: 'field_team', message: 'Stream test broadcast' });
  check('field stream gets pushed notification', !!(await until(() => fs.events.find(e => e.ev === 'notification' && /Stream test/.test(e.data.title)))));
  check('coordinator is not sent a field-only alert', !cs.events.some(e => e.ev === 'notification' && /Stream test/.test(e.data.title)));

  // live team location
  const asg = await call('POST', '/api/teams/2/assign', coord, { incident_id: inc.j.incident_id });
  check('team deployed for tracking test', asg.s === 201, asg);
  check('position needs valid coordinates', (await call('POST', '/api/teams/2/position', field, { lat: 200, lng: 10 })).s === 400);
  check('off-duty team cannot share position', (await call('POST', '/api/teams/4/position', field, { lat: 19.05, lng: 72.88 })).s === 409);
  check('field shares position', (await call('POST', '/api/teams/2/position', field, { lat: 19.0612, lng: 72.8801, accuracy: 12 })).s === 200);
  const tp = await until(() => cs.events.find(e => e.ev === 'team_position' && e.data.team_id === 2));
  check('position pushed live to the map', !!tp && tp.data.lat === 19.0612, tp);
  const pos = (await call('GET', '/api/teams/positions', field)).j;
  check('positions endpoint', pos.some(p => p.team_id === 2 && Number(p.lat) === 19.0612 && p.age_min <= 1), pos);
  check('map data carries team positions', (await call('GET', '/api/map', field)).j.teams.some(t => t.team_id === 2));
  check('teams list shows last seen', (await call('GET', '/api/teams', field)).j.find(t => t.team_id === 2).seen_min_ago <= 1);
  await call('POST', `/api/team-assignments/${asg.j.assignment_id}/check`, field, { direction: 'in' });
  await call('POST', `/api/team-assignments/${asg.j.assignment_id}/check`, field, { direction: 'out' });
  check('position cleared on check-out', !(await call('GET', '/api/teams/positions', field)).j.some(p => p.team_id === 2));

  // connection cap
  const many = []; for (let i = 0; i < 6; i++) many.push(await listen(coord));
  check('oldest stream is closed beyond 5 per user', !!(await until(() => cs.ended)));
  many.forEach(m => m.close()); cs.close(); fs.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(1); });
