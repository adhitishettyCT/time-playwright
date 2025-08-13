import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const templates = [
  /*{
    name: 'Homepage',
    url: 'https://qa.time.com/'
  },*/
  /*{
    name: 'Standard Artcicle',
    url: 'https://qa.time.com/7298631/trump-israel-gaza-hamas-war-ceasefire-deal-palestinians-idf-netanyahu/'
  },
  {
    name: 'Exclusive Aricle',
    url: 'https://qa.time.com/7304755/violent-gaza-ification-west-bank/'
  },
  {
    name: 'Collection Hub',
    url: 'https://qa.time.com/collections/100-best-podcasts/'
  }, */
  {
    name: 'Collection item',
    url: 'https://qa.time.com/collections/gold-house/7277143/nicole-scherzinger-broadway/'
  }  
  /*{
    name: 'Author Page',
    url: 'https://qa.time.com/author/annabel-gutterman/'
  }, 
  {
    name: 'Section',
    url: 'https://qa.time.com/section/all-business-2/'
  },
  {
    name: 'Tags',
    url: 'https://qa.time.com/tag/davos-2021/'
  }*/
];

test.describe.parallel('Validate LD+JSON for multiple templates', () => {
  for (const { name: templateName, url: articleURL } of templates) {
    test(`Template: ${templateName}`, async ({ browser }) => {
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

      const ldjson = await page.$eval(
        'script[type="application/ld+json"]',
        el => el.textContent?.trim() || ''
      );

      const googlePage = await browser.newPage();
      await googlePage.goto('https://search.google.com/test/rich-results');

      await googlePage.getByRole('tab', { name: 'Code' }).click();
      await googlePage.waitForSelector('.CodeMirror');
      await googlePage.waitForTimeout(1000);

      const pasteLDJSON = async () => {
        await googlePage.evaluate((ldjson) => {
          const cm = document.querySelector('.CodeMirror');
          (cm as any)?.CodeMirror?.setValue(ldjson);

        }, ldjson);
        await googlePage.keyboard.press('Escape'); // ⎋ Escape after paste
        await googlePage.waitForTimeout(500);
      };

      const testButton = googlePage.getByRole('button', { name: 'TEST CODE' });

      const MAX_RETRIES = 10;
      let attempt = 0;
      let success = false;

      while (attempt < MAX_RETRIES && !success) {
        attempt++;
        console.log(`🔁 Attempt ${attempt} for ${templateName}`);

        await pasteLDJSON();
        await testButton.click();

        try {
          await googlePage.waitForSelector('text=Something went wrong', { timeout: 10_000 });
          const dismissBtn = googlePage.getByRole('button', { name: 'Dismiss' });
          await dismissBtn.click();
          await googlePage.waitForTimeout(2000);
        } catch {
          success = true; // No error popup
        }
      }

      // Paths
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeName = templateName.replace(/\s+/g, '-');
      const dir = path.join('screenshots', 'QAEnvt', safeName);
      const screenshotPath = path.join(dir, `${safeName}-${timestamp}.png`);
      const logPath = path.join(dir, `${safeName}-${timestamp}.txt`);
      fs.mkdirSync(dir, { recursive: true });

      if (success) {
        // WAIT for the results page to show "valid items detected" (case-insensitive),
        // then wait 3s and take a screenshot ONLY at that point.
        await googlePage.getByText(/valid items detected/i).waitFor({ timeout: 90_000 }).catch(() => {});
        await googlePage.waitForTimeout(3000); // delay before screenshot
        await googlePage.screenshot({ path: screenshotPath, fullPage: true });
      } else {
        console.log(`❌ [${templateName}] Failed after ${MAX_RETRIES} attempts.`);
        // Still take a screenshot after the final attempt (failure state)
        await googlePage.screenshot({ path: screenshotPath, fullPage: true });
      }

      const logContent = [
        `Template: ${templateName}`,
        `URL Tested: ${articleURL}`,
        `Screenshot: ${screenshotPath}`,
        `Attempts: ${attempt}`,
        `Result: ${success ? 'LD+JSON validated successfully.' : 'Validation failed after maximum retries.'}`
      ].join('\n');

      fs.writeFileSync(logPath, logContent);

      console.log(`✅ LD+JSON validation for ${templateName} ${success ? 'completed' : 'ended'} after ${attempt} attempt(s).`);
    });
  }
});
