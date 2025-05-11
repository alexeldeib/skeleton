import { test, expect } from '@playwright/test';
import * as authHelper from './helpers/auth-test-helper';
import * as mailbox from './helpers/mailbox';

/**
 * Auth Integration Tests
 * 
 * These tests interact with the real Supabase auth service
 * but use the local development environment and mailbox
 * 
 * NOTE: These tests require:
 * 1. Supabase running locally (supabase start)
 * 2. The app running with local Supabase connection
 */

// Skip if running in CI (use mock tests there)
test.skip(!!process.env.CI, 'Integration tests skipped in CI');

test.describe('Authentication Integration Tests', () => {
  // Before each test, navigate to login page
  test.beforeEach(async ({ page }) => {
    // Capture console messages for debugging
    page.on('console', msg => {
      const type = msg.type();
      console.log(`[Browser ${type}]: ${msg.text()}`);
    });

    await page.goto('http://localhost:3001/auth/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
  });
  
  // Generate a unique test email for each run
  const testEmail = `test-${Date.now()}@example.com`;
  
  test('Should send magic link to local mailbox', async ({ page }) => {
    console.log(`🧪 Testing magic link with email: ${testEmail}`);
    
    // Clear mailbox before starting
    try {
      await mailbox.deleteAllEmails(testEmail.split('@')[0]);
    } catch (error) {
      console.log('ℹ️ Mailbox could not be cleared, may be empty already');
    }
    
    // Fill and submit login form
    await authHelper.fillLoginForm(page, testEmail);
    await authHelper.takeScreenshot(page, 'integration', 'filled-form');
    await authHelper.submitLoginForm(page);
    
    // Check for success message
    await authHelper.checkForMessage(page, 'Check your email');
    await authHelper.takeScreenshot(page, 'integration', 'success-message');
    
    // Wait for and verify email delivery
    console.log('📩 Waiting for magic link email...');
    try {
      const magicLinkEmail = await mailbox.expectMagicLinkEmail(testEmail.split('@')[0]);
      expect(magicLinkEmail).toBeTruthy();
      console.log('✉️ Magic link email received!');
      
      // Extract and follow the magic link
      const emailContent = await mailbox.getEmail(
        testEmail.split('@')[0], 
        magicLinkEmail.id
      );
      
      // Extract magic link URL from email content
      let magicLink: string | null = null;
      
      if (emailContent.body.html) {
        const htmlMatches = emailContent.body.html.match(/href=["'](https?:\/\/[^"']+)["']/);
        if (htmlMatches && htmlMatches[1]) {
          magicLink = htmlMatches[1].replace('https://app.example.com', 'http://localhost:3001');
        }
      }
      
      if (!magicLink && emailContent.body.text) {
        const textMatches = emailContent.body.text.match(/(https?:\/\/[^\s]+)/);
        if (textMatches && textMatches[1]) {
          magicLink = textMatches[1].replace('https://app.example.com', 'http://localhost:3001');
        }
      }
      
      expect(magicLink).toBeTruthy();
      console.log('🔗 Found magic link in email:', magicLink);
      
      // Follow the magic link in a new page
      const authPage = await page.context().newPage();
      await authPage.goto(magicLink as string, { timeout: 30000 });
      
      // Wait for redirect to dashboard (or authentication success)
      try {
        await authPage.waitForURL('**/dashboard', { timeout: 15000 });
        await authHelper.takeScreenshot(authPage, 'integration', 'authenticated');
        console.log('🎉 Successfully authenticated with magic link!');
      } catch (error) {
        console.log('⚠️ Authentication flow may have issues:', error.message);
        await authHelper.takeScreenshot(authPage, 'integration', 'auth-result');
        
        // Check if we're authenticated despite URL issues
        const isAuth = await authHelper.isAuthenticated(authPage);
        if (isAuth) {
          console.log('✅ User appears to be authenticated despite no redirect');
        } else {
          throw new Error('Authentication failed - user not authenticated');
        }
      }
    } catch (error) {
      console.error('❌ Magic link test failed:', error.message);
      await authHelper.takeScreenshot(page, 'integration', 'failure-state');
      throw error;
    }
  });
  
  test('Should detect and show authentication errors', async ({ page }) => {
    console.log('🧪 Testing authentication errors');
    
    // Mock an already registered email 
    const existingEmail = 'registered@example.com';
    
    // Intercept auth calls to simulate specific errors
    await page.route('**/auth/v1/otp', route => {
      // Simulate rate limiting error
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Too many requests',
            message: 'Rate limit exceeded'
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Submit form with the email
    await authHelper.fillLoginForm(page, existingEmail);
    await authHelper.submitLoginForm(page);
    
    // Wait for error message
    const errorElement = await page.waitForSelector('div[role="alert"]', { 
      state: 'visible',
      timeout: 10000
    });
    
    // Take screenshot of error message
    await authHelper.takeScreenshot(page, 'integration', 'rate-limit-error');
    
    // Verify error is shown
    const errorText = await errorElement.textContent();
    expect(errorText).toContain('Rate limit') || expect(errorText).toContain('Too many requests');
    
    console.log('✅ Rate limit error correctly displayed!');
  });
});