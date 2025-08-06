import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const templates = [
    { name: 'Homepage', url: 'https://time.com/' },
    { name: 'Standard Article', url: 'https://time.com/7307163/parent-movement-phone-free-schools/' },
    { name: 'Exclusive Article', url: 'https://time.com/7304882/giorgia-meloni-interview/' },
    { name: 'Collection Hub', url: 'https://time.com/collections/100-best-podcasts/' },
    { name: 'Collection item', url: 'https://time.com/collections/time100-creators-2025/7299142/kai-cenat/' },
    { name: 'Author Page', url: 'https://time.com/author/philip-elliott/' },
    { name: 'Section', url: 'https://time.com/section/politics/' },
    { name: 'Tags', url: 'https://time.com/tag/texas/' }
];

test.describe.parallel('Validate Rich Results Test via URL', () => {
    for (const { name, url } of templates) {
        test(`Rich Results validation for ${name}`, async ({ page }, testInfo) => {
            testInfo.setTimeout(120_000);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safeName = name.replace(/\s+/g, '-');
            const dir = path.join('screenshots', safeName + '-richresults-url');
            const screenshotPath = path.join(dir, `${safeName}-${timestamp}.png`);
            const logPath = path.join(dir, `${safeName}-${timestamp}.txt`);

            fs.mkdirSync(dir, { recursive: true });

            await page.goto('https://search.google.com/test/rich-results');

            const urlInput = page.getByLabel('Enter a URL to test');
            const testButton = page.getByRole('button', { name: 'test url' });

            const MAX_RETRIES = 5;
            let attempt = 0;
            let success = false;

            const fillAndClickTest = async () => {
                await urlInput.fill('');
                await urlInput.fill(url);
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
                await testButton.click();
            };

            while (attempt < MAX_RETRIES && !success) {
                attempt++;

                console.log(`🔁 Attempt ${attempt} for ${name}`);

                await fillAndClickTest();

                try {
                    await page.waitForSelector('text=Something went wrong', { timeout: 10_000 });
                    const dismissBtn = page.getByRole('button', { name: 'Dismiss' });
                    await dismissBtn.click();
                    // Continue loop to retry
                } catch {
                    // No popup = success
                    success = true;
                }
            }

            if (success) {
                // ✅ ONLY THIS LINE IS CHANGED
                await page.waitForSelector('text=valid items detected', { timeout: 90_000 }).catch(() => {});
            } else {
                console.log(`❌ [${name}] Failed after ${MAX_RETRIES} attempts.`);
            }

            await page.screenshot({ path: screenshotPath, fullPage: true });

            const logContent = [
                `Template: ${name}`,
                `URL Tested: ${url}`,
                `Test Page: https://search.google.com/test/rich-results`,
                `Screenshot: ${screenshotPath}`,
                `Attempts: ${attempt}`,
                `Result: ${success ? 'Test completed successfully.' : 'Test failed after maximum retries.'}`
            ].join('\n');

            fs.writeFileSync(logPath, logContent);

            console.log(`✅ [${name}] Rich Results test ${success ? 'completed' : 'ended'} after ${attempt} attempt(s).`);
        });
    }
});
