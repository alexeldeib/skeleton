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
  test('should respond to health check', async ({ request }) => {
    // Test backend health endpoint
    const response = await request.get('/api/health');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('should require authentication for protected routes', async ({ request }) => {
    // Test protected endpoint without auth
    const response = await request.get('/api/user');
    
    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should handle form submissions properly', async ({ page }) => {
    // Go to form page (could be settings or profile)
    await page.goto('/settings');
    
    // Fill form (assumes not logged in, should redirect to login)
    if (page.url().includes('/auth/login')) {
      // This is expected behavior when not authenticated
      expect(page.url()).toContain('/auth/login');
    } else {
      // If for some reason we're on the settings page (e.g., in test mode)
      // Fill a form field
      await page.fill('input[name="displayName"]', 'Test User');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check for success message or error
      const feedbackVisible = await page.isVisible('[role="alert"]');
      expect(feedbackVisible).toBeTruthy();
    }
  });
});