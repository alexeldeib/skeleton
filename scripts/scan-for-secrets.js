#!/usr/bin/env node

/**
 * Secret Scanner
 * 
 * This script scans the codebase for potential hardcoded secrets, API keys,
 * and other sensitive information that should not be committed to the repository.
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

// Patterns to search for potential secrets
const secretPatterns = [
  // JWT tokens (common format for API keys) - only actual values, not references
  { pattern: /\"eyJhbGciOiJ[A-Za-z0-9._-]+\"/g, name: 'JWT Token/API Key' },
  { pattern: /\'eyJhbGciOiJ[A-Za-z0-9._-]+\'/g, name: 'JWT Token/API Key' },

  // Direct hardcoded JWTs without quotes
  {
    pattern: /([^$])(eyJhbGciOiJ[A-Za-z0-9._-]{30,})/g,
    name: 'JWT Token/API Key',
    matchIndex: 2 // Use the second capturing group
  },

  // AWS-style keys
  { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key' },

  // Private keys
  { pattern: /-----BEGIN PRIVATE KEY-----/g, name: 'Private Key' },
  { pattern: /-----BEGIN RSA PRIVATE KEY-----/g, name: 'RSA Private Key' },
];

// Files and directories to ignore
const ignoredPaths = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.env',
  '.env.local',
  '.env.keys',
  '.project-config',
  'package-lock.json',
  '.supabase',
];

// Extensions to scan
const extensionsToScan = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.yml', '.yaml', 
  '.md', '.mdx', '.html', '.css', '.scss', '.sh', '.bash'
];

// Function to scan a file for secrets
function scanFile(filePath) {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];

    // Skip some files that might have legitimate patterns
    const fileName = path.basename(filePath);
    if (fileName === 'scan-for-secrets.js') {
      // Skip the patterns section in this file
      return [];
    }

    // Check for each pattern
    for (const { pattern, name, matchIndex = 0 } of secretPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const matchedText = match[matchIndex];

        // Skip if this is a variable reference in a bash script
        if (filePath.endsWith('.sh') &&
            (content.substring(Math.max(0, match.index - 20), match.index).includes('$') ||
             /\$[A-Za-z_]+/.test(content.substring(Math.max(0, match.index - 20), match.index + 20)))) {
          continue;
        }

        // Skip variable declarations in .env files
        if (matchedText.includes('$') || matchedText.includes('${')) {
          continue;
        }

        // Get a snippet of the content around the match for context
        const start = Math.max(0, match.index - 30);
        const end = Math.min(content.length, match.index + match[0].length + 30);
        const snippet = content.substring(start, match.index) +
                       colors.red + matchedText + colors.reset +
                       content.substring(match.index + matchedText.length, end);

        findings.push({
          type: name,
          match: matchedText,
          lineNumber: content.substring(0, match.index).split('\n').length,
          snippet,
        });
      }
    }

    return findings;
  } catch (error) {
    console.error(`Error scanning file ${filePath}: ${error.message}`);
    return [];
  }
}

// Function to scan a directory recursively
function scanDirectory(dir, results = {}) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    
    // Skip ignored paths
    if (ignoredPaths.some(ignore => itemPath.includes(ignore))) {
      continue;
    }
    
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Recursively scan subdirectory
      scanDirectory(itemPath, results);
    } else if (stats.isFile()) {
      // Only scan files with specified extensions
      const ext = path.extname(itemPath).toLowerCase();
      if (extensionsToScan.includes(ext)) {
        const findings = scanFile(itemPath);
        
        if (findings.length > 0) {
          results[itemPath] = findings;
        }
      }
    }
  }
  
  return results;
}

// Main function to run the scanner
function main() {
  const rootDir = path.resolve(__dirname, '..');
  console.log(`${colors.magenta}${colors.bright}======== Secret Scanner ========${colors.reset}`);
  console.log(`Scanning directory: ${rootDir}`);
  console.log(`Ignored paths: ${ignoredPaths.join(', ')}`);
  
  // Scan the codebase
  const results = scanDirectory(rootDir);
  
  // Report findings
  const totalFindings = Object.values(results).reduce((sum, findings) => sum + findings.length, 0);
  
  if (totalFindings > 0) {
    console.log(`\n${colors.red}${colors.bright}Found ${totalFindings} potential secrets in ${Object.keys(results).length} files:${colors.reset}\n`);
    
    // Display findings
    for (const [filePath, findings] of Object.entries(results)) {
      const relativePath = path.relative(rootDir, filePath);
      console.log(`${colors.yellow}${colors.bright}${relativePath}${colors.reset}`);
      
      for (const finding of findings) {
        console.log(`  Line ${finding.lineNumber}: ${colors.red}${finding.type}${colors.reset}`);
        console.log(`    Context: ...${finding.snippet}...`);
        console.log();
      }
    }
    
    // Recommendations
    console.log(`${colors.yellow}${colors.bright}Recommendations:${colors.reset}`);
    console.log(`1. Remove hardcoded secrets and use environment variables instead`);
    console.log(`2. Store sensitive values in .env.local or .env.keys files (which are gitignored)`);
    console.log(`3. For test data, use placeholder values like 'PLACEHOLDER_API_KEY'`);
    
    process.exit(1); // Exit with error code
  } else {
    console.log(`\n${colors.green}${colors.bright}✓ No potential secrets found!${colors.reset}`);
  }
}

// Run the scanner
main();