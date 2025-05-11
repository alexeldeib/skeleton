import { test, expect } from '@playwright/test';

/**
 * Test the login flow with a real email address
 */
test('Login with real email', async ({ page }) => {
  // Set a timeout for waiting for successful API response
  test.setTimeout(30000);
  
  // Navigate to login page
  console.log('📱 Navigating to login page...');
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    console.log(`[Browser ${type}]: ${msg.text()}`);
  });
  
  // Wait for the form to appear
  await page.waitForSelector('form', { timeout: 10000 });
  
  // Fill in the email field with a valid email
  const realEmail = 'alex@eldeib.com'; // Replace with a real, valid email
  console.log(`✉️ Filling email address: ${realEmail}`);
  await page.fill('input[type="email"]', realEmail);
  
  // Click the submit button and wait for the response
  console.log('🖱️ Submitting form...');
  await page.click('button[type="submit"]');
  
  // Wait for the success message
  try {
    await page.waitForSelector('div:has-text("Check your email")', {
      timeout: 10000,
      state: 'visible'
    });
    console.log('✅ Success! The magic link email should be sent.');
  } catch (error) {
    console.error('❌ Error: Did not see success message');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-artifacts/login-error.png' });
    
    // Fail the test
    expect(false).toBeTruthy();
  }
});