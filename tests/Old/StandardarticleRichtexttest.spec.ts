import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

test('Validate LD+JSON of a QA article using Rich Results Tool', async ({ browser }) => {
  const articleURL = 'https://qa.time.com/7298631/trump-israel-gaza-hamas-war-ceasefire-deal-palestinians-idf-netanyahu/';
  const username = process.env.QA_USERNAME;
  const password = process.env.QA_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing USERNAME or PASSWORD in .env file');
  }

  const context = await browser.newContext({
    httpCredentials: {
      username,
      password,
    },
  });

  const page = await context.newPage();
  await page.goto(articleURL);

  const ldjson = await page.$eval('script[type="application/ld+json"]', el => el.textContent?.trim() || '');

  const googlePage = await browser.newPage();
  await googlePage.goto('https://search.google.com/test/rich-results');

  await googlePage.getByRole('tab', { name: 'Code' }).click();
  await googlePage.waitForSelector('.CodeMirror');
  await googlePage.waitForTimeout(1000);

  await googlePage.evaluate((ldjson) => {
    const cm = document.querySelector('.CodeMirror') as any;
    cm?.CodeMirror?.setValue(ldjson);
  }, ldjson);

  await googlePage.getByRole('button', { name: 'TEST CODE' }).click();

  const checkmark = googlePage.locator('span.DPvwYc.RsKy5c.sWvkTd', { hasText: 'check_circle' });
  await expect(checkmark).toBeVisible({ timeout: 30000 });

  // ✅ Screenshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = articleURL.split('/').filter(Boolean).pop()?.substring(0, 40) || 'article';
  const screenshotPath = `screenshots/${safeName}-${timestamp}.png`;

  // Create directory if not exists
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await googlePage.screenshot({ path: screenshotPath, fullPage: true });

  // ✅ Log to console
  console.log('✅ LD+JSON validated successfully with green checkmark');
  console.log(`Article URL: ${articleURL}`);
  console.log(`Screenshot saved: ${screenshotPath}`);

  // ✅ Optional: Save log to file
  const logPath = `screenshots/${safeName}-${timestamp}.txt`;
  fs.writeFileSync(logPath, `✅ LD+JSON passed\nArticle: ${articleURL}\nScreenshot: ${screenshotPath}\n`);
});
