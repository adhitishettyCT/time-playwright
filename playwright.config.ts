import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  timeout: 60_000, // ✅ Global timeout of 60 seconds for each test

  use: {
    baseURL: 'https://qa.time.com',
    storageState: 'auth.json',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    httpCredentials: {
      username: process.env.AUTH_USERNAME!, // non-null assertion
      password: process.env.AUTH_PASSWORD!,
    },
  },

  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});

