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
  await page.fill('input[type="password"]', 'Mustang@123'); // 🔁 Replace with real password (later from .env!)
  await page.getByRole('button', { name: 'Verify' }).click();

  // Wait for the "Get a push notification" Select button to appear
await page.waitForSelector('a[aria-label="Select to get a push notification to the Okta Verify app."]');

// Click the button
await page.click('a[aria-label="Select to get a push notification to the Okta Verify app."]');


  // 5. Wait for push notification approval
  console.log("👉 Waiting for you to approve push notification...");
  await page.waitForURL('https://api-qa.time.com/wp-admin/'); // or whatever URL you land on after auth
  await page.locator('div.wp-menu-name', { hasText: 'TIME Articles' }).first().click();


  // 7. Click on 'Add New' under Posts
await page.click('a.page-title-action, .wrap .page-title-action'); // Typical "Add New" button

// 8. Wait for the 'Add Title' field and fill it
const titleLocator = page.locator('h1[aria-label="Add title"][role="textbox"]');
await titleLocator.waitFor();

// Click the field (some WordPress editors require focus before typing)
await titleLocator.click();

// Type the post title
await titleLocator.fill('Test Post Title from Playwright');

await page.getByRole('button', { name: 'Media Library' }).click();

// Wait for the modal to appear
await expect(page.locator('.media-modal-content')).toBeVisible();

// ✅ Wait for the first image attachment to be visible (with 30s timeout)
const firstAttachment = page.locator('.attachments .attachment').first();
await expect(firstAttachment).toBeVisible({ timeout: 30000 });  // waits up to 30s

// ✅ Now click it
await firstAttachment.click();
await page.getByRole('button', { name: 'Select', exact: true }).click();

// 7. Fill in caption (beneath image)
await page.getByRole('textbox', { name: 'Add/Update Caption' }).fill('Test Caption from Playwright');

// 8. Add photo credits (optional: depends on the theme used)
await page.getByRole('textbox', { name: 'Add/Update Credit' }).fill('Test Credit from Playwright');

// 9. Click + again to add another block
 page.locator('button[aria-label="Toggle block inserter"]').click()

// 10. Search for 'Code' block
page.locator('button[aria-label="Blockquote"]').click()
await page.getByRole('textbox', { name: 'Quote text' }).fill('console.log("Hello from Playwright");');

});
