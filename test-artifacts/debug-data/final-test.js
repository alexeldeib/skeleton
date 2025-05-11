// Final test script with simplified approach
const puppeteer = require('puppeteer');

async function testMagicLink() {
  console.log('Starting final test...');
  
  // Launch browser - non-headless for debugging
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1024, height: 768 },
  });
  
  try {
    const page = await browser.newPage();
    
    // Log console messages
    page.on('console', msg => console.log(`[Browser ${msg.type()}]:`, msg.text()));
    
    // Navigate to login page with sufficient wait time
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/auth/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'final-login-page.png' });
    console.log('Login page screenshot saved');
    
    // Fill in email
    console.log('Looking for email input...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'test@example.com');
    console.log('Email filled');
    
    // Click submit button
    console.log('Looking for submit button...');
    await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await page.click('button[type="submit"]');
    console.log('Submit button clicked');
    
    // Wait for confirmation message
    console.log('Waiting for confirmation message...');
    await page.waitForFunction(
      () => document.body.textContent.includes('Check your email') || 
             document.body.textContent.includes('login link') ||
             document.body.textContent.includes('magic link'),
      { timeout: 10000 }
    );
    
    console.log('Confirmation message found!');
    
    // Take a screenshot of the confirmation
    await page.screenshot({ path: 'confirmation-page.png' });
    console.log('Confirmation screenshot saved');
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close browser after a short delay
    setTimeout(() => {
      browser.close();
      console.log('Browser closed');
    }, 5000);
  }
}

testMagicLink().catch(console.error);