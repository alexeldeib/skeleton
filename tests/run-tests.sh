#!/bin/bash
set -e

# Simple test runner for SaaS template

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
RESET="\033[0m"

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Create directories for test artifacts
mkdir -p test-artifacts/screenshots

# Start app servers in a simpler way
echo -e "${YELLOW}Starting app and landing page...${RESET}"

# Start the app server directly
cd app
npm run dev > /dev/null 2>&1 &
APP_PID=$!
cd ..

# Check if the app is running
MAX_RETRIES=15
RETRY_COUNT=0
echo -e "${YELLOW}Waiting for app to start...${RESET}"
while ! curl -s http://localhost:3001 > /dev/null && [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  sleep 2
  RETRY_COUNT=$((RETRY_COUNT+1))
  echo -n "."
done
echo ""

if ! curl -s http://localhost:3001 > /dev/null; then
  echo -e "${RED}Failed to start app. Please check for errors.${RESET}"
  kill $APP_PID 2>/dev/null
  exit 1
fi
echo -e "${GREEN}App running on http://localhost:3001${RESET}"

# Give the app a moment to fully initialize
sleep 2

# Run tests
echo -e "${GREEN}Running auth tests...${RESET}"
npx playwright test tests/auth.test.js

echo -e "${GREEN}Running API tests...${RESET}"
npx playwright test tests/api.test.js

# Stop the app server
if [[ -n "$APP_PID" ]]; then
  echo -e "${YELLOW}Stopping app...${RESET}"
  kill $APP_PID 2>/dev/null || true
fi

echo -e "${GREEN}All tests completed!${RESET}"