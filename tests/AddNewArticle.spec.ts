import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('Login via Okta, publish article in WordPress, and verify on frontend', async ({ page }) => {
  const wpAdminURL = 'https://your-site.com/wp-admin';
  const frontEndBaseURL = 'https://your-site.com';
  const articleTitle = `Test Article ${Date.now()}`;
  const articleContent = 'This article was created by Playwright.';
  
  await page.goto(wpAdminURL);

  // 🔐 Step 1: Detect Okta and log in
  if (page.url().includes('okta.com')) {
    console.log('On Okta login page...');
    await page.fill('input[name="username"]', process.env.OKTA_USERNAME!);
    await page.fill('input[name="password"]', process.env.OKTA_PASSWORD!);
    await page.click('input[type="submit"], button[type="submit"]');

    // Wait for redirect to WP dashboard
    await page.waitForURL('**/wp-admin', { timeout: 15000 });
    console.log('Logged in through Okta.');
  }

  // ✅ Step 2: Go to "Add New Post"
  await page.click('text=Posts');
  await page.click('text=Add New');

  // ✏️ Step 3: Add Title & Content
  await page.fill('textarea[placeholder="Add title"]', articleTitle);
  await page.click('button[aria-label="Add block"]');
  await page.keyboard.type(articleContent);

  // 🚀 Step 4: Publish
  await page.click('text=Publish');
  await page.click('text=Publish'); // Confirm

  // 🔗 Step 5: View article
  await page.click('text=View Post');
  const articleURL = page.url();

  // 🌍 Step 6: Check title exists on front-end
  await page.goto(articleURL);
  const h1 = await page.locator('h1').textContent();
  expect(h1).toContain(articleTitle);
});
