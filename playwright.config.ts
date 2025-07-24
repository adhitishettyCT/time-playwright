import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  use: {
    baseURL: 'https://qa.time.com',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    httpCredentials: {
      username: process.env.AUTH_USERNAME!, // non-null assertion
      password: process.env.AUTH_PASSWORD!,
    }
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]]
});
