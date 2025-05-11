/**
 * Complete magic link authentication test with local Supabase
 * 
 * This test verifies the full authentication flow using a local Supabase instance:
 * 1. Send magic link request
 * 2. Fetch actual email from local Supabase inbucket
 * 3. Extract and follow the magic link
 * 4. Validate successful authentication
 * 
 * NOTE: This test requires a running local Supabase instance with inbucket
 * available on port 54324.
 */

import { test, expect } from '@playwright/test';
import { deleteAllEmails, waitForMagicLink, expectMagicLinkEmail } from './helpers/mailbox';
import dotenv from 'dotenv';

// Load local development environment variables
test.beforeAll(async () => {
  // Ensure we're using local Supabase
  dotenv.config({ path: '.env.local' });
  console.log('🧪 Testing with local Supabase configuration');
});

// Clear emails before test
test.beforeEach(async () => {
  console.log('\n📧 Starting local Supabase magic link test...');
  
  // Clear any existing emails
  try {
    await deleteAllEmails('test');
    console.log('🧹 Cleared existing test emails from local inbucket');
  } catch (error) {
    console.log('⚠️ Could not clear emails from local inbucket:', error.message);
    console.log('⚠️ Make sure Supabase is running locally with: supabase start');
  }
});

test('Complete magic link flow with local Supabase', async ({ page, context }) => {
  // Use a test email that will go to local Supabase inbucket
  const testEmailUsername = 'test';
  const testEmailAddress = `${testEmailUsername}@example.com`;
  
  // Capture console messages
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
  
  // Take clear screenshot of login page
  console.log('📸 Taking screenshot of login page...');
  await page.evaluate(() => {
    // Remove any loading animations that might blur the screenshot
    document.querySelectorAll('.animate-spin').forEach(el => el.classList.remove('animate-spin'));
  });
  await page.screenshot({
    path: './test-artifacts/screenshots/local-login-page.png',
    fullPage: true
  });

  // 2. Wait for page to load completely
  console.log('⏳ Waiting for login form to appear...');
  await page.waitForSelector('form', { timeout: 10000 });
  
  // 3. Locate and fill email input
  console.log('✍️ Looking for email input...');
  const emailInput = await page.waitForSelector('input[type="email"]', { 
    timeout: 10000,
    state: 'visible'
  });
  
  console.log('✉️ Filling email address:', testEmailAddress);
  await emailInput.fill(testEmailAddress);
  
  // Take screenshot of filled form
  await page.screenshot({
    path: './test-artifacts/screenshots/local-filled-form.png',
    fullPage: true
  });
  
  // 4. Find and click submit button
  console.log('🔘 Looking for submit button...');
  const submitButton = await page.waitForSelector('button[type="submit"]', { 
    timeout: 5000,
    state: 'visible'
  });
  
  console.log('🖱️ Submitting form...');
  await submitButton.click();
  
  // 5. Wait for success message
  console.log('🔍 Waiting for confirmation message...');
  await page.waitForSelector('div:has-text("Check your email")', {
    timeout: 10000,
    state: 'visible'
  });
  
  // Take screenshot of confirmation page
  console.log('📸 Taking screenshot of confirmation page...');
  await page.screenshot({
    path: './test-artifacts/screenshots/local-confirmation-page.png',
    fullPage: true
  });

  console.log('✅ Login form submission succeeded!');
  
  // 6. Check for magic link email in local Supabase inbucket
  console.log('📬 Checking for magic link email in local Supabase inbucket...');
  let magicLink;
  try {
    // Wait for the magic link email to arrive and extract the link
    await expectMagicLinkEmail(testEmailUsername);
    console.log('📨 Magic link email received in local inbucket!');
    
    // Get the actual magic link
    magicLink = await waitForMagicLink(testEmailUsername);
    console.log('🔗 Magic link extracted:', magicLink);
    
    // Ensure the link is properly formatted for localhost
    if (magicLink.includes('localhost:54321')) {
      magicLink = magicLink.replace('localhost:54321', 'localhost:3001');
    }
    
    // Take screenshot of email received
    await page.screenshot({
      path: './test-artifacts/screenshots/local-email-received.png',
      fullPage: true
    });
    
    // 7. Follow the magic link in a new page/tab
    console.log('🔐 Following magic link from local Supabase email...');
    const authPage = await context.newPage();
    
    // Enable console log in the auth page too
    authPage.on('console', msg => {
      const type = msg.type();
      console.log(`[Auth page ${type}]: ${msg.text()}`);
    });
    
    await authPage.goto(magicLink, { timeout: 30000 });
    
    // 8. Verify successful auth
    console.log('🔍 Waiting for redirect to dashboard...');
    await authPage.waitForURL('**/dashboard', { timeout: 30000 });
    
    // Take screenshot of authenticated page
    console.log('📸 Taking screenshot of authenticated state...');
    await authPage.screenshot({ 
      path: './test-artifacts/screenshots/local-authenticated-page.png',
      fullPage: true 
    });
    
    console.log('🎉 Full magic link authentication flow with local Supabase passed!');
  } catch (error) {
    console.log('⚠️ Could not complete magic link flow with local Supabase:', error.message);
    console.log('⚠️ This is expected if local Supabase inbucket is not running');
    console.log('❓ Try running: cd supabase && supabase start');
    
    // Take screenshot of error state
    await page.screenshot({
      path: './test-artifacts/screenshots/local-error-state.png',
      fullPage: true
    });
    
    throw error;
  }
  
  // Final cleanup - ensure we delete test emails
  try {
    await deleteAllEmails(testEmailUsername);
    console.log('🧹 Test emails cleaned up successfully from local inbucket');
  } catch (error) {
    console.warn('⚠️ Failed to clean up test emails:', error.message);
  }
});