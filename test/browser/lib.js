// Real-browser helpers. Uses a bundled headless Chromium (Linux x64), or your own Chrome if CHROME_PATH is set.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const puppeteer = require('puppeteer-core');
const os = require('os');
const path = require('path');

const BASE = process.env.UI_BASE || 'http://localhost:4000';
const PW = process.env.SMOKE_PASSWORD || process.env.SEED_PASSWORD;
const IGNORE = /fonts\.(googleapis|gstatic)|tile\.openstreetmap|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION/;
const shot = n => path.join(os.tmpdir(), n);

async function launch() {
  if (process.env.CHROME_PATH) return puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const _c = require('@sparticuz/chromium'); const chromium = _c.default || _c;
  return puppeteer.launch({ args: [...chromium.args, '--no-sandbox'], executablePath: await chromium.executablePath(), headless: 'shell' });
}
async function open(viewport = { width: 1280, height: 800 }) {
  const browser = await launch();
  await browser.defaultBrowserContext().overridePermissions(BASE, ['geolocation', 'notifications']);
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errs.push('console: ' + m.text()); });
  page.on('requestfailed', r => { if (!IGNORE.test(r.url() + (r.failure()?.errorText || ''))) errs.push('reqfail: ' + r.url().slice(0, 90)); });
  page.on('response', r => { if (r.status() >= 500) errs.push(`HTTP ${r.status()}: ${r.url().slice(0, 90)}`); });
  return { browser, page, errs };
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function login(page, email, pw = PW) {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#lf');
  await page.type('#lf [name=email]', email);
  await page.type('#lf [name=password]', pw);
  await Promise.all([page.waitForSelector('#side', { timeout: 15000 }), page.click('#lf button')]);
}
async function go(page, id) { await page.evaluate(i => { location.hash = '#/' + i; }, id); await sleep(900); }
module.exports = { open, login, go, sleep, BASE, PW, shot };
