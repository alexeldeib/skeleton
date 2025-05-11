# Authentication Testing Suite

This directory contains comprehensive end-to-end tests for the SaaS application using Playwright, with special focus on the authentication system.

## Prerequisites

- Node.js and npm
- Supabase CLI installed
- All dependencies installed (`npm install` at the root)
- Playwright browsers installed (`npx playwright install`)

## Setup

Tests require a running Next.js app (on port 3001) and a running Supabase instance.

```bash
# Start Supabase (from project root)
cd supabase
supabase start

# Start the app (from project root)
cd app
npm run dev
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run a specific test
npx playwright test tests/magic-link-auth.spec.ts

# Run with UI
npx playwright test --ui

# Run with headed browsers (visible browser windows)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# View test report after running tests
npx playwright show-report
```

## Test Descriptions

### Magic Link Authentication

We have multiple test variants for magic link authentication to handle different testing scenarios:

#### 1. Mock Email Server Test (`magic-link-auth.spec.ts`)

This test uses a mock email server to simulate the complete authentication flow:

1. Navigates to the login page
2. Verifies the form is visible and interactive
3. Enters a test email address
4. Submits the form
5. Verifies the success message appears
6. Generates a mock magic link (simulating the email)
7. Follows the magic link to complete authentication
8. Verifies successful redirection to the dashboard

#### 2. Local Supabase Test (`auth-local-complete.spec.ts`)

This test uses a running local Supabase instance with inbucket email service:

1. Navigates to the login page
2. Sends a magic link request to a test email
3. Checks the local Supabase inbucket for the actual email
4. Extracts the real magic link from the email
5. Follows the link to complete authentication
6. Verifies successful redirection to dashboard

#### 3. Production Validation Test (`auth-prod-check.spec.ts`)

This test verifies the form works against production Supabase (without following links):

1. Navigates to the login page with production credentials
2. Submits a magic link request to a controlled test email
3. Verifies the confirmation message appears
4. Confirms network requests are sent to production Supabase

#### 4. Error Cases Test (`auth-error-cases.spec.ts`)

This test suite verifies proper handling of various error scenarios:

1. Tests validation for invalid email formats
2. Tests validation for empty email submission
3. Tests handling of invalid magic link tokens
4. Tests handling of network errors during authentication

#### 5. Authentication Integration Test (`auth-integration.spec.ts`)

This test provides comprehensive integration testing with a local Supabase:

1. Tests the complete magic link flow with a real Supabase instance
2. Verifies correct handling of rate limiting and other errors
3. Uses the real mailbox to extract and verify magic links

### Email Testing Approaches

We use multiple approaches for handling emails in tests:

1. **Application Test Mode**
   - Any email address containing `test@example` will trigger a test mode in the auth component
   - In test mode, the application will simulate a successful magic link send operation
   - This allows testing of the UI flow without actual email delivery

2. **Mock Email Server**
   - Used in `magic-link-auth.spec.ts`
   - A custom mock email server (`tests/mock-email-server.js`) simulates the Supabase inbucket
   - It generates magic links and tracks emails during testing
   - This allows complete end-to-end testing without requiring a running Supabase instance
   - Ideal for CI/CD environments or when Supabase isn't available

3. **Local Supabase Inbucket**
   - Used in `auth-local-complete.spec.ts`
   - Accesses real emails from the local Supabase inbucket service
   - Uses the `helpers/mailbox.ts` module to fetch emails from inbucket
   - Provides the most realistic testing of the complete flow
   - Requires a running local Supabase instance (`supabase start`)

4. **Production Validation**
   - Used in `auth-prod-check.spec.ts`
   - Makes actual API calls to production Supabase
   - Validates form submission and confirmation message
   - Doesn't attempt to access actual emails or follow magic links
   - Useful for validating production configuration

## Test Artifacts

Test runs generate various artifacts that are saved for debugging and verification:

- **Screenshots**: Captured at critical points during test execution
  - Login page initial state: `test-artifacts/screenshots/login-page.png`
  - Form filled with test email: `test-artifacts/screenshots/filled-form.png`
  - After magic link request: `test-artifacts/screenshots/confirmation-page.png`
  - Magic link email received: `test-artifacts/screenshots/email-requested.png`
  - After successful authentication: `test-artifacts/screenshots/authenticated-page.png`
  - Fallback page state (if auth fails): `test-artifacts/screenshots/auth-result-page.png`

- **Debug Data**: HTML and JS files used during development and debugging
  - `test-artifacts/debug-data/`

## Helper Utilities

The `helpers` directory contains utility functions for testing:

- `mailbox.ts` - Functions to interact with Supabase's local inbucket email service
- `mock-email-helper.js` - Functions to manage the mock email server
- `auth-test-helper.ts` - Common authentication testing functions including:
  - `fillLoginForm()` - Fill the login form with an email
  - `submitLoginForm()` - Submit the login form
  - `checkForMessage()` - Look for specific messages on the page
  - `checkForError()` - Look for specific error messages
  - `takeScreenshot()` - Take labeled screenshots for documentation
  - `isAuthenticated()` - Check if the user is authenticated

## Debugging Tests

If tests fail, you can:

1. Check console output for browser errors
2. Look for screenshots saved in the `test-artifacts/screenshots` directory
3. Examine the HTML files saved in `test-artifacts/debug-data`
4. Run with debug mode: `npx playwright test --debug`
5. Check the Supabase local development server logs
6. View the full HTML report: `npx playwright show-report`

### Common Issues

- **404 Errors**: Make sure the Next.js app is running on port 3001
- **Environment Variable Issues**: Ensure Supabase URL and key are properly set
- **Network Errors**: Check if Supabase is running on port 54321
- **Form Submission Errors**: Check browser console for any API call failures
- **Mock Email Server Failures**: Check if port 54324 is available

## Extending the Tests

When adding new tests, follow these guidelines:

1. Put common utilities in helper files in the `helpers` directory
2. Follow the existing patterns for test organization
3. Use the auth-test-helper functions for common operations
4. Take screenshots at key points for documentation
5. Add proper error handling and detailed logs

## Notes for CI/CD

When running in CI/CD environments, set the CI environment variable to ensure proper configuration:

```bash
CI=true npx playwright test
```

For CI environments, the mock tests (`magic-link-auth.spec.ts` and `auth-error-cases.spec.ts`) are preferred as they don't require a running Supabase instance.