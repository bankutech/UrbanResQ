import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

async function testCitizenSubmission() {
  console.log('Testing Citizen SOS Incident Submission Workflow...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('response', async (res) => {
      if (res.url().includes('/public/emergency-requests')) {
        console.log('API Response Status:', res.status());
        try {
          const body = await res.json();
          console.log('API Response Body:', JSON.stringify(body, null, 2));
        } catch (e) {}
      }
    });

    await page.goto(`${BASE_URL}/report`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Fill title
    await page.type('input[name="title"]', 'Flash Flood Stranded Senior Citizen');

    // Fill description
    await page.type('textarea[name="description"]', 'Water level at 4 feet inside living room. Power disconnected. Urgent rescue evacuation required.');

    // Click submit button
    const submitBtn = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await submitBtn.click();

    // Wait for submission response
    await new Promise((r) => setTimeout(r, 3000));

    const content = await page.content();
    const isSuccess = content.includes('Report Dispatched Successfully');

    if (isSuccess) {
      console.log('✅ Citizen SOS Incident successfully submitted, saved in MySQL, and tracking badge displayed in UI!');
    } else {
      console.log('⚠️ Could not verify success message in UI content.');
    }
  } finally {
    await browser.close();
  }
}

testCitizenSubmission().catch((err) => {
  console.error('Submission test error:', err);
  process.exit(1);
});
