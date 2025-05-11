// Simple script to test the magic link
const puppeteer = require('puppeteer');

async function testMagicLink() {
  // Launch a non-headless browser to visually inspect
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1024, height: 768 },
  });
  
  try {
    const page = await browser.newPage();

    // Capture console logs
    page.on('console', msg => {
      const type = msg.type();
      console.log(`[Browser ${type}]: ${msg.text()}`);
    });

    // Capture errors
    page.on('pageerror', err => {
      console.log(`[Browser ERROR]: ${err.message}`);
    });

    // Go to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/auth/login', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Check the HTML content
    const html = await page.content();
    console.log(`Page HTML length: ${html.length} chars`);
    console.log(`Contains email input: ${html.includes('input') && html.includes('email')}`);
    console.log(`Contains Sign In text: ${html.includes('Sign In')}`);

    // Check if environment variables are accessible
    const envVarCheck = await page.evaluate(() => {
      return {
        supabaseUrl: window.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
        supabaseKey: !!window.NEXT_PUBLIC_SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || false
      };
    });
    console.log('Environment variables check:', envVarCheck);

    // Save the HTML to a file
    const fs = require('fs');
    fs.writeFileSync('login-page-html.html', html);
    console.log('HTML saved to login-page-html.html');

    // Take a screenshot
    await page.screenshot({ path: 'login-page-screenshot.png' });
    console.log('Screenshot saved to login-page-screenshot.png');

    // Wait a few seconds for manual inspection
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Fill in the email
    await page.type('input[type="email"]', 'test@example.com');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Click the submit button
    await page.click('button[type="submit"]');
    
    // Wait to see the confirmation
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Test completed. Press Ctrl+C to end the script.');
    
    // Keep the browser open
    await new Promise(resolve => setTimeout(resolve, 30000));
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testMagicLink().catch(console.error);