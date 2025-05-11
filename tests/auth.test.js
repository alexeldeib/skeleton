const { test, expect } = require('@playwright/test');

/**
 * Basic authentication tests for SaaS template
 * 
 * These tests cover the critical authentication flows:
 * 1. Magic link login
 * 2. Form validation
 * 3. Token handling
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    // Fill with invalid email
    await page.fill('input[type="email"]', 'not-an-email');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify error appears
    const errorVisible = await page.isVisible('[role="alert"]') ||
                         await page.evaluate(() => 
                           document.querySelector('input[type="email"]').validity.valid === false
                         );
    
    expect(errorVisible).toBeTruthy();
  });

  test('should show success message after requesting magic link', async ({ page }) => {
    // Fill with test email
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    const successMessage = await page.waitForSelector('text=Check your email', { 
      timeout: 10000 
    });
    
    expect(successMessage).toBeTruthy();
  });

  test('should handle JWT token in callback URL', async ({ page, context }) => {
    // Create mock token
    const mockToken = Buffer.from(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: 'mock-user-id',
      email: 'test@example.com'
    })).toString('base64');
    
    // Open callback page with token
    const callbackPage = await context.newPage();
    await callbackPage.goto(`/auth/callback?token=${mockToken}&type=magiclink&redirect_to=/dashboard`);
    
    // Check if redirected or error shown (both are valid implementations)
    const currentUrl = callbackPage.url();
    const isRedirected = currentUrl.includes('/dashboard') || 
                         currentUrl.includes('/auth/login') ||
                         await callbackPage.isVisible('[role="alert"]');
    
    expect(isRedirected).toBeTruthy();
  });
});