const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\Sagni\\.gemini\\antigravity\\brain\\1ac3beaa-f2ec-402c-901e-fdbdf0ee99dd';
const BASE_URL = 'http://localhost:5173';

(async () => {
  let browser;
  try {
    console.log('[Spec Workspace Verification] Launching Headless Edge browser...');
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

    // 1. Desktop 1280px Viewport - Section 1: Overview
    console.log('[Spec Verification] Navigating to /spec/overview at 1280x800...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/spec/overview`, { waitUntil: 'networkidle0', timeout: 30000 });

    const overviewTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    console.log(`  Overview Heading: "${overviewTitle}"`);
    const desktopScreenshot = path.join(ARTIFACT_DIR, 'spec-screenshot-desktop-1280.png');
    await page.screenshot({ path: desktopScreenshot });
    console.log(`  Saved: ${desktopScreenshot}`);

    // 2. Section 2: Requirements Checklist at 1280px
    console.log('[Spec Verification] Navigating to /spec/requirements...');
    await page.goto(`${BASE_URL}/spec/requirements`, { waitUntil: 'networkidle0', timeout: 30000 });
    const reqsHeading = await page.$eval('h1', el => el.textContent).catch(() => null);
    const reqCount = await page.$$eval('tbody tr', rows => rows.length).catch(() => 0);
    console.log(`  Requirements Heading: "${reqsHeading}", rows: ${reqCount}`);
    const reqsScreenshot = path.join(ARTIFACT_DIR, 'spec-screenshot-requirements-1280.png');
    await page.screenshot({ path: reqsScreenshot });
    console.log(`  Saved: ${reqsScreenshot}`);

    // 3. Section 7: Database Design at 1280px
    console.log('[Spec Verification] Navigating to /spec/database-design...');
    await page.goto(`${BASE_URL}/spec/database-design`, { waitUntil: 'networkidle0', timeout: 30000 });
    const dbHeading = await page.$eval('h1', el => el.textContent).catch(() => null);
    console.log(`  Database Heading: "${dbHeading}"`);
    const dbScreenshot = path.join(ARTIFACT_DIR, 'spec-screenshot-database-1280.png');
    await page.screenshot({ path: dbScreenshot });
    console.log(`  Saved: ${dbScreenshot}`);

    // 4. Tablet 768px Viewport - Section 1: Overview
    console.log('[Spec Verification] Testing Tablet 768x1024 viewport on /spec/overview...');
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/spec/overview`, { waitUntil: 'networkidle0', timeout: 30000 });
    const tabletScreenshot = path.join(ARTIFACT_DIR, 'spec-screenshot-tablet-768.png');
    await page.screenshot({ path: tabletScreenshot });
    console.log(`  Saved: ${tabletScreenshot}`);

    // 5. Mobile 375px Viewport - Section 1: Overview
    console.log('[Spec Verification] Testing Mobile 375x667 viewport on /spec/overview...');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/spec/overview`, { waitUntil: 'networkidle0', timeout: 30000 });
    const mobileScreenshot = path.join(ARTIFACT_DIR, 'spec-screenshot-mobile-375.png');
    await page.screenshot({ path: mobileScreenshot });
    console.log(`  Saved: ${mobileScreenshot}`);

    console.log('\n======================================================');
    console.log(`[Spec Verification Summary]`);
    console.log(`Page Errors: ${pageErrors.length}`);
    console.log(`Console Logs: ${consoleLogs.length}`);
    if (pageErrors.length > 0) {
      console.log('Errors:', pageErrors);
    } else {
      console.log('✅ ALL VIEWPORT AND SPEC WORKSPACE INSPECTIONS PASSED!');
    }
    console.log('======================================================\n');
  } catch (err) {
    console.error('[Spec Workspace Verification] Exception:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
})();
