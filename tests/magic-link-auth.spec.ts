import { test, expect } from '@playwright/test';
import { deleteAllEmails, waitForMagicLink } from './helpers/mailbox';

// To make test failures easier to understand
test.beforeEach(async () => {
  console.log('\n📧 Starting magic link authentication test...');
});

/**
 * Test the magic link authentication flow
 * 
 * This test:
 * 1. Navigates to the login page
 * 2. Enters an email address
 * 3. Requests a magic link
 * 4. Checks the mailbox for the magic link email
 * 5. Extracts and follows the link
 * 6. Verifies successful authentication
 */
test('Magic link authentication flow', async ({ page, context }) => {
  // Step 1: Clear any existing emails first
  const testEmailAddress = 'test@example.com';
  const testEmailUser = 'test'; // Just the username part for mailbox API
  
  try {
    await deleteAllEmails(testEmailUser);
  } catch (error) {
    console.warn('Failed to clear emails, but continuing test:', error);
  }
  
  // Step 2: Navigate to login page
  await page.goto('/auth/login');
  await expect(page).toHaveTitle(/Login/i);
  
  // Step 3: Enter email and request magic link
  await page.getByPlaceholder(/email/i).fill(testEmailAddress);
  await page.getByRole('button', { name: /send magic link|sign in|login/i }).click();
  
  // Step 4: Verify confirmation message is shown
  await expect(page.getByText(/check your email|magic link sent|login link sent/i)).toBeVisible();

  // Step 5: Wait for the magic link email and get the link
  console.log('Waiting for magic link email to arrive...');
  let magicLink: string;

  try {
    // Wait for the magic link email to arrive (10 second timeout)
    magicLink = await waitForMagicLink(testEmailUser, 10000);
    console.log('Magic link received:', magicLink);
  } catch (error) {
    console.error('Error receiving magic link email:', error);
    throw error;
  }

  // Step 6: Visit the magic link URL in a new page (simulating clicking the link in email)
  const newPage = await context.newPage();
  console.log('Following magic link...');

  // The magic link will typically contain a token that the app uses to authenticate the user
  await newPage.goto(magicLink);

  // Wait for navigation and authentication to complete
  // This might involve redirects as the app processes the token
  await newPage.waitForLoadState('networkidle');

  // Step 7: Verify successful authentication
  // Check that we're redirected to the dashboard or another protected page
  // The default redirect in our app should be to /dashboard after login
  await expect(newPage).toHaveURL(/\/dashboard/);

  // Check for UI elements that indicate successful login
  // This could be a user profile element, welcome message, or other dashboard elements
  await expect(newPage.getByText(/welcome|dashboard|profile|account/i)).toBeVisible();

  // Check that user-specific content is visible
  // For example, if the dashboard shows the user's email, we could check for that
  await expect(newPage.getByText(testEmailAddress)).toBeVisible();

  console.log('Successfully authenticated via magic link!');

  // Clean up - close the new page
  await newPage.close();

  // Final cleanup - ensure we delete test emails
  try {
    await deleteAllEmails(testEmailUser);
    console.log('Test emails cleaned up successfully');
  } catch (error) {
    console.warn('Failed to clean up test emails:', error);
  }
});