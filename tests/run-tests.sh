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

# Start app servers if not already running
echo -e "${YELLOW}Checking for app server...${RESET}"

# Check if app is already running
if curl -s http://localhost:3001 > /dev/null; then
  echo -e "${GREEN}App already running on http://localhost:3001${RESET}"
  APP_PID=""
else
  echo -e "${YELLOW}Starting app server...${RESET}"
  # Start the app server directly
  cd app
  npm run dev > /dev/null 2>&1 &
  APP_PID=$!
  cd ..
fi

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

# Stop the app server only if we started it
if [[ -n "$APP_PID" ]]; then
  echo -e "${YELLOW}Stopping app server we started...${RESET}"
  kill $APP_PID 2>/dev/null || true
else
  echo -e "${YELLOW}Leaving existing app server running...${RESET}"
fi

echo -e "${GREEN}All tests completed!${RESET}"