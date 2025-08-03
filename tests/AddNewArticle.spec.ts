import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('Login with Okta and create new WordPress post', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('https://api-qa.time.com/wp-admin/'); // 🔁 Replace this with actual login URL

  // 2. Click on Okta Login link
  //await page.getByRole('link', { name: 'Okta Login' }).click();

  // 3. Wait for the Okta email input
 // await page.waitForSelector('input[name="identifier"]');

  // Fill in the email
  //await page.fill('input[name="identifier"]', process.env.AUTH_USERNAME!);

  // Click the red "Next" button
  //await page.getByRole('button', { name: 'Next' }).click();

  // 4. Fill password
  //await page.waitForSelector('input[type="password"]');
  //await page.fill('input[type="password"]', process.env.AUTH_PASSWORD!);
  //await page.getByRole('button', { name: 'Verify' }).click();

  // Wait for the "Get a push notification" Select button to appear
  //await page.waitForSelector('a[aria-label="Select to get a push notification to the Okta Verify app."]');

  // Click the button
  //await page.click('a[aria-label="Select to get a push notification to the Okta Verify app."]');

  // 5. Wait for push notification approval
  //console.log("👉 Waiting for you to approve push notification...");
  await page.waitForURL('https://api-qa.time.com/wp-admin/');
  await page.locator('div.wp-menu-name', { hasText: 'TIME Articles' }).first().click();

  // 7. Click on 'Add New' under Posts
  await page.click('a.page-title-action, .wrap .page-title-action'); // Typical "Add New" button

  // 8. Wait for the 'Add Title' field and fill it
  const titleLocator = page.locator('h1[aria-label="Add title"][role="textbox"]');
  await titleLocator.waitFor();
  await titleLocator.click();
  await titleLocator.fill('Test Post Title from Playwright');

  await page.getByRole('button', { name: 'Media Library' }).click();

  // Wait for the modal to appear
  await expect(page.locator('.media-modal-content')).toBeVisible();

  // ✅ Wait for the first image attachment to be visible (with 30s timeout)
  const firstAttachment = page.locator('.attachments .attachment').first();
  await expect(firstAttachment).toBeVisible({ timeout: 30000 });

  // ✅ Now click it
  await firstAttachment.click();
  await page.getByRole('button', { name: 'Select', exact: true }).click();

  // 7. Fill in caption (beneath image)
  await page.getByRole('textbox', { name: 'Add/Update Caption' }).fill('Test Caption from Playwright');

  // 8. Add photo credits
  await page.getByRole('textbox', { name: 'Add/Update Credit' }).fill('Test Credit from Playwright');

  // 9. Click + again to add another block
  page.locator('button[aria-label="Toggle block inserter"]').click();

  // 10. Search for 'Code' block
  await page.getByRole('option', { name: 'Blockquote' }).click();
  //await page.getByRole('textbox', { name: 'Quote text' }).fill('console.log("Hello from Playwright");');
  const blockquoteSelector = '[aria-label="Quote text"]';


  await page.waitForSelector(blockquoteSelector);

  // Type some text into the Blockquote block
  await page.type(blockquoteSelector, 'This is a test blockquote filled by Playwright!');
  
  await page.click('button.components-button.has-icon[aria-label="Settings"]');
  await page.locator('[data-label="Post"]').click();
  
  const authorToggle = page.getByRole('button', { name: 'Author' });

  // 2. Check if Author panel is expanded
  const isAuthorExpanded = await authorToggle.getAttribute('aria-expanded');
  if (isAuthorExpanded !== 'true') {
  await page.getByRole('button', { name: 'Author' }).click(); // Expand if not already expanded
  }
  
  // 3. Fill "TIN" into the Author search box
  await page.getByPlaceholder('Search for an author').fill('TIN');
  
  // 4. Wait and select the first matching author (like Alice Fantine)
  await page.waitForTimeout(2000); // Adjust if needed based on network
  await page.locator('.search-results .search-result').nth(1).click();
  
  // 5. Collapse the Author section
  await authorToggle.click();


// 5. Fill the SEO Title field
// Input element or textarea labeled as 'SEO title' or aria-label containing 'SEO title'
await page.locator('#inspector-text-control-4').fill('Test SEO Title');
await page.locator('#inspector-textarea-control-0').fill('Test SEO Description');

});
