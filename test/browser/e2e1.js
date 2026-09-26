const { open, login, go, sleep, BASE, PW, shot } = require('./lib');
let pass = 0, fail = 0;
const check = (n, c, x) => { c ? pass++ : fail++; console.log(c ? 'PASS' : 'FAIL', n, c ? '' : (x || '')); };
(async () => {
  const { browser, page, errs } = await open();
  await login(page, 'coord@urbanresq.local');
  check('logged in, sidebar visible', !!(await page.$('#side a')));
  await page.screenshot({ path: shot('dash.png') });
  const ids = await page.$$eval('#side a[data-id]', as => as.map(a => a.dataset.id));
  for (const id of ids) {
    await go(page, id);
    const err = await page.$eval('#view p.err', e => e.textContent).catch(() => null);
    const len = await page.$eval('#view', v => v.textContent.length);
    check(`page ${id} loads`, !err && len > 40, err);
  }
  // map in real Leaflet
  await go(page, 'map'); await sleep(800);
  check('leaflet map container exists', !!(await page.$('#map.leaflet-container')));
  const markers = await page.$$eval('#map path.leaflet-interactive', p => p.length);
  check('map draws incident/facility markers', markers >= 10, markers);
  await page.screenshot({ path: shot('map.png') });
  // open a popup by clicking an incident marker
  const box = await page.$eval('#map path.leaflet-interactive', p => { const r = p.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(box.x, box.y); await sleep(500);
  const pop = await page.$('.leaflet-popup-content');
  check('popup opens on marker click', !!pop);
  // incident drawer + real file upload
  await go(page, 'incidents');
  await page.click('tr[data-id]'); await sleep(700);
  check('drawer opens', !!(await page.$('dialog[open] #fl')));
  const png = require('fs').writeFileSync(shot('uq-test.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));
  const input = await page.$('dialog[open] #fl');
  await input.uploadFile(shot('uq-test.png'));
  await page.click('dialog[open] #upl'); await sleep(1500);
  const files = await page.$eval('dialog[open]', d => d.textContent);
  check('file uploaded through real file input', /t\.png/.test(files), files.slice(0, 300));
  await page.screenshot({ path: shot('drawer.png') });
  await page.keyboard.press('Escape'); await sleep(200);
  check('Escape closes dialog', !(await page.$('dialog[open]')));
  // create incident through the real form
  await page.click('#new'); await sleep(300);
  await page.select('#nf [name=kind]', 'landslide');
  await page.type('#nf [name=description]', 'real browser test');
  await page.click('#nf button:not([type=button])'); await sleep(1200);
  const toast = await page.$$eval('.toast', t => t.map(x => x.textContent).join('|')).catch(() => '');
  check('incident created via real form', /Reported INC-/.test(toast), toast);
  // mobile layout
  await page.setViewport({ width: 390, height: 800, isMobile: true, hasTouch: true });
  await go(page, 'dashboard');
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('no horizontal overflow on phone (dashboard)', over <= 1, over);
  await page.screenshot({ path: shot('mobile-dash.png') });
  await page.click('#burger'); await sleep(400);
  check('menu opens on phone', await page.$eval('#side', s => s.classList.contains('open')));
  await page.screenshot({ path: shot('mobile-menu.png') });
  await page.click('#side a[data-id=incidents]'); await sleep(900);
  const over2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('no horizontal overflow on phone (incidents table scrolls inside card)', over2 <= 1, over2);
  await page.screenshot({ path: shot('mobile-incidents.png') });
  for (const [w, h, label] of [[1280, 800, 'desktop'], [820, 1000, 'tablet'], [390, 800, 'phone']]) {
    await page.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 });
    const wide = [];
    for (const id of ids) { await go(page, id); await sleep(250); const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (o > 1) wide.push(`${id}(+${o}px)`); }
    check(`no page overflows the screen at ${label} ${w}px`, wide.length === 0, wide.join(', '));
  }
  check('no browser errors during the run', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('E2E CRASH', e.message); process.exit(1); });
