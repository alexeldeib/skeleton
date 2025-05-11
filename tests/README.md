# End-to-End Tests

This directory contains end-to-end tests for the SaaS application using Playwright.

## Prerequisites

- Node.js and npm
- Supabase CLI installed
- All dependencies installed (`npm install` at the root)

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

# Run in debug mode
npx playwright test --debug
```

## Test Descriptions

### Magic Link Authentication

The `magic-link-auth.spec.ts` test verifies the complete magic link authentication flow:

1. Navigates to the login page
2. Verifies the form is visible and interactive
3. Enters a test email address
4. Submits the form
5. Verifies the success message appears
6. Generates a mock magic link (simulating the email)
7. Follows the magic link to complete authentication
8. Verifies successful redirection to the dashboard

#### Email Testing Implementations

The test supports two modes of email testing:

1. **Application Test Mode**
   - Any email address containing `test@example` will trigger a test mode in the auth component
   - In test mode, the application will simulate a successful magic link send operation
   - This allows testing of the UI flow without actual email delivery

2. **Mock Email Server**
   - The test uses a custom mock email server (`tests/mock-email-server.js`)
   - This server simulates the Supabase inbucket email service on port 54324
   - It generates magic links and tracks emails sent during testing
   - This allows complete end-to-end testing without requiring a running Supabase instance

3. **Real Supabase Email Testing**
   - For real email testing with Supabase inbucket, use the `helpers/mailbox.ts` module
   - This requires a running Supabase instance with inbucket configured
   - This option is useful for production-like testing environments

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

## Debugging Tests

If tests fail, you can:

1. Check console output for browser errors
2. Look for screenshots saved in the `test-artifacts/screenshots` directory
3. Examine the HTML files saved in `test-artifacts/debug-data`
4. Run with debug mode: `npx playwright test --debug`
5. Check the Supabase local development server logs

### Common Issues

- **404 Errors**: Make sure the Next.js app is running on port 3001
- **Environment Variable Issues**: Ensure Supabase URL and key are properly set
- **Network Errors**: Check if Supabase is running on port 54321
- **Form Submission Errors**: Check browser console for any API call failures

## Notes for CI/CD

When running in CI/CD environments, set the CI environment variable to ensure proper configuration:

```bash
CI=true npx playwright test
```