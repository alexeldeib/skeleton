#!/bin/bash

# Cleanup script for SaaS template
# Removes redundant and unnecessary files

set -e

# Text colors
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${YELLOW}Cleaning up SaaS template...${RESET}"

# Remove redundant bootstrap scripts
if [[ -f "bootstrap.sh" ]]; then
  rm bootstrap.sh
  echo -e "${GREEN}Removed bootstrap.sh (replaced by setup.sh)${RESET}"
fi

if [[ -f "bootstrap-dev.sh" ]]; then
  rm bootstrap-dev.sh
  echo -e "${GREEN}Removed bootstrap-dev.sh (replaced by setup.sh)${RESET}"
fi

if [[ -f "bootstrap-production.sh" ]]; then
  rm bootstrap-production.sh
  echo -e "${GREEN}Removed bootstrap-production.sh (replaced by setup.sh)${RESET}"
fi

# Remove unused backend directories
if [[ -d "cloudflare" ]]; then
  rm -rf cloudflare
  echo -e "${GREEN}Removed cloudflare directory (consolidated to backend)${RESET}"
fi

if [[ -d "fly" ]]; then
  rm -rf fly
  echo -e "${GREEN}Removed fly directory (consolidated to backend)${RESET}"
fi

if [[ -d "codesandbox" ]]; then
  rm -rf codesandbox
  echo -e "${GREEN}Removed codesandbox directory (unused)${RESET}"
fi

# Remove redundant test files
find tests/ -name "*.spec.ts" -delete
echo -e "${GREEN}Removed old test files (replaced by simplified tests)${RESET}"

# Remove redundant scripts
if [[ -f "extract-env-vars.sh" ]]; then
  rm extract-env-vars.sh
  echo -e "${GREEN}Removed extract-env-vars.sh (incorporated into setup.sh)${RESET}"
fi

if [[ -f "extract-keys.sh" ]]; then
  rm extract-keys.sh
  echo -e "${GREEN}Removed extract-keys.sh (incorporated into setup.sh)${RESET}"
fi

if [[ -f "create-supabase.sh" ]]; then
  rm create-supabase.sh
  echo -e "${GREEN}Removed create-supabase.sh (incorporated into setup.sh)${RESET}"
fi

if [[ -f "use-existing-supabase.sh" ]]; then
  rm use-existing-supabase.sh
  echo -e "${GREEN}Removed use-existing-supabase.sh (incorporated into setup.sh)${RESET}"
fi

if [[ -f "deploy-functions.sh" ]]; then
  rm deploy-functions.sh
  echo -e "${GREEN}Removed deploy-functions.sh (incorporated into setup.sh)${RESET}"
fi

# Remove redundant documentation
if [[ -f "PROMPT.md" ]]; then
  rm PROMPT.md
  echo -e "${GREEN}Removed PROMPT.md (unnecessary)${RESET}"
fi

if [[ -f "CONTRIBUTING.md" ]]; then
  mv CONTRIBUTING.md docs/contributing.md
  echo -e "${GREEN}Moved CONTRIBUTING.md to docs/contributing.md${RESET}"
fi

# Rename the new README to replace the old one
if [[ -f "README.md.new" ]]; then
  mv README.md.new README.md
  echo -e "${GREEN}Replaced README.md with streamlined version${RESET}"
fi

# Create docs directory if it doesn't exist
mkdir -p docs

# Make setup script executable
chmod +x setup.sh
echo -e "${GREEN}Made setup.sh executable${RESET}"

echo -e "${YELLOW}Cleanup complete!${RESET}"