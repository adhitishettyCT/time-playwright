import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

test('Validate LD+JSON of a QA article using Rich Results Tool', async ({ browser }) => {
  const articleURL = 'https://qa.time.com/collections/time100-philanthropy-2025/7286071/aliko-dangote/';
  const username = process.env.QA_USERNAME;
  const password = process.env.QA_PASSWORD;

  // Validate credentials
  if (!username || !password) {
    throw new Error('Missing USERNAME or PASSWORD in .env file');
  }

  // Step 1: Create browser context with HTTP auth
  const context = await browser.newContext({
    httpCredentials: {
      username,
      password,
    },
  });

  const page = await context.newPage();

  // Step 2: Go to the article page and extract the LD+JSON
  await page.goto(articleURL);
  const ldjson = await page.$eval('script[type="application/ld+json"]', el => el.textContent?.trim() || '');

  // Step 3: Open Google Rich Results Tool in a new tab
  const googlePage = await browser.newPage();
  await googlePage.goto('https://search.google.com/test/rich-results');

  // Step 4: Click on the "Code" tab
  await googlePage.getByRole('tab', { name: 'Code' }).click();
  await googlePage.waitForSelector('.CodeMirror');
  await googlePage.waitForTimeout(1000); // Optional: stabilize UI

  // Step 5: Fill CodeMirror editor with LD+JSON
  await googlePage.evaluate((ldjson) => {
    const cm = document.querySelector('.CodeMirror') as any;
    cm?.CodeMirror?.setValue(ldjson);
  }, ldjson);

  // Step 6: Click "TEST CODE"
  await googlePage.getByRole('button', { name: 'TEST CODE' }).click();

// Step 7: Wait and validate result using known stable structure
const checkmark = page.locator('span.sWvkTd', { hasText: 'check_circle' });
await expect(checkmark).toBeVisible({ timeout: 30000 });

console.log('✅ LD+JSON validated successfully with green checkmark');


});
