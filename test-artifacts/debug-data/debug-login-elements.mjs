// Detailed script to check exactly what elements are on the login page
import puppeteer from 'puppeteer';
import fs from 'fs';

async function debugLoginElements() {
  console.log('Starting detailed login page debug...');
  
  let browser;
  
  try {
    // Start browser in headless mode
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/auth/login', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ path: 'login-page-debug.png' });
    console.log('Screenshot saved to login-page-debug.png');
    
    // Get all headings and large text elements
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6, .text-2xl, .text-3xl, .font-bold', (elements) => {
      return elements.map(el => ({
        tag: el.tagName,
        text: el.textContent,
        classes: el.className,
        html: el.outerHTML
      }));
    });

    console.log(`Found ${headings.length} heading elements:`);
    headings.forEach((el, i) => {
      console.log(`  Heading #${i+1} (${el.tag}):`);
      console.log(`    Text: "${el.text}"`);
      console.log(`    Classes: "${el.classes}"`);
      console.log(`    HTML: "${el.html}"`);
    });

    // Find elements containing "Sign In" text
    const signInElements = await page.$$eval('*', (elements) => {
      return elements
        .filter(el => el.textContent && el.textContent.includes('Sign In'))
        .map(el => ({
          tag: el.tagName,
          text: el.textContent,
          classes: el.className,
          html: el.outerHTML
        }));
    });

    console.log(`\nFound ${signInElements.length} elements containing "Sign In" text:`);
    signInElements.forEach((el, i) => {
      console.log(`  Element #${i+1} (${el.tag}):`);
      console.log(`    Text: "${el.text}"`);
      console.log(`    Classes: "${el.classes}"`);
    });

    // Get all input fields
    const inputs = await page.$$eval('input', (elements) => {
      return elements.map(el => ({
        id: el.id,
        type: el.type,
        placeholder: el.placeholder,
        classes: el.className
      }));
    });

    console.log(`\nFound ${inputs.length} input elements:`);
    inputs.forEach((el, i) => {
      console.log(`  Input #${i+1}:`);
      console.log(`    ID: "${el.id}", Type: "${el.type}"`);
      console.log(`    Placeholder: "${el.placeholder}"`);
      console.log(`    Classes: "${el.classes}"`);
    });
    
    // Get page HTML
    const html = await page.content();
    fs.writeFileSync('login-page-full.html', html);
    
    console.log('Debug complete');
  } catch (error) {
    console.error('Error during debug:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugLoginElements()
  .catch(console.error)
  .finally(() => {
    setTimeout(() => process.exit(0), 1000);
  });