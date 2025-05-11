// Simple script to check if the login page loads correctly
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { exec } from 'child_process';

async function checkLoginPage() {
  console.log('Starting login page check...');
  
  let server;
  let success = false;
  
  try {
    // Start the Next.js server
    console.log('Starting Next.js server...');
    server = exec('cd /Users/alexeldeib/code/skeleton/app && npm run dev');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Fetch the login page
    console.log('Fetching login page...');
    const response = await fetch('http://localhost:3001/auth/login');
    const html = await response.text();
    
    // Parse HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Check for key elements
    const spinner = document.querySelector('.animate-spin');
    const h2 = document.querySelector('h2');
    const form = document.querySelector('form');
    const emailInput = document.querySelector('input[type="email"]') || document.querySelector('#email');
    
    console.log('Page analysis:');
    console.log('- Loading spinner visible:', !!spinner);
    console.log('- Login header found:', !!h2);
    console.log('- Form found:', !!form);
    console.log('- Email input found:', !!emailInput);
    
    if (h2 && form && emailInput) {
      console.log('✅ Login page is loading correctly!');
      success = true;
    } else {
      console.log('❌ Login page is not loading completely.');
    }
    
  } catch (error) {
    console.error('Error during check:', error);
  } finally {
    // Clean up server process
    if (server) {
      console.log('Shutting down server...');
      server.kill();
    }
    
    process.exit(success ? 0 : 1);
  }
}

// Timeout after 30 seconds
const timeout = setTimeout(() => {
  console.log('Check timed out after 30 seconds');
  process.exit(1);
}, 30000);

// Run the check
checkLoginPage().finally(() => clearTimeout(timeout));