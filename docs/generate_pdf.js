const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const htmlPath = 'file://' + path.resolve(__dirname, 'urbanresq_schema_and_workflow.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: path.resolve(__dirname, 'urbanresq_schema_and_workflow.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  });
  
  await browser.close();
})();
