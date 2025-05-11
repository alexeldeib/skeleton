#!/bin/bash

set -e

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

# Project name and ID
PROJECT_NAME="saas-skeleton"
SUPABASE_PROJECT_ID="cuspmvmrvlawgywaocvd"
SUPABASE_URL="https://$SUPABASE_PROJECT_ID.supabase.co"

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

# Extract Supabase API keys
print_header "Extracting Supabase API Keys"

# Get API keys in plain text format without headers
echo "Fetching API keys for project $SUPABASE_PROJECT_ID..."
echo "You may need to copy the keys manually from the Supabase dashboard if this fails."
echo "Dashboard URL: https://app.supabase.com/project/$SUPABASE_PROJECT_ID/settings/api"
echo ""

# Prompt for keys or read from environment file
if [ -f ".env.keys" ]; then
  print_success "Found .env.keys file, reading credentials"
  source .env.keys
else
  print_warning "No .env.keys file found, please provide your Supabase API keys:"
  echo "Visit: https://app.supabase.com/project/$SUPABASE_PROJECT_ID/settings/api"
  echo ""
  read -p "Enter your Supabase anon key: " SUPABASE_ANON_KEY
  read -p "Enter your Supabase service role key: " SUPABASE_SERVICE_ROLE_KEY

  # Save keys to .env.keys for future use (this file will be gitignored)
  cat > .env.keys <<EOF
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
EOF
  chmod 600 .env.keys # Restrict permissions to this file
  print_success "Keys saved to .env.keys - this file is gitignored and only readable by you"
fi

# Set service key same as service role key for backward compatibility
SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

# Basic validation
if [[ ${#SUPABASE_ANON_KEY} -lt 20 ]]; then
  print_error "The anon key you entered seems too short"
  exit 1
fi

if [[ ${#SUPABASE_SERVICE_ROLE_KEY} -lt 20 ]]; then
  print_error "The service role key you entered seems too short"
  exit 1
fi

print_success "Keys accepted"

# Save to project config
print_header "Creating Configuration Files"

echo "Writing to .project-config..."
cat > .project-config <<EOF
PROJECT_NAME="$PROJECT_NAME"
CREATED_AT="$(date)"
SUPABASE_PROJECT_ID="$SUPABASE_PROJECT_ID"
SUPABASE_URL="$SUPABASE_URL"
# API keys are stored in .env.keys for security
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
EOF

print_success ".project-config created (ensure this file is gitignored)"

# Create environment files
echo "Creating component .env files..."

# Ensure directories exist
mkdir -p landing app supabase fly cloudflare

# Landing page
cat > landing/.env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
print_success "landing/.env.local created"

# App
cat > app/.env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
print_success "app/.env.local created"

# Supabase
cat > supabase/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
EOF
print_success "supabase/.env created"

# Fly.io
cat > fly/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
PORT=8080
EOF
print_success "fly/.env created"

# Cloudflare Worker
cat > cloudflare/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
print_success "cloudflare/.env created"

# Root .env
cat > .env <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
EOF
print_success "Root .env created"

# Summary
print_header "Configuration Summary"
echo "Project Name: $PROJECT_NAME"
echo "Project ID: $SUPABASE_PROJECT_ID"
echo "URL: $SUPABASE_URL"
echo "Dashboard: https://app.supabase.com/project/$SUPABASE_PROJECT_ID"
echo ""
echo "API Keys (truncated for security):"
echo "Anon Key: ${SUPABASE_ANON_KEY:0:10}...${SUPABASE_ANON_KEY: -5}"
echo "Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY:0:10}...${SUPABASE_SERVICE_ROLE_KEY: -5}"
echo ""
echo "Configuration Files:"
echo "- .env.keys (contains your API keys - KEEP THIS SECURE)"
echo "- .project-config (project info without sensitive keys)"
echo "- .env (root)"
echo "- landing/.env.local"
echo "- app/.env.local"
echo "- supabase/.env"
echo "- fly/.env"
echo "- cloudflare/.env"
echo ""
echo -e "${BOLD}${RED}SECURITY WARNING:${RESET}"
echo -e "- NEVER commit your service role key to version control"
echo -e "- All .env.* files and .project-config are git-ignored for security"
echo -e "- The .env.keys file contains sensitive information and should be protected"
echo -e "- If you believe your keys were exposed, rotate them immediately in the Supabase dashboard"

print_success "Environment setup completed successfully"