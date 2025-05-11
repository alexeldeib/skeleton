#!/bin/bash

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

# Check if the app is running
if ! curl -s http://localhost:3001 > /dev/null; then
  echo -e "${YELLOW}App is not running. Starting development server...${RESET}"
  npm run dev &
  APP_PID=$!
  
  echo -e "${YELLOW}Waiting for app to start...${RESET}"
  for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null; then
      break
    fi
    sleep 1
    echo -n "."
  done
  echo ""
  
  if ! curl -s http://localhost:3001 > /dev/null; then
    echo -e "${RED}Failed to start app. Please check for errors.${RESET}"
    kill $APP_PID 2>/dev/null
    exit 1
  fi
fi

# Run tests
echo -e "${GREEN}Running auth tests...${RESET}"
npx playwright test tests/auth.test.js

echo -e "${GREEN}Running API tests...${RESET}"
npx playwright test tests/api.test.js

# If we started the app, stop it
if [[ -n "$APP_PID" ]]; then
  echo -e "${YELLOW}Stopping app...${RESET}"
  kill $APP_PID 2>/dev/null
fi

echo -e "${GREEN}All tests completed!${RESET}"