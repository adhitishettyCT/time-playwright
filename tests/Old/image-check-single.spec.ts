import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

test('Check image source media URLs have q=75 in HeroTemplate', async ({ browser }, testInfo) => {
  testInfo.setTimeout(120_000);

  const templateName = 'HeroTemplate';
  const articleURL = 'https://qa.time.com/7298631/trump-israel-gaza-hamas-war-ceasefire-deal-palestinians-idf-netanyahu/';
  const username = process.env.QA_USERNAME;
  const password = process.env.QA_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing QA_USERNAME or QA_PASSWORD in .env file');
  }

  const context = await browser.newContext({
    httpCredentials: {
      username,
      password,
    },
  });

  const page = await context.newPage();
  await page.goto(articleURL, { waitUntil: 'domcontentloaded' });

  // ✅ Extract all image srcset/src URLs from <source> and <img srcset>
  const imageURLs = await page.evaluate(() => {
    const urls = new Set<string>();
  
    // <img srcset="...">
    document.querySelectorAll('img[srcset]').forEach(img => {
      const srcset = (img as HTMLImageElement).srcset;
      srcset.split(',').forEach(part => {
        const url = part.trim().split(' ')[0];
        if (url) urls.add(url);
      });
    });
  
    // <source srcset="...">
    document.querySelectorAll('source[srcset]').forEach(source => {
      const srcset = (source as HTMLSourceElement).srcset;
      srcset.split(',').forEach(part => {
        const url = part.trim().split(' ')[0];
        if (url) urls.add(url);
      });
    });
  
    // <source src="...">
    document.querySelectorAll('source[src]').forEach(source => {
      const src = (source as HTMLSourceElement).src;
      if (src) urls.add(src);
    });
  
    return Array.from(urls);
  });
  

  const badImages = imageURLs.filter(url => !url.includes('q=75'));

  // ✅ Save screenshot + log
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = templateName.replace(/\s+/g, '-');
  const dir = path.join('screenshots', safeName + '-srcset');
  const screenshotPath = path.join(dir, `${safeName}-${timestamp}.png`);
  const logPath = path.join(dir, `${safeName}-${timestamp}.txt`);

  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const logContent = [
    `Template: ${templateName}`,
    `URL: ${articleURL}`,
    `Total srcset/src URLs Found: ${imageURLs.length}`,
    `\nAll Checked Image URLs:\n`,
    ...imageURLs,
    `\nImages Without q=75: ${badImages.length}`,
    ...(badImages.length > 0 ? ['\nMissing q=75 in:', ...badImages] : ['\nAll image sources have q=75 ✅']),
    `\nScreenshot: ${screenshotPath}`
  ].join('\n');
  

  fs.writeFileSync(logPath, logContent);

  // ✅ console output
  if (badImages.length > 0) {
    console.warn(`❌ Found ${badImages.length} images missing q=75`);
    console.warn(badImages.join('\n'));
  } else {
    console.log('✅ All image URLs contain q=75');
    console.log('\n🔍 All image URLs checked:');
    imageURLs.forEach(url => console.log(url));
  }
  
});
