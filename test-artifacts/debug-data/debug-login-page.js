// Debug the login page directly using fetch and dom parsing
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

async function debugLoginPage() {
  console.log('=== Starting Login Page Debug ===');
  
  // Check Supabase environment variables
  console.log('Supabase URL available:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Anon Key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    // Start the Next.js dev server in the background and give it time to start
    console.log('Starting Next.js server...');
    const server = exec('cd /Users/alexeldeib/code/skeleton/app && npm run dev');
    
    // Give the server time to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Fetch the login page
    console.log('Fetching login page...');
    const response = await fetch('http://localhost:3001/auth/login');
    const html = await response.text();
    
    // Log basic info
    console.log('Response status:', response.status);
    console.log('Response size:', html.length, 'bytes');
    
    // Parse the HTML
    console.log('Parsing HTML...');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Look for key elements
    console.log('\nPage Analysis:');
    const spinner = document.querySelector('.animate-spin');
    if (spinner) {
      console.log('- Loading spinner found, page is in loading state');
    } else {
      console.log('- No loading spinner found');
    }
    
    const h2s = document.querySelectorAll('h2');
    console.log(`- Found ${h2s.length} h2 elements`);
    h2s.forEach((h2, i) => {
      console.log(`  h2 #${i+1}: "${h2.textContent}"`);
    });
    
    const emailInput = document.querySelector('input[type="email"]') || document.querySelector('#email');
    console.log('- Email input found:', !!emailInput);
    if (emailInput) {
      console.log(`  id: "${emailInput.id}", type: "${emailInput.type}"`);
    }
    
    const forms = document.querySelectorAll('form');
    console.log(`- Found ${forms.length} form elements`);
    
    const authPanel = document.querySelector('form') ? true : false;
    console.log('- Auth panel form found:', authPanel);
    
    // Count total elements
    const allElements = document.querySelectorAll('*');
    console.log(`- Total elements in the DOM: ${allElements.length}`);
    
    // Check for scripts
    const scripts = document.querySelectorAll('script');
    console.log(`- Found ${scripts.length} script elements`);
    
    // Check for potential error messages
    const errorElements = document.querySelectorAll('.text-red-800, .text-red-900, .bg-red-100, .bg-red-200');
    console.log(`- Error message elements found: ${errorElements.length}`);
    errorElements.forEach((el, i) => {
      console.log(`  Error #${i+1}: "${el.textContent}"`);
    });
    
    // Save the HTML for manual inspection
    fs.writeFileSync('full-login-page.html', html);
    console.log('\nFull HTML saved to full-login-page.html');
    
    // Kill the server after 2 seconds
    setTimeout(() => {
      console.log('Shutting down server...');
      server.kill();
      process.exit(0);
    }, 2000);
    
  } catch (error) {
    console.error('Error during debugging:', error);
    process.exit(1);
  }
}

debugLoginPage().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});