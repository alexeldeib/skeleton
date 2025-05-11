#!/bin/bash

set -e

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

# Project variables
PROJECT_ID="cuspmvmrvlawgywaocvd"
FUNCTIONS_DIR="/Users/alexeldeib/code/skeleton/supabase/supabase/functions"

# Function to print success message
print_success() {
  echo -e "${GREEN}✓ $1${RESET}"
}

# Function to print error message
print_error() {
  echo -e "${RED}✗ $1${RESET}"
}

# Function to print header
print_header() {
  echo -e "\n${BOLD}${BLUE}==== $1 ====${RESET}\n"
}

# Make a temporary directory for each function
print_header "Deploying Supabase Edge Functions"

# Create a temporary directory for function deployment
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Get all TypeScript files in the functions directory
for FUNCTION_FILE in "$FUNCTIONS_DIR"/*.ts; do
  if [ "$FUNCTION_FILE" == "$FUNCTIONS_DIR/index.ts" ]; then
    continue
  fi
  
  # Extract function name from file path
  FUNCTION_NAME=$(basename "${FUNCTION_FILE%.ts}")
  echo "Processing function: $FUNCTION_NAME"
  
  # Create temporary function directory
  mkdir -p "$TEMP_DIR/supabase/functions/$FUNCTION_NAME"
  
  # Copy the function file as index.ts
  cp "$FUNCTION_FILE" "$TEMP_DIR/supabase/functions/$FUNCTION_NAME/index.ts"
  
  # Deploy the function
  echo "Deploying function: $FUNCTION_NAME"
  (cd "$TEMP_DIR" && supabase functions deploy "$FUNCTION_NAME" --project-ref "$PROJECT_ID") || {
    print_error "Failed to deploy function: $FUNCTION_NAME"
    continue
  }
  
  print_success "Successfully deployed function: $FUNCTION_NAME"
done

# Clean up
rm -rf "$TEMP_DIR"
print_success "All functions processed"