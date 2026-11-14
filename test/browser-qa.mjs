import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve('test', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

async function runQA() {
  console.log('🚀 Starting UrbanResQ Responsive & Functional Browser QA...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const errors = [];
  const warnings = [];

  try {
    const page = await browser.newPage();

    // Listen to console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('tile.openstreetmap.org')) {
          errors.push(`[Console Error] ${text}`);
        }
      }
    });

    page.on('pageerror', (err) => {
      errors.push(`[Page Error] ${err.message}`);
    });

    // 1. Test Citizen Report App (/report)
    console.log('\n--- 1. Testing Citizen SOS Reporting Page (/report) ---');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/report`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1200));

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (hasOverflow) {
        warnings.push(`Horizontal overflow detected on /report at ${vp.name} (${vp.width}px)`);
      }

      const shotPath = path.join(SCREENSHOT_DIR, `citizen-report-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`✓ /report captured at ${vp.name} (${vp.width}x${vp.height}) -> ${shotPath}`);
    }

    // 2. Perform Login via Admin Demo Account
    console.log('\n--- 2. Performing Authentication for Operator Pages ---');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));

    const loginRes = await page.evaluate(async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@urbanresq.city', password: 'UrbanResQ@2026' }),
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('urbanresq_token', data.token);
          localStorage.setItem('urbanresq_user', JSON.stringify(data.user));
          return { success: true, user: data.user };
        }
        return { success: false, data };
      } catch (e) {
        return { success: false, error: e.message };
      }
    });

    console.log('Login result:', loginRes);

    // 3. Test Protected Pages across Viewports
    const pagesToTest = [
      { path: '/dashboard', label: 'EOC Dashboard' },
      { path: '/command-center', label: 'Command Center Map' },
      { path: '/allocations', label: 'FIFO Allocations' },
      { path: '/hospitals', label: 'Hospital Surge & Inpatients' },
      { path: '/shelters', label: 'Shelter Logistics' },
      { path: '/vehicles', label: 'Vehicle Fleet' },
      { path: '/drone-feed', label: 'Drone Telemetry Feed' },
    ];

    for (const testTarget of pagesToTest) {
      console.log(`\n--- Testing ${testTarget.label} (${testTarget.path}) ---`);
      for (const vp of VIEWPORTS) {
        await page.setViewport({ width: vp.width, height: vp.height });
        await page.goto(`${BASE_URL}${testTarget.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await new Promise((r) => setTimeout(r, 1500)); // Allow chart or map to render

        const overflowAmount = await page.evaluate(() => {
          return document.documentElement.scrollWidth - window.innerWidth;
        });

        if (overflowAmount > 1) {
          warnings.push(
            `Horizontal overflow (${overflowAmount}px) on ${testTarget.path} at ${vp.name} (${vp.width}px)`
          );
        }

        const safeName = testTarget.path.replace('/', '') || 'root';
        const shotPath = path.join(SCREENSHOT_DIR, `${safeName}-${vp.name}.png`);
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`✓ ${testTarget.path} @ ${vp.name} (${vp.width}x${vp.height}) [overflow: ${overflowAmount <= 1 ? 'NONE' : overflowAmount + 'px'}]`);
      }
    }

    console.log('\n================ QA SUMMARY ================');
    console.log(`Total Console / Page Errors: ${errors.length}`);
    if (errors.length > 0) {
      errors.forEach((e) => console.log('  ❌', e));
    } else {
      console.log('  ✅ 0 Console / Runtime Errors detected');
    }
    console.log(`Total Overflow / Layout Warnings: ${warnings.length}`);
    if (warnings.length > 0) {
      warnings.forEach((w) => console.log('  ⚠️ ', w));
    } else {
      console.log('  ✅ 0 Responsive Overflow issues across Mobile (375px), Tablet (768px), and Desktop (1280px)');
    }
    console.log('============================================\n');

  } finally {
    await browser.close();
  }
}

runQA().catch((err) => {
  console.error('QA Runner encountered error:', err);
  process.exit(1);
});
