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
PROJECT_NAME="saas-claude-$(date +%Y%m%d)"

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

# Create Supabase project
create_supabase_project() {
  print_header "Creating Supabase Project"
  
  # Check if org ID was passed as parameter
  if [ -n "$1" ]; then
    SUPABASE_ORG_ID="$1"
    echo "Using provided organization ID: $SUPABASE_ORG_ID"
  else
    # List organizations to get org ID
    echo "Available Supabase organizations:"
    supabase orgs list

    # Prompt for organization ID
    read -p "Enter your Supabase organization ID: " SUPABASE_ORG_ID
  fi
  
  # Generate a random password for the database
  DB_PASSWORD=$(openssl rand -base64 16)
  
  # Create the project
  echo "Creating Supabase project: $PROJECT_NAME"
  echo "Using organization: $SUPABASE_ORG_ID"
  echo "Using region: us-east-1"
  echo "Using auto-generated database password"
  
  SUPABASE_OUTPUT=$(supabase projects create "$PROJECT_NAME" \
    --org-id "$SUPABASE_ORG_ID" \
    --db-password "$DB_PASSWORD" \
    --region "us-east-1") || { 
      print_error "Failed to create Supabase project"
      echo "$SUPABASE_OUTPUT"
      exit 1
    }
  
  echo "$SUPABASE_OUTPUT"
  
  # Extract project ID using regex
  if [[ $SUPABASE_OUTPUT =~ Created\ project:\ ([a-zA-Z0-9-]+) ]]; then
    SUPABASE_PROJECT_ID="${BASH_REMATCH[1]}"
    print_success "Supabase project created with ID: $SUPABASE_PROJECT_ID"
  else
    print_error "Failed to extract project ID from output"
    echo "Output: $SUPABASE_OUTPUT"
    exit 1
  fi
  
  # Get the project URL
  SUPABASE_URL="https://$SUPABASE_PROJECT_ID.supabase.co"
  
  # Get API keys
  echo "Fetching Supabase API keys..."
  SUPABASE_API_KEYS=$(supabase projects api-keys --project-ref "$SUPABASE_PROJECT_ID")
  
  echo "$SUPABASE_API_KEYS"
  
  # Extract anon key and service key from output using regex
  if [[ $SUPABASE_API_KEYS =~ anon[[:space:]]+public[[:space:]]+([a-zA-Z0-9._=-]+) ]]; then
    SUPABASE_ANON_KEY="${BASH_REMATCH[1]}"
    print_success "Extracted anon key: ${SUPABASE_ANON_KEY:0:10}...${SUPABASE_ANON_KEY: -5}"
  else
    print_error "Failed to extract anon key from output"
    SUPABASE_ANON_KEY="MISSING_KEY_PLEASE_REPLACE"
  fi
  
  if [[ $SUPABASE_API_KEYS =~ service_role[[:space:]]+secret[[:space:]]+([a-zA-Z0-9._=-]+) ]]; then
    SUPABASE_SERVICE_ROLE_KEY="${BASH_REMATCH[1]}"
    print_success "Extracted service role key: ${SUPABASE_SERVICE_ROLE_KEY:0:10}...${SUPABASE_SERVICE_ROLE_KEY: -5}"
  else
    print_error "Failed to extract service role key from output"
    SUPABASE_SERVICE_ROLE_KEY="MISSING_KEY_PLEASE_REPLACE"
  fi
  
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
SUPABASE_DB_PASSWORD="$DB_PASSWORD"
SUPABASE_ORG_ID="$SUPABASE_ORG_ID"
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
SUPABASE_DB_PASSWORD=$DB_PASSWORD
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
  echo "Database Password: ${DB_PASSWORD} (save this somewhere secure)"
  echo ""
  echo "Configuration Files:"
  echo "- .project-config (contains all project details)"
  echo "- landing/.env.local"
  echo "- app/.env.local"
  echo "- supabase/.env"
  echo "- fly/.env"
  echo "- cloudflare/.env"
}

# Main function
main() {
  create_supabase_project "$1"
}

# Run the main function
main "$1"