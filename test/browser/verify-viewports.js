const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\Sagni\\.gemini\\antigravity\\brain\\1ac3beaa-f2ec-402c-901e-fdbdf0ee99dd';
const BASE_URL = 'http://localhost:5173';

(async () => {
  let browser;
  try {
    console.log('[Browser Verification] Launching Edge headless browser...');
    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader']
    });

    const page = await browser.newPage();
    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => pageErrors.push(err.toString()));

    const viewports = [
      { name: 'desktop-1280', width: 1280, height: 800 },
      { name: 'tablet-768', width: 768, height: 1024 },
      { name: 'mobile-375', width: 375, height: 667 },
    ];

    for (const vp of viewports) {
      console.log(`[Browser Verification] Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });

      // Verify DOM loaded
      const title = await page.title();
      const hasHeading = await page.$eval('h1, h2', el => el.textContent).catch(() => null);
      const emailVal = await page.$eval('input[type="email"]', el => el.value).catch(() => null);

      console.log(`  Viewport ${vp.name}: title="${title}", heading="${hasHeading}", defaultEmail="${emailVal}"`);

      const screenshotPath = path.join(ARTIFACT_DIR, `screenshot-${vp.name}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`  Saved screenshot: ${screenshotPath}`);
    }

    console.log(`[Browser Verification] Completed successfully. Page errors: ${pageErrors.length}, Console messages: ${consoleLogs.length}`);
    if (pageErrors.length > 0) {
      console.log('Page Errors:', pageErrors);
    }
  } catch (err) {
    console.error('[Browser Verification] Failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
})();
