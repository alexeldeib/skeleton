import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Debug test to investigate Supabase authentication issues
 * This test will:
 * 1. Check environment variables
 * 2. Test direct API connections to Supabase
 * 3. Test the Auth UI flow
 */
test('Debug Supabase Authentication', async ({ page }) => {
  // Step 1: Check environment variables
  console.log('\n🔍 CHECKING ENVIRONMENT VARIABLES:');
  
  // Create a directory for test artifacts if it doesn't exist
  const artifactsDir = path.join(__dirname, '../test-artifacts/debug');
  fs.mkdirSync(artifactsDir, { recursive: true });
  
  // Read the .env.local file to see what values are actually being set
  try {
    const appEnvPath = path.join(__dirname, '../app/.env.local');
    const envContent = fs.readFileSync(appEnvPath, 'utf8');
    console.log('📄 App .env.local content:');
    
    // Safe logging - only show key prefixes
    const safeContent = envContent.replace(
      /(SUPABASE_.*?KEY=")([^"]+)(")/g, 
      (match, p1, p2, p3) => `${p1}${p2.substring(0, 10)}...${p2.substring(p2.length - 5)}${p3}`
    );
    
    console.log(safeContent);
    
    // Write the safe content to a file for reference
    fs.writeFileSync(
      path.join(artifactsDir, 'env-variables.txt'), 
      safeContent
    );
  } catch (error) {
    console.error('❌ Error reading .env.local:', error);
  }

  // Step 2: Visit the debug page to see runtime environment values
  console.log('\n🌐 VISITING DEBUG PAGE:');
  await page.goto('/debug');
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot of the debug page
  await page.screenshot({ 
    path: path.join(artifactsDir, 'debug-page.png'),
    fullPage: true 
  });

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    console.log(`[Browser ${type}]: ${msg.text()}`);
  });
  
  // Wait a moment to collect console logs
  await page.waitForTimeout(2000);
  
  // Step 3: Test the login page
  console.log('\n🔐 TESTING LOGIN PAGE:');
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot of the login page
  await page.screenshot({ 
    path: path.join(artifactsDir, 'login-page.png'),
    fullPage: true 
  });
  
  // Fill in the email field with a test email
  await page.fill('input[type="email"]', 'test@example.com');
  
  // Take a screenshot after filling the form
  await page.screenshot({ 
    path: path.join(artifactsDir, 'filled-login-form.png'),
    fullPage: true 
  });
  
  // Click the submit button and wait for the response
  await page.click('button[type="submit"]');
  
  // Wait for the success message (should appear since we're using a test@example.com email)
  try {
    await page.waitForSelector('text=Check your email', { timeout: 5000 });
    console.log('✅ Success message displayed (using test@example.com)');
    
    // Take a screenshot of the success message
    await page.screenshot({ 
      path: path.join(artifactsDir, 'login-success.png'),
      fullPage: true 
    });
  } catch (error) {
    console.log('❌ Success message not displayed:', error);
    
    // Take a screenshot of the current state
    await page.screenshot({ 
      path: path.join(artifactsDir, 'login-failure.png'),
      fullPage: true 
    });
  }
  
  // Step 4: Test the login page with a real email
  console.log('\n📧 TESTING LOGIN WITH REAL EMAIL:');
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  
  // Fill in the email field with a real email
  const realEmail = 'test.real@example.com'; // Use a real email here for testing
  await page.fill('input[type="email"]', realEmail);
  
  // Take a screenshot after filling the form
  await page.screenshot({ 
    path: path.join(artifactsDir, 'filled-real-email.png'),
    fullPage: true 
  });
  
  // Click the submit button and wait for the response
  console.log(`📤 Submitting form with email: ${realEmail}`);
  await page.click('button[type="submit"]');
  
  // Wait for some time to collect console logs
  await page.waitForTimeout(3000);
  
  // Take a final screenshot of the current state
  await page.screenshot({ 
    path: path.join(artifactsDir, 'final-state.png'),
    fullPage: true 
  });
  
  console.log('🏁 Debug test completed. Check test-artifacts/debug/ directory for screenshots and logs.');
});