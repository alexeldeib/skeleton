// Test if the login page is working with curl
const { exec } = require('child_process');
const fs = require('fs');

// Run a curl command to get the login page
exec('curl -s http://localhost:3001/auth/login', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  
  // Save the output to a file
  fs.writeFileSync('login-page-curl.html', stdout);
  
  // Check if it has the form
  console.log(`Page content length: ${stdout.length}`);
  console.log(`Contains form: ${stdout.includes('<form')}`);
  console.log(`Contains input: ${stdout.includes('<input')}`);
  console.log(`Contains email: ${stdout.includes('email')}`);
  console.log(`Contains Sign In: ${stdout.includes('Sign In')}`);
  
  // Check for the error message
  console.log(`Contains error message: ${stdout.includes('required but not set')}`);
});