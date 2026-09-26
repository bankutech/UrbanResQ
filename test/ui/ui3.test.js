require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { JSDOM } = require('jsdom');
const fs = require('fs');
const BASE = (process.env.UI_BASE || 'http://localhost:4000'), PW = process.env.SEED_PASSWORD;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { c ? pass++ : fail++; console.log(c ? 'PASS' : 'FAIL', n, c ? '' : (x || '')); };

async function session(email) {
  const dom = new JSDOM('<!DOCTYPE html><body><div id="root"></div></body>', { url: BASE + '/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  w.fetch = (u, o) => fetch(new URL(u, BASE), o);
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new w.Event('close')); };
  w.confirm = () => true;
  const chain = new Proxy(function () {}, { get: (t, k) => (k === 'then' ? undefined : chain), apply: () => chain });
  w.L = chain;
  w.eval(fs.readFileSync(require('path').join(__dirname, 'bundle.js'), 'utf8'));
  await sleep(100);
  const s = {
    w, d, $: x => d.querySelector(x),
    click: el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })),
    submit: f => f.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })),
    toasts: () => [...d.querySelectorAll('.toast')].map(t => t.textContent).join('|'),
    go: async id => { w.location.hash = '#/' + id; await sleep(1000); },
    fill: (form, o) => { for (const [k, v] of Object.entries(o)) { const el = form.elements[k]; el.type === 'checkbox' ? (el.checked = v) : (el.value = v); } }
  };
  const lf = s.$('#lf'); lf.elements.email.value = email; lf.elements.password.value = PW;
  s.submit(lf); await sleep(1000);
  return s;
}

