import { test, expect } from '@playwright/test';

/**
 * Complete end-to-end test for magic link authentication
 * 
 * This test will:
 * 1. Navigate to the main page
 * 2. Click on login link or button 
 * 3. Enter an email address
 * 4. Submit the form
 * 5. Verify success message
 */
test('End-to-end magic link test', async ({ page }) => {
  // Test email to use
  const testEmailAddress = 'test@example.com';
  
  // Start from the home page
  console.log('Loading home page...');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  
  await page.screenshot({ path: './test-artifacts/screenshots/e2e/home-page.png' });
  console.log('Saved home page screenshot');
  
  // Find a link to login - there might be various UI elements for this
  console.log('Looking for login link or button...');
  
  // Try various ways to find a login link
  const loginNavigated = await findAndClickLoginLink(page);
  
  if (!loginNavigated) {
    // Navigate to login page directly
    console.log('No login link found on home page, trying direct navigation...');

    // Force a reload in case of stale cache from previous test runs
    await page.goto('http://localhost:3001/auth/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // For troubleshooting, dump the HTML content
    const html = await page.content();
    console.log(`HTML content length: ${html.length} chars`);
    console.log(`Contains "Sign In": ${html.includes('Sign In')}`);
    console.log(`Contains input tag: ${html.includes('<input')}`);

    // Force a reload one more time
    console.log('Forcing page reload...');
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  }
  
  // Should now be on login page
  console.log('Verifying we are on login page...');
  await page.screenshot({ path: './test-artifacts/screenshots/e2e/login-page.png' });
  
  // Look for an email input field
  const emailInput = await findEmailInput(page);
  
  if (!emailInput) {
    console.log('No email input found, test failed');
    throw new Error('Email input not found on login page');
  }
  
  // Fill the email input
  console.log('Filling email address...');
  await emailInput.fill(testEmailAddress);
  
  // Find and click submit button
  console.log('Looking for submit button...');
  const submitButton = await findSubmitButton(page);
  
  if (!submitButton) {
    console.log('No submit button found, test failed');
    throw new Error('Submit button not found on login page');
  }
  
  console.log('Clicking submit button...');
  await submitButton.click();
  
  // Check for success message
  await page.screenshot({ path: './test-artifacts/screenshots/e2e/after-submit.png' });
  console.log('Looking for success message...');
  
  // Check for any kind of confirmation UI 
  const confirmationFound = await checkForConfirmation(page);
  
  if (!confirmationFound) {
    console.log('No confirmation message found, test failed');
    throw new Error('No confirmation found after submitting email');
  }
  
  console.log('Magic link test successful!');
});

// Helper functions

async function findAndClickLoginLink(page) {
  // Try different strategies to find login link
  const strategies = [
    { selector: 'a:has-text("Sign In")', log: 'Found Sign In link' },
    { selector: 'a:has-text("Login")', log: 'Found Login link' },
    { selector: 'a:has-text("Log In")', log: 'Found Log In link' },
    { selector: 'button:has-text("Sign In")', log: 'Found Sign In button' },
    { selector: 'a[href*="login"]', log: 'Found link with login in href' },
    { selector: 'a[href*="signin"]', log: 'Found link with signin in href' },
    { selector: 'a[href*="auth"]', log: 'Found link with auth in href' },
  ];
  
  for (const { selector, log } of strategies) {
    try {
      const element = await page.waitForSelector(selector, { timeout: 1000 });
      if (element) {
        console.log(log);
        await element.click();
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        return true;
      }
    } catch (error) {
      // Continue to next strategy
    }
  }
  
  return false;
}

async function findEmailInput(page) {
  // Try different strategies to find email input
  const strategies = [
    { selector: 'input[type="email"]', log: 'Found input[type="email"]' },
    { selector: 'input#email', log: 'Found input#email' },
    { selector: 'input[name="email"]', log: 'Found input[name="email"]' },
    { selector: 'input[placeholder*="email"]', log: 'Found input with email in placeholder' },
    { selector: 'form input', log: 'Found form input (assuming first input is email)' },
  ];
  
  for (const { selector, log } of strategies) {
    try {
      const element = await page.waitForSelector(selector, { timeout: 1000 });
      if (element) {
        console.log(log);
        return element;
      }
    } catch (error) {
      // Continue to next strategy
    }
  }
  
  return null;
}

async function findSubmitButton(page) {
  // Try different strategies to find submit button
  const strategies = [
    { selector: 'button[type="submit"]', log: 'Found button[type="submit"]' },
    { selector: 'button:has-text("Sign In")', log: 'Found Sign In button' },
    { selector: 'button:has-text("Login")', log: 'Found Login button' },
    { selector: 'button:has-text("Submit")', log: 'Found Submit button' },
    { selector: 'button:has-text("Send")', log: 'Found Send button' },
    { selector: 'button:has-text("Magic")', log: 'Found Magic Link button' },
    { selector: 'form button', log: 'Found form button' },
    { selector: 'input[type="submit"]', log: 'Found input[type="submit"]' },
  ];
  
  for (const { selector, log } of strategies) {
    try {
      const element = await page.waitForSelector(selector, { timeout: 1000 });
      if (element) {
        console.log(log);
        return element;
      }
    } catch (error) {
      // Continue to next strategy
    }
  }
  
  return null;
}

async function checkForConfirmation(page) {
  // Try different strategies to find confirmation message
  const strategies = [
    { selector: 'text="Check your email"', log: 'Found "Check your email" text' },
    { selector: 'text="login link"', log: 'Found "login link" text' },
    { selector: 'text="magic link"', log: 'Found "magic link" text' },
    { selector: '.text-green-800, .text-green-900, .bg-green-100, .bg-green-200', log: 'Found success style element' },
    { selector: '[role="alert"]', log: 'Found alert role' },
  ];
  
  for (const { selector, log } of strategies) {
    try {
      const element = await page.waitForSelector(selector, { timeout: 1000 });
      if (element) {
        console.log(log);
        return true;
      }
    } catch (error) {
      // Continue to next strategy
    }
  }
  
  // As a last resort, check if the page content mentions anything about email or success
  const content = await page.content();
  if (
    content.includes('email') && 
    (content.includes('sent') || content.includes('check') || content.includes('success'))
  ) {
    console.log('Found success-like keywords in page content');
    return true;
  }
  
  return false;
}