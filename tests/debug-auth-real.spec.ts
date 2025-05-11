import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Test the authentication flow with real email addresses
 */
test.describe('Authentication Flow Tests', () => {
  // Create artifacts directory if it doesn't exist
  const artifactsDir = path.join(__dirname, '../test-artifacts/auth');
  fs.mkdirSync(artifactsDir, { recursive: true });

  /**
   * Before each test, make sure we have proper environment variables
   */
  test.beforeEach(async ({ page }) => {
    // Check that environment variables are properly set for testing
    const envVars = [
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ];

    const missingVars = envVars.some(v => !v);
    if (missingVars) {
      console.warn('⚠️ Warning: Some environment variables might be missing');
    }

    // Capture console messages for better debugging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.error(`[Browser Error]: ${msg.text()}`);
      } else if (type === 'warning') {
        console.warn(`[Browser Warning]: ${msg.text()}`);
      } else {
        console.log(`[Browser ${type}]: ${msg.text()}`);
      }
    });
  });

  /**
   * Test the success path - login with real email
   */
  test('Login with valid email should show success message', async ({ page }) => {
    // Set a timeout for waiting for successful API response
    test.setTimeout(30000);

    // Navigate to login page
    console.log('📱 Navigating to login page...');
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Wait for the form to appear
    await page.waitForSelector('form', { timeout: 10000 });

    // Fill in the email field with a valid email
    const realEmail = 'test@example.org'; // Change this to a real email for actual testing
    console.log(`✉️ Filling email address: ${realEmail}`);
    await page.fill('input[type="email"]', realEmail);

    // Take a screenshot before submitting
    await page.screenshot({
      path: path.join(artifactsDir, 'before-submit.png')
    });

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

      // Take a success screenshot
      await page.screenshot({
        path: path.join(artifactsDir, 'success.png')
      });

    } catch (error) {
      console.error('❌ Error: Did not see success message');

      // Take a screenshot for debugging
      await page.screenshot({
        path: path.join(artifactsDir, 'error.png')
      });

      // Get any error messages displayed on the page
      const errorText = await page.textContent('div[class*="red"]') || 'No visible error message';
      console.error('Error message on page:', errorText);

      // Fail the test
      expect(false, `Authentication failed: ${errorText}`).toBeTruthy();
    }
  });

  /**
   * Test the error path - invalid email format
   */
  test('Login with invalid email format should show validation error', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Wait for the form to appear
    await page.waitForSelector('form', { timeout: 10000 });

    // Fill in the email field with an invalid email
    const invalidEmail = 'not-an-email';
    await page.fill('input[type="email"]', invalidEmail);

    // Try to submit the form
    await page.click('button[type="submit"]');

    // The browser's built-in validation should prevent submission
    // Take a screenshot to confirm the validation error
    await page.screenshot({
      path: path.join(artifactsDir, 'invalid-email-validation.png')
    });

    // Check if we're still on the login page (not redirected)
    expect(page.url()).toContain('/auth/login');
  });
});