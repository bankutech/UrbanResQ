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
    go: async id => { w.location.hash = '#/' + id; await sleep(900); }
  };
  const lf = s.$('#lf'); lf.elements.email.value = email; lf.elements.password.value = PW;
  s.submit(lf); await sleep(900);
  return s;
}

(async () => {
  const c = await session('coord@urbanresq.local');
  const nav = [...c.d.querySelectorAll('#side a')].map(a => a.dataset.id);
  check('coordinator sees phase 4 nav, not admin', nav.includes('teams') && nav.includes('map') && !nav.includes('admin'), nav.join());
  for (const id of ['teams', 'volunteers', 'hospitals', 'shelters', 'map', 'analytics']) {
    await c.go(id);
    check(`page ${id} renders`, !c.$('#view p.err') && c.$('#view').textContent.length > 40 || id === 'map', c.$('#view p.err')?.textContent);
  }
  await c.go('map');
  check('map page builds without errors', !c.$('#view p.err') && !!c.$('#map'), c.$('#view p.err')?.textContent);

  await c.go('teams');
  c.click(c.$('[data-assign]')); await sleep(600);
  check('assign dialog lists incidents', /Incident/.test(c.$('dialog')?.textContent || ''));
  c.click(c.$('#ok')); await sleep(1000);
  check('team assigned from UI', /Team assigned/.test(c.toasts()), c.toasts());
  await c.go('teams');
  c.click(c.$('[data-chk$=":in"]')); await sleep(900);
  await c.go('teams');
  c.click(c.$('[data-chk$=":out"]')); await sleep(900);
  check('check in/out from UI', /Checked out/.test(c.toasts()), c.toasts());

  await c.go('hospitals');
  c.click(c.$('[data-edit]')); await sleep(300);
  c.$('#b').value = '55'; c.click(c.$('#ok')); await sleep(900);
  check('hospital update from UI', /Updated/.test(c.toasts()), c.toasts());
  await c.go('shelters');
  c.click(c.$('[data-edit]')); await sleep(300);
  c.$('#o').value = '99999'; c.click(c.$('#ok')); await sleep(900);
  check('shelter over capacity rejected in UI', /exceed/.test(c.toasts()), c.toasts());
  await c.go('analytics');
  check('analytics export buttons for coordinator', c.d.querySelectorAll('[data-exp]').length === 9);

  const a = await session('admin@urbanresq.local');
  check('admin sees admin nav', [...a.d.querySelectorAll('#side a')].some(x => x.dataset.id === 'admin'));
  await a.go('admin');
  check('admin users tab', /Users & roles/.test(a.$('#view').textContent) && !a.$('#view p.err'), a.$('#view p.err')?.textContent);
  a.click(a.$('#new')); await sleep(300);
  const f = a.$('dialog form');
  f.elements.full_name.value = 'UI Test'; f.elements.email.value = 'uitest' + Date.now() + '@example.org'; f.elements.password.value = 'long-enough-pass-1';
  a.submit(f); await sleep(1000);
  check('admin creates user from UI', /User created/.test(a.toasts()), a.toasts());
  a.click(a.d.querySelector('[data-tab=audit]')); await sleep(800);
  check('audit tab', /Action/.test(a.$('#view').textContent) && a.d.querySelectorAll('#view tr').length > 5);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
