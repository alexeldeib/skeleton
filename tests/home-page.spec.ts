import { test, expect } from '@playwright/test';

test('Home page test', async ({ page }) => {
  console.log('Navigating to home page...');
  const response = await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  
  console.log(`Page response status: ${response?.status()}`);
  
  const html = await page.content();
  console.log(`Page HTML length: ${html.length} characters`);
  
  await page.screenshot({ path: './test-artifacts/screenshots/home/page.png' });
  console.log('Saved screenshot to home-page-screenshot.png');

  // Basic check that we're on a valid page
  expect(html.length).toBeGreaterThan(0);
  expect(response?.status()).toBe(200);
});