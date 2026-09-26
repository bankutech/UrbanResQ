require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { JSDOM } = require('jsdom'); const fs = require('fs');
const BASE = (process.env.UI_BASE || 'http://localhost:4000'), sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const tok = (await (await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'coord@urbanresq.local', password: process.env.SEED_PASSWORD }) })).json()).token;
  const evil = '<img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script>';
  await fetch(BASE + '/api/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: JSON.stringify({ kind: 'fire', severity: 'low', area_id: 1, description: evil }) });
  await fetch(BASE + '/api/broadcasts', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: JSON.stringify({ audience: 'all', message: evil }) });
  const dom = new JSDOM('<body><div id="root"></div></body>', { url: BASE + '/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  w.fetch = (u, o) => fetch(new URL(u, BASE), o);
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.dispatchEvent(new w.Event('close')); };
  w.eval(fs.readFileSync(require('path').join(__dirname, 'bundle.js'), 'utf8')); await sleep(100);
  const lf = d.querySelector('#lf'); lf.elements.email.value = 'coord@urbanresq.local'; lf.elements.password.value = process.env.SEED_PASSWORD;
  lf.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await sleep(1000);
  let bad = 0;
  for (const id of ['incidents', 'comms', 'notifications', 'dashboard']) {
    w.location.hash = '#/' + id; await sleep(1000);
    if (id === 'incidents') { const rows = [...d.querySelectorAll('tr[data-id]')]; rows[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await sleep(800); }
    if (d.querySelector('#view img, #view script, dialog img, dialog script') || w.__pwned) bad++;
  }
  console.log(bad ? 'FAIL xss: markup was rendered' : 'PASS xss: user text stays text on all pages');
  process.exit(bad ? 1 : 0);
})();
