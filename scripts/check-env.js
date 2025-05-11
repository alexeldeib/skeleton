#!/usr/bin/env node

/**
 * Environment Variable Validator
 * 
 * This script checks all environment variables required by the application
 * across different environments and components, ensuring they are properly set.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

// Define required environment variables for each component
const requiredVars = {
  app: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  landing: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  supabase: [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_PROJECT_ID',
  ],
  fly: [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PORT',
  ],
  cloudflare: [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ],
};

// Check if environment variables are set from .env files
function checkEnvFile(envFilePath, component) {
  console.log(`\n${colors.blue}${colors.bright}Checking ${component} environment variables in ${envFilePath}${colors.reset}`);
  
  if (!fs.existsSync(envFilePath)) {
    console.log(`${colors.yellow}⚠️ File does not exist: ${envFilePath}${colors.reset}`);
    return false;
  }

  const envContent = fs.readFileSync(envFilePath, 'utf8');
  const envVars = {};
  
  // Parse .env file content
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
      envVars[key] = value;
    }
  });
  
  // Check required variables
  let allValid = true;
  requiredVars[component].forEach(varName => {
    const value = envVars[varName];
    if (!value) {
      console.log(`${colors.red}✗ Missing: ${varName}${colors.reset}`);
      allValid = false;
    } else if (value.startsWith('PLACEHOLDER') || value === 'undefined') {
      console.log(`${colors.yellow}⚠️ Placeholder value: ${varName}=${value}${colors.reset}`);
      allValid = false;
    } else {
      // For security, don't log the full value of sensitive keys
      const isSensitive = varName.includes('KEY');
      const displayValue = isSensitive 
        ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
        : value;
      console.log(`${colors.green}✓ ${varName}=${displayValue}${colors.reset}`);
    }
  });
  
  return allValid;
}

// Main function to check all components
function checkAllEnvironments() {
  const rootDir = path.resolve(__dirname, '..');
  let allValid = true;
  
  console.log(`${colors.magenta}${colors.bright}======== Environment Variable Validator ========${colors.reset}`);
  console.log(`Running from: ${rootDir}`);
  
  // Check each component
  for (const component of Object.keys(requiredVars)) {
    const envFilePath = path.join(rootDir, component, '.env.local');
    const fallbackPath = path.join(rootDir, component, '.env');
    
    // Check .env.local first, then fall back to .env
    const localValid = checkEnvFile(envFilePath, component);
    if (!localValid) {
      console.log(`${colors.yellow}Falling back to ${fallbackPath}${colors.reset}`);
      const fallbackValid = checkEnvFile(fallbackPath, component);
      if (!fallbackValid) {
        allValid = false;
      }
    }
  }
  
  // Check for .env.keys file
  const keysFilePath = path.join(rootDir, '.env.keys');
  console.log(`\n${colors.blue}${colors.bright}Checking sensitive keys in ${keysFilePath}${colors.reset}`);
  if (fs.existsSync(keysFilePath)) {
    console.log(`${colors.green}✓ .env.keys file exists${colors.reset}`);
    
    // Check file permissions (Unix only)
    try {
      const stats = fs.statSync(keysFilePath);
      const octalPermissions = (stats.mode & 0o777).toString(8);
      if (octalPermissions === '600') {
        console.log(`${colors.green}✓ File permissions are secure (600)${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ File permissions should be 600, but got ${octalPermissions}${colors.reset}`);
        console.log(`${colors.yellow}Run: chmod 600 ${keysFilePath}${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}✗ Error checking file permissions: ${error.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ .env.keys file missing - run extract-keys.sh to generate${colors.reset}`);
    allValid = false;
  }
  
  // Final summary
  console.log(`\n${colors.magenta}${colors.bright}================ Summary =================${colors.reset}`);
  if (allValid) {
    console.log(`${colors.green}${colors.bright}✓ All environment variables are properly configured!${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}✗ Some environment variables are missing or have placeholder values.${colors.reset}`);
    console.log(`${colors.yellow}Run the following commands to fix:${colors.reset}`);
    console.log(`  1. ./extract-keys.sh - to set up API keys`);
    console.log(`  2. chmod 600 .env.keys - to secure the keys file`);
  }
}

// Run the checks
checkAllEnvironments();