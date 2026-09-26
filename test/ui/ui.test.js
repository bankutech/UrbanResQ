require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { JSDOM } = require('jsdom');
const fs = require('fs');
const BASE = (process.env.UI_BASE || 'http://localhost:4000');
const PW = process.env.SEED_PASSWORD;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { c ? pass++ : fail++; console.log(c ? 'PASS' : 'FAIL', n, c ? '' : (x || '')); };

(async () => {
  const dom = new JSDOM('<!DOCTYPE html><body><div id="root"></div></body>', { url: BASE + '/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  w.fetch = (u, o) => fetch(new URL(u, BASE), o);
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new w.Event('close')); };
  w.confirm = () => true;
  w.eval(fs.readFileSync(require('path').join(__dirname, 'bundle.js'), 'utf8'));
  await sleep(100);

  const $ = s => d.querySelector(s);
  const go = async id => { w.location.hash = '#/' + id; await sleep(900); };
  const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const submit = f => f.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  const toasts = () => [...d.querySelectorAll('.toast')].map(t => t.textContent).join('|');

  check('login screen shown', !!$('#lf'));
  $('#lf').elements.email.value = 'coord@urbanresq.local'; $('#lf').elements.password.value = PW;
  submit($('#lf')); await sleep(900);
  check('shell after login', !!$('#side') && !!$('#view'));

  for (const id of ['dashboard', 'incidents', 'requests', 'allocation', 'inventory']) {
    await go(id);
    check(`page ${id} renders`, !$('#view p.err') && $('#view').textContent.length > 60, $('#view p.err')?.textContent);
  }

  await go('incidents');
  click($('tr[data-id]')); await sleep(600);
  check('incident drawer + timeline', /Timeline/.test($('dialog')?.textContent || ''));
  click($('dialog [data-close]')); await sleep(50);

  click($('#new')); await sleep(100);
  const nf = $('#nf'); nf.elements.description.value = 'ui test'; nf.elements.affected_pop.value = '500';
  submit(nf); await sleep(900);
  check('report incident', /Reported INC-/.test(toasts()), toasts());

  await go('requests');
  click($('#new')); await sleep(500);
  const rf = $('#rf'); submit(rf); await sleep(900);
  check('create request', /submitted/.test(toasts()), toasts());

  await go('requests');
  const row = [...d.querySelectorAll('tr[data-id]')].find(r => /pending/.test(r.textContent));
  click(row); await sleep(600);
  click($('dialog [data-dec=approve]')); await sleep(900);
  check('approve request', /approved/.test(toasts()), toasts());

  await go('allocation');
  const al = $('[data-alloc]'); check('request ready to dispatch', !!al);
  click(al); await sleep(700);
  check('allocate dialog shows coverage', /covers/.test($('dialog')?.textContent || ''));
  click($('#go')); await sleep(1000);
  check('dispatch created', /Dispatch #/.test(toasts()), toasts());
  await go('allocation');
  click($('[data-go]')); await sleep(800);
  await go('allocation');
  click($('[data-done]')); await sleep(300);
  $('#rcp').value = 'Ward office'; click($('#ok')); await sleep(900);
  check('delivery confirmed', /Delivery confirmed/.test(toasts()), toasts());

  await go('inventory');
  click(d.querySelector('[data-tab=batches]')); await sleep(700);
  check('batches tab', /Batch/.test($('#body').textContent));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
