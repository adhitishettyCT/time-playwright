// login-setup.ts
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  const browser = await chromium.launch({ headless: false }); // use headless: false to visually debug
  const page = await browser.newPage();

  // 1. Go to login page
  await page.goto('https://api-qa.time.com/wp-admin/');

  // 2. Perform Okta login (same steps as in your test)
  await page.getByRole('link', { name: 'Okta Login' }).click();
  await page.fill('input[name="identifier"]', process.env.AUTH_USERNAME!);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.fill('input[type="password"]', process.env.AUTH_PASSWORD!);
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.click('a[aria-label="Select to get a push notification to the Okta Verify app."]');

  console.log('👉 Approve the Okta push notification now...');
  await page.waitForURL('https://api-qa.time.com/wp-admin/');

  // 3. Save session to file
  await page.context().storageState({ path: 'auth.json' });

  console.log('✅ Login session saved to auth.json');

  await browser.close();
})();