(async () => {
  const c = await session('coord@urbanresq.local');
  const nav = [...c.d.querySelectorAll('#side a')].map(a => a.dataset.id);
  check('nav has all new pages', ['notifications', 'donations', 'registry', 'risk', 'comms', 'settings'].every(x => nav.includes(x)), nav.join());
  check('bell present', !!c.$('#bell'));
  for (const id of ['dashboard', 'notifications', 'comms', 'donations', 'registry', 'risk', 'settings', 'map', 'analytics']) {
    await c.go(id);
    check(`page ${id} renders`, !c.$('#view p.err') && c.$('#view').textContent.length > 40, c.$('#view p.err')?.textContent);
  }
  await c.go('dashboard');
  check('utilization stat on dashboard', /Stock deployed/.test(c.$('#view').textContent));
  await c.go('analytics');
  check('9 export buttons (csv/xlsx/pdf)', c.d.querySelectorAll('[data-exp]').length === 9);

  // incident drawer: damage + commander
  await c.go('incidents');
  c.click(c.$('tr[data-id]')); await sleep(900);
  const dr = c.$('dialog');
  check('drawer shows files, damage, commander', /Files/.test(dr.textContent) && /Damage assessment/.test(dr.textContent) && /Commander/.test(dr.textContent));
  c.fill(c.$('#df'), { buildings_damaged: '3' }); c.submit(c.$('#df')); await sleep(1200);
  check('damage assessment from UI', /Assessment saved/.test(c.toasts()), c.toasts());
  const opt = [...c.$('#cmd').options].find(o => o.value);
  c.$('#cmd').value = opt.value; c.click(c.$('#setcmd')); await sleep(1200);
  check('commander set from UI', /Saved/.test(c.toasts()) && /Commander/.test(c.$('dialog').textContent), c.toasts());
  c.click(c.$('dialog [data-close]')); await sleep(100);
  c.click(c.$('#new')); await sleep(200);
  check('report form has lat/lng/deadline', !!c.$('#nf').elements.lat && !!c.$('#nf').elements.respond_by);
  c.fill(c.$('#nf'), { description: 'blank coords', lat: '', lng: '' }); c.submit(c.$('#nf')); await sleep(1000);
  check('blank coordinates accepted', /Reported INC-/.test(c.toasts()), c.toasts());

  // comms
  await c.go('comms');
  c.fill(c.$('#bf'), { message: 'UI broadcast test' }); c.submit(c.$('#bf')); await sleep(1000);
  check('broadcast from UI', /Sent to/.test(c.toasts()), c.toasts());
  c.$('#mt').value = 'Note from UI'; c.click(c.$('#post')); await sleep(900);
  check('incident message log updates', /Note from UI/.test(c.$('#log').textContent));

  // donations
  await c.go('donations');
  c.click(c.$('#cash')); await sleep(300);
  c.fill(c.$('dialog form'), { donor_name: 'UI Donor', amount: '2500' }); c.submit(c.$('dialog form')); await sleep(1000);
  check('cash donation from UI', /Donation recorded/.test(c.toasts()), c.toasts());
  await c.go('donations');
  c.click(c.$('#goods')); await sleep(500);
  c.fill(c.$('dialog form'), { donor_name: 'UI Goods', qty: '10', batch_no: 'UI-1' }); c.submit(c.$('dialog form')); await sleep(1000);
  check('goods donation from UI', /Donation recorded/.test(c.toasts()), c.toasts());

  // registry
  await c.go('registry');
  check('registry shows restricted notice', /Restricted access/.test(c.$('#view').textContent));
  c.click(c.$('#newv')); await sleep(500);
  c.fill(c.$('dialog form'), { full_name: 'UI Victim', age: '40' }); c.submit(c.$('dialog form')); await sleep(1000);
  check('register victim from UI', /Registered/.test(c.toasts()), c.toasts());
  c.click(c.d.querySelector('[data-tab=missing]')); await sleep(800);
  c.click(c.$('#newm')); await sleep(500);
  c.fill(c.$('dialog form'), { full_name: 'UI Missing', reporter_name: 'Rel', reporter_contact: '999' }); c.submit(c.$('dialog form')); await sleep(1000);
  check('missing report from UI', /Report filed/.test(c.toasts()), c.toasts());
  c.click(c.$('[data-loc]')); await sleep(300);
  c.submit(c.$('dialog form')); await sleep(1000);
  check('mark located from UI', /Marked located/.test(c.toasts()), c.toasts());
  c.click(c.$('[data-hand]')); await sleep(300);
  c.fill(c.$('dialog form'), { handed_to: 'Relative', id_checked: true }); c.submit(c.$('dialog form')); await sleep(1000);
  check('handover from UI', /Reunification recorded/.test(c.toasts()), c.toasts());

  // facilities / inventory / crew
  await c.go('hospitals'); c.click(c.$('#addh')); await sleep(500);
  c.fill(c.$('dialog form'), { name: 'UI Hospital', lat: '19.05', lng: '72.88', beds_total: '40' }); c.submit(c.$('dialog form')); await sleep(1000);
  check('add hospital from UI', /Hospital added/.test(c.toasts()), c.toasts());
  await c.go('shelters'); c.click(c.$('#adds')); await sleep(500);
  c.fill(c.$('dialog form'), { name: 'UI Shelter', lat: '19.05', lng: '72.88', capacity: '80' }); c.submit(c.$('dialog form')); await sleep(1000);
  check('add shelter from UI', /Shelter added/.test(c.toasts()), c.toasts());
  await c.go('inventory'); c.click(c.$('#newres')); await sleep(500);
  c.fill(c.$('dialog form'), { name: 'UI resource ' + Date.now(), unit: 'box' }); c.submit(c.$('dialog form')); await sleep(1000);
  check('new resource from UI', /Resource added/.test(c.toasts()), c.toasts());
  await c.go('teams'); c.click(c.$('[data-crew]')); await sleep(800);
  c.fill(c.$('#cf'), { full_name: 'UI Crew Person', role: 'Medic' }); c.submit(c.$('#cf')); await sleep(1200);
  check('crew add from UI', /UI Crew Person/.test(c.$('dialog').textContent));

  // settings + notifications
  await c.go('settings');
  c.fill(c.$('#pw'), { current: 'definitely-wrong-1', next: 'brand-new-password-1' }); c.submit(c.$('#pw')); await sleep(1500);
  check('wrong current password shown as error', /Current password is wrong/.test(c.toasts()), c.toasts());
  c.fill(c.$('#pf'), { phone: '+91 99999 11111' }); c.submit(c.$('#pf')); await sleep(900);
  check('phone saved from UI', /Saved/.test(c.toasts()), c.toasts());
  await c.go('notifications');
  check('notifications list has entries', c.d.querySelectorAll('#view .feed li[data-n]').length >= 1);
  c.click(c.$('#all')); await sleep(900);
  check('mark all read from UI', /All marked read/.test(c.toasts()), c.toasts());

  const f = await session('field@urbanresq.local');
  const fnav = [...f.d.querySelectorAll('#side a')].map(a => a.dataset.id);
  check('field user: no registry/admin, has settings', !fnav.includes('registry') && !fnav.includes('admin') && fnav.includes('settings'), fnav.join());
  await f.go('hospitals');
  check('field user has no add-hospital button', !f.$('#addh'));
  await f.go('comms');
  check('field user has no broadcast form', !f.$('#bf'));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
