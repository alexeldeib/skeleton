/**
 * Production Supabase authentication test
 * 
 * This test verifies that:
 * 1. The login page loads correctly with production Supabase credentials
 * 2. The magic link request flow works (without actually following the link)
 * 3. The confirmation message appears correctly
 * 
 * NOTE: This test is designed to work with production Supabase,
 * but will NOT follow the actual magic link since we don't have access to the emails.
 */

import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load production environment variables
test.beforeAll(async () => {
  // Load production variables if available
  dotenv.config({ path: '.env.production' });
  console.log('📊 Testing with production Supabase configuration');
});

test('Production magic link request flow', async ({ page }) => {
  // Use a test email that's clearly for testing, but would work in production
  // This should be an email you control but is safe to receive test emails
  const testEmailAddress = 'test+prod@example.com';
  
  // Capture console messages for debugging
  page.on('console', msg => {
    const type = msg.type();
    console.log(`[Browser ${type}]: ${msg.text()}`);
  });
  
  // 1. Navigate to login page
  console.log('📱 Navigating to login page...');
  await page.goto('http://localhost:3001/auth/login', { 
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  // Verify URL
  expect(page.url()).toContain('/auth/login');
  
  // Take screenshot of login page (with production config)
  console.log('📸 Taking screenshot of login page (production)...');
  await page.evaluate(() => {
    // Remove any loading animations that might blur the screenshot
    document.querySelectorAll('.animate-spin').forEach(el => el.classList.remove('animate-spin'));
  });
  await page.screenshot({
    path: './test-artifacts/screenshots/prod-login-page.png',
    fullPage: true
  });

  // 2. Check for Supabase connection by looking for auth-related elements
  console.log('🔍 Checking for Supabase auth elements...');
  await page.waitForSelector('form', { timeout: 10000 });
  
  // Locate and fill email input
  console.log('✍️ Looking for email input...');
  const emailInput = await page.waitForSelector('input[type="email"]', { 
    timeout: 10000,
    state: 'visible'
  });
  
  console.log('✉️ Filling email address:', testEmailAddress);
  await emailInput.fill(testEmailAddress);
  
  // Take screenshot of filled form
  await page.screenshot({
    path: './test-artifacts/screenshots/prod-filled-form.png',
    fullPage: true
  });
  
  // 3. Submit the form - this will make a real API call to production Supabase
  console.log('🔘 Looking for submit button...');
  const submitButton = await page.waitForSelector('button[type="submit"]', { 
    timeout: 5000,
    state: 'visible'
  });
  
  // Before clicking, ensure we're capturing network requests to observe the Supabase call
  let supabaseAuthCall = false;
  page.on('request', request => {
    const url = request.url();
    if (url.includes('supabase') && url.includes('auth')) {
      console.log('🌐 Intercepted Supabase auth request:', url);
      supabaseAuthCall = true;
    }
  });
  
  // Now submit the form
  console.log('🖱️ Submitting form to production Supabase...');
  await submitButton.click();
  
  // 4. Check for success or error message
  try {
    // Wait for success message - this should appear if connected to production correctly 
    console.log('🔍 Waiting for confirmation message...');
    await page.waitForSelector('div:has-text("Check your email")', {
      timeout: 15000,
      state: 'visible'
    });
    
    // Take screenshot of confirmation
    await page.screenshot({
      path: './test-artifacts/screenshots/prod-confirmation-page.png',
      fullPage: true
    });
    
    console.log('✅ Production magic link request succeeded!');
    expect(supabaseAuthCall).toBeTruthy();
  } catch (error) {
    // If we get an error, capture it for debugging
    console.error('❌ Error: Could not confirm magic link request:', error.message);
    
    // Take screenshot of error state
    await page.screenshot({
      path: './test-artifacts/screenshots/prod-error-page.png',
      fullPage: true
    });
    
    // Check if we at least made a call to Supabase
    if (supabaseAuthCall) {
      console.log('⚠️ Made call to Supabase but couldn\'t confirm success message');
    } else {
      console.log('❌ No Supabase auth call detected. Production credentials may be missing.');
    }
    
    throw error;
  }
  
  // 5. Validate that we would receive an email (but can't check it)
  console.log('📧 In production, a real email would be sent to:', testEmailAddress);
  console.log('✅ Test completed: Production magic link request flow validated');
});