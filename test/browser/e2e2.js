const { open, login, go, sleep, BASE, PW, shot } = require('./lib');
let pass = 0, fail = 0;
const check = (n, c, x) => { c ? pass++ : fail++; console.log(c ? 'PASS' : 'FAIL', n, c ? '' : (x || '')); };
const api = async (m, p, t, b) => { const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t && { Authorization: 'Bearer ' + t }) }, body: b ? JSON.stringify(b) : undefined }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
const tok = async e => (await api('POST', '/api/auth/login', null, { email: e + '@urbanresq.local', password: PW })).j.token;
const until = async (fn, ms = 6000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn(); if (v) return v; await sleep(150); } return null; };

(async () => {
  const coord = await tok('coord'), field = await tok('field');
  const { browser, page, errs } = await open();
  await login(page, 'coord@urbanresq.local');
  await go(page, 'dashboard');
  await page.evaluate(() => { window.__stay = 1; });
  check('live indicator shows connected', !!(await until(async () => /live/.test(await page.$eval('#live', e => e.textContent)))));
  const stat0 = Number(await page.$eval('.stat h3', e => e.textContent.replace(/,/g, '')));

  const inc = await api('POST', '/api/incidents', field, { kind: 'flood', severity: 'critical', area_id: 1, affected_pop: 900, lat: 19.0728, lng: 72.8826 });
  check('toast pushed to coordinator without reload', !!(await until(async () => /Critical incident/.test(await page.$$eval('.toast', t => t.map(x => x.textContent).join('|'))))));
  check('dashboard counter updated live', !!(await until(async () => Number(await page.$eval('.stat h3', e => e.textContent.replace(/,/g, ''))) === stat0 + 1)));
  check('page was not reloaded', (await page.evaluate(() => window.__stay)) === 1);
  check('bell badge shows unread', !!(await until(async () => (await page.$eval('#bellN', e => e.textContent)) !== '')));
  await page.screenshot({ path: shot('live-dash.png') });

  await go(page, 'incidents');
  await page.select('#severity', 'critical'); await sleep(700);
  const before = await page.$$eval('tr[data-id]', r => r.length);
  await api('POST', '/api/incidents', field, { kind: 'fire', severity: 'critical', area_id: 2, affected_pop: 50 });
  check('incident list grows live, filter kept', !!(await until(async () => (await page.$$eval('tr[data-id]', r => r.length)) === before + 1)) && (await page.$eval('#severity', s => s.value)) === 'critical');

  const asg = await api('POST', '/api/teams/3/assign', coord, { incident_id: inc.j.incident_id });
  check('team 3 deployed', asg.s === 201, asg);
  await go(page, 'teams');
  await page.setGeolocation({ latitude: 19.0601, longitude: 72.8902 });
  const share = await until(() => page.$('[data-share="3"]'));
  check('share-location button appears for deployed team', !!share);
  await share.click();
  const got = await until(async () => (await api('GET', '/api/teams/positions', field)).j.find(p => p.team_id === 3));
  check('browser geolocation reaches the server', !!got && Math.abs(Number(got.lat) - 19.0601) < 0.0005, got);
  check('button switches to Stop sharing', !!(await until(() => page.$('[data-stop]'))));

  const b2 = await open({ width: 1280, height: 800 });
  await login(b2.page, 'coord@urbanresq.local');
  await go(b2.page, 'map'); await sleep(1200);
  const sel = '#map path[stroke="#B38CFF"]';
  check('team marker is on the map', !!(await until(() => b2.page.$(sel))));
  const d1 = await b2.page.$eval(sel, p => p.getAttribute('d'));
  await api('POST', '/api/teams/3/position', field, { lat: 19.0700, lng: 72.9000, accuracy: 8 });
  check('marker moves live without reload', !!(await until(async () => (await b2.page.$eval(sel, p => p.getAttribute('d')).catch(() => d1)) !== d1)));
  await b2.page.screenshot({ path: shot('live-map.png') });
  const n0 = await b2.page.$$eval('#map path.leaflet-interactive', p => p.length);
  await api('POST', '/api/incidents', field, { kind: 'cyclone', severity: 'low', area_id: 6, affected_pop: 10, lat: 19.05, lng: 72.93 });
  check('new incident appears on the open map', !!(await until(async () => (await b2.page.$$eval('#map path.leaflet-interactive', p => p.length)) > n0)));
  check('second window had no browser errors', b2.errs.length === 0, b2.errs.join(' | '));
  await b2.browser.close();

  await page.click('[data-stop]'); await sleep(500);
  check('stop sharing works', !!(await page.$('[data-share="3"]')));
  check('no browser errors during the run', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('E2E CRASH', e.message); process.exit(1); });
