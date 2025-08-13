import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Validate and log OG meta tags', async ({ page }) => {
  await page.goto('/7304618/ozzy-osbourne-death/');

  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');

  // Check they exist
  expect(ogTitle).toBeTruthy();
  expect(ogDescription).toBeTruthy();

  // Prepare log line
  const logLine = `"${page.url()}","${ogTitle}","${ogDescription}"\n`;

  // Write to CSV
  const logFilePath = path.join(__dirname, '../logs/og-meta-log.csv');

  // Ensure logs folder exists
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

  // Append log
  fs.appendFileSync(logFilePath, logLine, 'utf8');
});
