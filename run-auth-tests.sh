#!/bin/bash

# Auth Tests Runner Script
# ========================
# This script runs all authentication-related tests in sequence
# and provides a nice summary of the results.

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Make sure we're in the project root
cd "$(dirname "$0")"

# Create test artifacts directory
mkdir -p test-artifacts/screenshots/mock
mkdir -p test-artifacts/screenshots/error-cases
mkdir -p test-artifacts/screenshots/local
mkdir -p test-artifacts/screenshots/e2e

# Temp file for test results
RESULTS_FILE=$(mktemp)

echo -e "${BLUE}=== Running Authentication Tests ===${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Run tests with mock email server
echo -e "${YELLOW}Running Magic Link Authentication Tests (Mock)${NC}"
npx playwright test tests/magic-link-auth.spec.ts --reporter=line > $RESULTS_FILE 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Magic Link Authentication Tests Passed${NC}"
else
  echo -e "${RED}✗ Magic Link Authentication Tests Failed${NC}"
  cat $RESULTS_FILE | grep -A 5 "failed"
fi
echo ""

# Run error case tests
echo -e "${YELLOW}Running Authentication Error Cases Tests${NC}"
npx playwright test tests/auth-error-cases.spec.ts --reporter=line > $RESULTS_FILE 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Authentication Error Cases Tests Passed${NC}"
else
  echo -e "${RED}✗ Authentication Error Cases Tests Failed${NC}"
  cat $RESULTS_FILE | grep -A 5 "failed"
fi
echo ""

# Run the integration tests if supabase is running locally 
# (checks port 54321 for Supabase)
echo -e "${YELLOW}Checking for local Supabase instance...${NC}"
if nc -z localhost 54321 2>/dev/null; then
  echo -e "${GREEN}Supabase detected at localhost:54321${NC}"
  echo -e "${YELLOW}Running Authentication Integration Tests${NC}"
  npx playwright test tests/auth-integration.spec.ts --reporter=line > $RESULTS_FILE 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Authentication Integration Tests Passed${NC}"
  else
    echo -e "${RED}✗ Authentication Integration Tests Failed${NC}"
    cat $RESULTS_FILE | grep -A 5 "failed"
  fi
else
  echo -e "${YELLOW}Supabase not running locally - skipping integration tests${NC}"
  echo -e "${YELLOW}Start Supabase with: cd supabase && supabase start${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}=== Test Results Summary ===${NC}"
echo -e "${BLUE}=========================${NC}"
echo ""
echo -e "${YELLOW}Screenshots captured in:${NC}"
echo -e "  ${GREEN}test-artifacts/screenshots/mock/${NC}"
echo -e "  ${GREEN}test-artifacts/screenshots/error-cases/${NC}"
echo -e "  ${GREEN}test-artifacts/screenshots/local/${NC}"
echo ""

echo -e "${YELLOW}To view the full HTML report:${NC}"
echo -e "  ${GREEN}npx playwright show-report${NC}"
echo ""

# Clean up
rm $RESULTS_FILE

# Make the script executable
chmod +x run-auth-tests.sh