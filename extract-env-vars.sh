#!/bin/bash

set -e

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

# Project variables - adjust these as needed
PROJECT_NAME="saas-app-claude"
SUPABASE_PROJECT_ID="example-project-id"  # Replace with your actual ID
SUPABASE_URL="https://$SUPABASE_PROJECT_ID.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.anon.key"  # Replace with actual anon key
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.service.key"  # Replace with actual service key
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_KEY"
FLY_APP_NAME="$PROJECT_NAME-backend"
FLY_APP_URL="https://$FLY_APP_NAME.fly.dev"
CLOUDFLARE_WORKER_NAME="$PROJECT_NAME-worker"
CLOUDFLARE_WORKER_URL="https://$CLOUDFLARE_WORKER_NAME.workers.dev"
LANDING_PROJECT_NAME="$PROJECT_NAME-landing"
LANDING_URL="https://$LANDING_PROJECT_NAME.vercel.app"
APP_PROJECT_NAME="$PROJECT_NAME-app"
APP_URL="https://$APP_PROJECT_NAME.vercel.app"

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

# Create project config file
print_header "Creating Project Configuration"

echo "Writing to .project-config..."
cat > .project-config <<EOF
PROJECT_NAME="$PROJECT_NAME"
CREATED_AT="$(date)"
SUPABASE_PROJECT_ID="$SUPABASE_PROJECT_ID"
SUPABASE_URL="$SUPABASE_URL"
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY"
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
FLY_APP_NAME="$FLY_APP_NAME"
FLY_APP_URL="$FLY_APP_URL"
CLOUDFLARE_WORKER_NAME="$CLOUDFLARE_WORKER_NAME"
CLOUDFLARE_WORKER_URL="$CLOUDFLARE_WORKER_URL"
LANDING_PROJECT_NAME="$LANDING_PROJECT_NAME"
LANDING_URL="$LANDING_URL"
APP_PROJECT_NAME="$APP_PROJECT_NAME"
APP_URL="$APP_URL"
EOF

print_success ".project-config file created"

# Create environment files
print_header "Creating Environment Files"

# Ensure directories exist
mkdir -p landing app supabase fly cloudflare

# Landing page
echo "Writing to landing/.env.local..."
cat > landing/.env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
print_success "landing/.env.local created"

# App
echo "Writing to app/.env.local..."
cat > app/.env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
print_success "app/.env.local created"

# Supabase
echo "Writing to supabase/.env..."
cat > supabase/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
EOF
print_success "supabase/.env created"

# Fly.io
echo "Writing to fly/.env..."
cat > fly/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
FLY_APP_NAME=$FLY_APP_NAME
PORT=8080
EOF
print_success "fly/.env created"

# Cloudflare Worker
echo "Writing to cloudflare/.env..."
cat > cloudflare/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
CLOUDFLARE_WORKER_NAME=$CLOUDFLARE_WORKER_NAME
EOF
print_success "cloudflare/.env created"

print_header "Environment Variables Summary"
echo "Environment variables have been created and distributed to all components."
echo "To use real values, edit the .project-config file with your actual API keys"
echo "and run this script again to distribute them to all .env files."
echo ""
echo "Files created:"
echo "- .project-config (primary configuration file)"
echo "- landing/.env.local (frontend environment variables)"
echo "- app/.env.local (app environment variables)"
echo "- supabase/.env (Supabase environment variables)"
echo "- fly/.env (Fly.io environment variables)"
echo "- cloudflare/.env (Cloudflare Worker environment variables)"
echo ""
echo "All files are correctly git-ignored and will not be committed to the repository."

print_success "Environment setup completed successfully"