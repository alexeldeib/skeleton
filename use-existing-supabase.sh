#!/bin/bash

set -e

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

# Project name
PROJECT_NAME="saas-skeleton"

# Function to print section header
print_header() {
  echo -e "\n${BOLD}${BLUE}==== $1 ====${RESET}\n"
}

# Function to print success message
print_success() {
  echo -e "${GREEN}✓ $1${RESET}"
}

# Function to print warning message
print_warning() {
  echo -e "${YELLOW}⚠ $1${RESET}"
}

# Function to print error message
print_error() {
  echo -e "${RED}✗ $1${RESET}"
}

# Use existing Supabase project
use_existing_supabase() {
  print_header "Using Existing Supabase Project"
  
  # List available projects
  echo "Available Supabase projects:"
  supabase projects list
  
  # Get project ID from parameter or prompt
  if [ -n "$1" ]; then
    SUPABASE_PROJECT_ID="$1"
    echo "Using provided project ID: $SUPABASE_PROJECT_ID"
  else
    read -p "Enter the Supabase project ID to use: " SUPABASE_PROJECT_ID
  fi
  
  # Get the project URL
  SUPABASE_URL="https://$SUPABASE_PROJECT_ID.supabase.co"
  
  # Get API keys
  echo "Fetching Supabase API keys for project $SUPABASE_PROJECT_ID..."
  SUPABASE_API_KEYS=$(supabase projects api-keys --project-ref "$SUPABASE_PROJECT_ID")
  
  echo "$SUPABASE_API_KEYS"
  
  # Extract anon key and service key using more direct methods
  # Store the output in a temp file to work with line by line
  echo "$SUPABASE_API_KEYS" > /tmp/supabase_keys.txt

  # Get the anon key (line after the anon label)
  ANON_LINE=$(grep -A 1 "anon" /tmp/supabase_keys.txt | tail -1)
  if [[ $ANON_LINE =~ ([A-Za-z0-9._=-]+) ]]; then
    SUPABASE_ANON_KEY="${BASH_REMATCH[1]}"
    print_success "Extracted anon key: ${SUPABASE_ANON_KEY:0:10}...${SUPABASE_ANON_KEY: -5}"
  else
    print_error "Failed to extract anon key from output"
    SUPABASE_ANON_KEY="MISSING_KEY_PLEASE_REPLACE"
  fi

  # Get the service role key (line after the service_role label)
  SERVICE_LINE=$(grep -A 1 "service_role" /tmp/supabase_keys.txt | tail -1)
  if [[ $SERVICE_LINE =~ ([A-Za-z0-9._=-]+) ]]; then
    SUPABASE_SERVICE_ROLE_KEY="${BASH_REMATCH[1]}"
    print_success "Extracted service role key: ${SUPABASE_SERVICE_ROLE_KEY:0:10}...${SUPABASE_SERVICE_ROLE_KEY: -5}"
  else
    print_error "Failed to extract service role key from output"
    SUPABASE_SERVICE_ROLE_KEY="MISSING_KEY_PLEASE_REPLACE"
  fi

  # Clean up
  rm /tmp/supabase_keys.txt
  
  # Save to project config
  echo "Saving project details to .project-config..."
  cat > .project-config <<EOF
PROJECT_NAME="$PROJECT_NAME"
CREATED_AT="$(date)"
SUPABASE_PROJECT_ID="$SUPABASE_PROJECT_ID"
SUPABASE_URL="$SUPABASE_URL"
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
EOF
  
  print_success "Supabase project config saved to .project-config"
  
  # Create component .env files
  echo "Creating component .env files..."
  
  # Ensure directories exist
  mkdir -p landing app supabase fly cloudflare
  
  # Landing page
  cat > landing/.env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
  
  # App
  cat > app/.env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
  
  # Supabase
  cat > supabase/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
EOF
  
  # Fly.io
  cat > fly/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
PORT=8080
EOF
  
  # Cloudflare Worker
  cat > cloudflare/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
  
  print_success "Created all component .env files"
  
  # Create .env file in root for convenience
  cat > .env <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
EOF

  print_success "Created root .env file"
  
  # Summary
  print_header "Supabase Project Summary"
  echo "Project Name: $PROJECT_NAME"
  echo "Project ID: $SUPABASE_PROJECT_ID"
  echo "URL: $SUPABASE_URL"
  echo "Dashboard: https://app.supabase.com/project/$SUPABASE_PROJECT_ID"
  echo ""
  echo "API Keys:"
  echo "Anon Key: ${SUPABASE_ANON_KEY:0:10}...${SUPABASE_ANON_KEY: -5} (truncated for security)"
  echo "Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY:0:10}...${SUPABASE_SERVICE_ROLE_KEY: -5} (truncated for security)"
  echo ""
  echo "Configuration Files:"
  echo "- .project-config (contains all project details)"
  echo "- .env (root environment file)"
  echo "- landing/.env.local"
  echo "- app/.env.local"
  echo "- supabase/.env"
  echo "- fly/.env"
  echo "- cloudflare/.env"
}

# Main function
main() {
  use_existing_supabase "$1"
}

# Run the main function
main "$1"