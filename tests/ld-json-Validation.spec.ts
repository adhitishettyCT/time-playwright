import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const templates = [
  {
    name: 'Homepage',
    url: 'https://qa.time.com/'
  },
  {
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
  }, 
  {
    name: 'Collection item',
    url: 'https://qa.time.com/collections/gold-house/7277143/nicole-scherzinger-broadway/'
  },  
  {
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
  }
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

      // ✅ Create screenshot/log paths
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeName = templateName.replace(/\s+/g, '-');
      const dir = path.join('screenshots', safeName);
      const screenshotPath = path.join(dir, `${safeName}-${timestamp}.png`);
      const logPath = path.join(dir, `${safeName}-${timestamp}.txt`);

      // Create dir if not exists
      fs.mkdirSync(dir, { recursive: true });

      // ✅ Save screenshot
      await googlePage.screenshot({ path: screenshotPath, fullPage: true });

      // ✅ Save log
      fs.writeFileSync(logPath, `✅ LD+JSON passed\nTemplate: ${templateName}\nURL: ${articleURL}\nScreenshot: ${screenshotPath}\n`);

      // ✅ Console info
      console.log(`✅ LD+JSON validated for ${templateName}`);
      console.log(`URL: ${articleURL}`);
      console.log(`Saved to: ${screenshotPath}`);
    });
  }
});
