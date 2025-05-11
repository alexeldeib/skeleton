/**
 * Authentication test helper functions
 * 
 * Provides reusable functions for testing auth flows
 */

import { Page, expect } from '@playwright/test';

/**
 * Fill the login form with an email address
 * 
 * @param page The Playwright page object
 * @param email The email address to use
 * @returns Promise that resolves when form is filled
 */
export async function fillLoginForm(page: Page, email: string): Promise<void> {
  // Ensure we're on the login page
  if (!page.url().includes('/login')) {
    await page.goto('/auth/login', { waitUntil: 'networkidle' });
  }
  
  // Wait for and fill the email input
  const emailInput = await page.waitForSelector('input[type="email"]', {
    state: 'visible',
    timeout: 5000
  });
  
  await emailInput.fill(email);
}

/**
 * Submit the login form
 * 
 * @param page The Playwright page object
 * @returns Promise that resolves when form is submitted
 */
export async function submitLoginForm(page: Page): Promise<void> {
  const submitButton = await page.waitForSelector('button[type="submit"]', {
    state: 'visible',
    timeout: 5000
  });
  
  await submitButton.click();
}

/**
 * Check for the presence of a specific message on the page
 * 
 * @param page The Playwright page object
 * @param message The message text to look for (partial match)
 * @param timeout How long to wait for the message (default 10s)
 * @returns Promise that resolves with the element containing the message
 */
export async function checkForMessage(
  page: Page,
  message: string,
  timeout = 10000
): Promise<any> {
  // Look for any visible message element containing the text
  const messageElement = await page.waitForSelector(
    `text=${message}`,
    { timeout, state: 'visible' }
  );
  
  // Verify the message exists
  expect(messageElement).toBeTruthy();
  return messageElement;
}

/**
 * Check for error message that includes specified text
 * 
 * @param page The Playwright page object
 * @param errorText The error text to look for (partial match)
 * @param timeout How long to wait for the error (default 10s)
 * @returns Promise that resolves with the error element
 */
export async function checkForError(
  page: Page,
  errorText: string,
  timeout = 10000
): Promise<any> {
  // Look for any visible error message containing the text
  const errorElement = await page.waitForSelector(
    `div[role="alert"]:has-text("${errorText}")`,
    { timeout, state: 'visible' }
  );
  
  // Verify the error exists
  expect(errorElement).toBeTruthy();
  return errorElement;
}

/**
 * Take a labeled screenshot for test documentation
 * 
 * @param page The Playwright page object
 * @param testName The test name to use in filename
 * @param screenshotName The specific screenshot name
 * @param folder The folder to save in (default 'mock')
 * @returns Promise that resolves when screenshot is taken
 */
export async function takeScreenshot(
  page: Page,
  testName: string,
  screenshotName: string,
  folder = 'mock'
): Promise<void> {
  await page.screenshot({
    path: `./test-artifacts/screenshots/${folder}/${testName}-${screenshotName}.png`,
    fullPage: true
  });
}

/**
 * Check if user is authenticated by looking for dashboard or profile elements
 * 
 * @param page The Playwright page object
 * @returns Promise that resolves to boolean indicating auth status
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // If we're on dashboard or a protected page, we're authenticated
  if (page.url().includes('/dashboard') || page.url().includes('/settings')) {
    return true;
  }
  
  // Look for elements that indicate we're logged in
  try {
    const authElement = await page.waitForSelector(
      '.user-profile, .logout-button, .dashboard-content',
      { timeout: 5000, state: 'visible' }
    );
    return !!authElement;
  } catch (e) {
    return false;
  }
}