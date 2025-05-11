# End-to-End Tests

This directory contains end-to-end tests for the SaaS application.

## Prerequisites

- Node.js and npm
- Supabase CLI installed
- All dependencies installed (`npm install` at the root)

## Running Tests

### Run all tests

```bash
npm run test:e2e
```

### Run a specific test

```bash
# Run just the authentication test
npm run test:auth
```

### View test reports

```bash
npm run test:report
```

## Test Descriptions

### Magic Link Authentication

The `magic-link-auth.spec.ts` test verifies the complete magic link authentication flow:

1. Navigates to the login page
2. Enters an email address
3. Requests a magic link
4. Checks the Supabase local mailbox for the magic link email
5. Extracts and follows the magic link
6. Verifies successful authentication

This test requires the Supabase local development server to be running as it uses the inbucket mail service to intercept and process emails.

## Debugging Tests

If tests fail, you can:

1. Check the Playwright report (`npm run test:report`)
2. Look for screenshots in the `test-results` directory
3. Run with debug mode: `npx playwright test --debug`
4. Check the Supabase local development server logs

## Notes for CI/CD

When running in CI/CD environments, set the CI environment variable to ensure proper configuration:

```bash
CI=true npm run test:e2e
```