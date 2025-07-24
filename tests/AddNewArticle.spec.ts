import { test, expect } from '@playwright/test';

test('Login with Okta and create new WordPress post', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('https://api-qa.time.com/wp-admin/'); // 🔁 Replace this with actual login URL

  // 2. Click on Okta Login link
  await page.getByRole('link', { name: 'Okta Login' }).click();

  // 3. Wait for the Okta email input
// Wait for the email input field to appear
await page.waitForSelector('input[name="identifier"]');

// Fill in the email
await page.fill('input[name="identifier"]', 'Adhiti.Shetty@associate.time.com');

// Click the red "Next" button
await page.getByRole('button', { name: 'Next' }).click();


  // 4. Fill password
  await page.waitForSelector('input[type="password"]');
  await page.fill('input[type="password"]', 'Rock@123'); // 🔁 Replace with real password (later from .env!)
  await page.getByRole('button', { name: 'Verify' }).click();

  // Wait for the "Get a push notification" Select button to appear
await page.waitForSelector('a[aria-label="Select to get a push notification to the Okta Verify app."]');

// Click the button
await page.click('a[aria-label="Select to get a push notification to the Okta Verify app."]');


  // 5. Wait for push notification approval
  console.log("👉 Waiting for you to approve push notification...");
  await page.waitForURL('https://api-qa.time.com/wp-admin/'); // or whatever URL you land on after auth
});
