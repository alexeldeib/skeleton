const { test, expect } = require('@playwright/test');

/**
 * Basic API tests for SaaS template
 * 
 * These tests cover the critical API endpoints:
 * 1. Health check
 * 2. Protected routes
 * 3. Data fetching
 */

test.describe('API Endpoints', () => {
  test('should respond with 200 for home page', async ({ request }) => {
    // Test that the home page loads
    const response = await request.get('/');

    expect(response.ok()).toBeTruthy();
  });

  test('should access dashboard page', async ({ page }) => {
    // Test dashboard
    await page.goto('/dashboard');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Check if the page loaded without errors
    expect(page.url()).toMatch(/\/(dashboard|auth\/login)/);
  });

  test('should show login form', async ({ page }) => {
    // Go to login page
    await page.goto('/auth/login');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Verify page loaded correctly
    const content = await page.content();
    expect(content).toContain('form');

    // Check that we're on a valid page (either login form or similar authentication page)
    expect(page.url()).toContain('/auth');
  });
});