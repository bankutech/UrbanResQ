const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

const executablePath = edgePaths.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error('No compatible browser executable found.');
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  console.log('Launching browser with:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to http://localhost:5173/login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(2000);

    // Capture the login screen
    const loginScreenshotPath = 'C:\\Users\\Sagni\\.gemini\\antigravity\\brain\\1ac3beaa-f2ec-402c-901e-fdbdf0ee99dd\\login-screen-restored.png';
    await page.screenshot({ path: loginScreenshotPath });
    console.log('Captured login screen to:', loginScreenshotPath);

    // Check if error alert is visible
    const alertBefore = await page.$('[role="alert"]');
    if (alertBefore) {
      const alertText = await page.evaluate(el => el.textContent, alertBefore);
      console.log('Alert before submission:', alertText);
    } else {
      console.log('No error alert on initial load - clean!');
    }

    // Click submit button: "Enter Command Center"
    console.log('Submitting login form...');
    const submitBtn = await page.$('button[type="submit"]');
    if (!submitBtn) throw new Error('Submit button not found');
    await submitBtn.click();

    // Wait for navigation or state update
    await sleep(3000);

    const currentUrl = page.url();
    console.log('URL after login submit:', currentUrl);

    const alertAfter = await page.$('[role="alert"]');
    if (alertAfter) {
      const alertText = await page.evaluate(el => el.textContent, alertAfter);
      console.error('ALERT DETECTED AFTER SUBMIT:', alertText);
    } else {
      console.log('SUCCESS: No alert after login submit!');
    }

    // Capture the destination screen (Command Center)
    const dashboardScreenshotPath = 'C:\\Users\\Sagni\\.gemini\\antigravity\\brain\\1ac3beaa-f2ec-402c-901e-fdbdf0ee99dd\\command-center-after-login.png';
    await page.screenshot({ path: dashboardScreenshotPath });
    console.log('Captured dashboard screen to:', dashboardScreenshotPath);

  } catch (err) {
    console.error('Browser test failed:', err);
  } finally {
    await browser.close();
  }
})();
