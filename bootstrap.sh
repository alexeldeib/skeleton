#!/bin/bash

set -e

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

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

# Function to prompt for input
prompt_input() {
  local prompt="$1"
  local var_name="$2"
  local default="$3"
  local is_secret="$4"
  
  if [ -n "$default" ]; then
    prompt="$prompt (default: $default)"
  fi
  
  if [ "$is_secret" = "true" ]; then
    read -sp "$prompt: " input
    echo ""
  else
    read -p "$prompt: " input
  fi
  
  if [ -z "$input" ] && [ -n "$default" ]; then
    export "$var_name"="$default"
  else
    export "$var_name"="$input"
  fi
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
  print_header "Checking Prerequisites"
  
  local missing_prerequisites=false
  
  # Check if Node.js is installed
  if command_exists node; then
    print_success "Node.js is installed ($(node --version))"
  else
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    missing_prerequisites=true
  fi
  
  # Check if npm is installed
  if command_exists npm; then
    print_success "npm is installed ($(npm --version))"
  else
    print_error "npm is not installed. Please install npm."
    missing_prerequisites=true
  fi
  
  # Check if Git is installed
  if command_exists git; then
    print_success "Git is installed ($(git --version))"
  else
    print_error "Git is not installed. Please install Git."
    missing_prerequisites=true
  fi
  
  # Optional: Check for Supabase CLI
  if command_exists supabase; then
    print_success "Supabase CLI is installed ($(supabase --version))"
  else
    print_warning "Supabase CLI is not installed. It's recommended for local development."
    print_warning "Install with: npm install -g supabase"
  fi
  
  # Optional: Check for Vercel CLI
  if command_exists vercel; then
    print_success "Vercel CLI is installed"
  else
    print_warning "Vercel CLI is not installed. It's recommended for deployment."
    print_warning "Install with: npm install -g vercel"
  fi
  
  if [ "$missing_prerequisites" = true ]; then
    print_error "Please install the missing prerequisites and run this script again."
    exit 1
  fi
}

# Function to set up environment variables
setup_env_variables() {
  print_header "Setting Up Environment Variables"
  
  # Create .env files if they don't exist
  create_env_file() {
    local env_file="$1"
    if [ ! -f "$env_file" ]; then
      touch "$env_file"
      print_success "Created $env_file"
    else
      print_success "$env_file already exists"
    fi
  }
  
  # Create .env files
  create_env_file "landing/.env.local"
  create_env_file "app/.env.local"
  create_env_file "supabase/.env"
  create_env_file "fly/.env"
  create_env_file "codesandbox/.env"
  create_env_file "cloudflare/.env"
  
  # Common variables
  echo "Setting up Supabase credentials..."
  
  # Check if variables are already set in the environment
  if [ -z "$SUPABASE_URL" ]; then
    prompt_input "Enter your Supabase URL" SUPABASE_URL ""
  else
    print_success "SUPABASE_URL is already set"
  fi
  
  if [ -z "$SUPABASE_ANON_KEY" ]; then
    prompt_input "Enter your Supabase Anon Key" SUPABASE_ANON_KEY "" true
  else
    print_success "SUPABASE_ANON_KEY is already set"
  fi
  
  if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    prompt_input "Enter your Supabase Service Key" SUPABASE_SERVICE_KEY "" true
  else
    print_success "SUPABASE_SERVICE_KEY is already set"
  fi
  
  # Update .env files with Supabase variables
  update_env_file() {
    local env_file="$1"
    local prefix="$2"
    
    # Check if the variable exists in the file before adding
    if ! grep -q "${prefix}SUPABASE_URL" "$env_file"; then
      echo "${prefix}SUPABASE_URL=$SUPABASE_URL" >> "$env_file"
    fi
    
    if ! grep -q "${prefix}SUPABASE_ANON_KEY" "$env_file"; then
      echo "${prefix}SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> "$env_file"
    fi
    
    if [ -n "$3" ] && ! grep -q "${prefix}SUPABASE_SERVICE_KEY" "$env_file"; then
      echo "${prefix}SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY" >> "$env_file"
    fi
  }
  
  # Update .env files
  update_env_file "landing/.env.local" "NEXT_PUBLIC_"
  update_env_file "app/.env.local" "NEXT_PUBLIC_"
  update_env_file "supabase/.env" ""
  update_env_file "fly/.env" "" true
  update_env_file "codesandbox/.env" "" true
  update_env_file "cloudflare/.env" "" true
  
  print_success "Environment variables set up successfully"
}

# Function to install dependencies
install_dependencies() {
  print_header "Installing Dependencies"
  
  # Install root dependencies
  echo "Installing root dependencies..."
  npm install
  print_success "Root dependencies installed"
  
  # Install dependencies for each package
  for pkg in landing app supabase fly codesandbox cloudflare; do
    echo "Installing dependencies for $pkg..."
    (cd $pkg && npm install)
    print_success "$pkg dependencies installed"
  done
}

# Function to set up local development
setup_local_dev() {
  print_header "Setting Up Local Development"
  
  # Create local Supabase instance if requested
  if command_exists supabase; then
    echo -e "\nWould you like to set up a local Supabase instance? (y/n)"
    read -r setup_local_supabase
    
    if [[ $setup_local_supabase =~ ^[Yy]$ ]]; then
      (cd supabase && supabase start)
      
      # Get local Supabase URL and keys
      local_supabase_url=$(cd supabase && supabase status | grep "API URL" | awk '{print $3}')
      local_supabase_anon_key=$(cd supabase && supabase status | grep "anon key" | awk '{print $3}')
      local_supabase_service_key=$(cd supabase && supabase status | grep "service_role key" | awk '{print $3}')
      
      if [ -n "$local_supabase_url" ] && [ -n "$local_supabase_anon_key" ] && [ -n "$local_supabase_service_key" ]; then
        # Create a .env.local.dev file for local development
        echo "NEXT_PUBLIC_SUPABASE_URL=$local_supabase_url" > landing/.env.local.dev
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$local_supabase_anon_key" >> landing/.env.local.dev
        
        echo "NEXT_PUBLIC_SUPABASE_URL=$local_supabase_url" > app/.env.local.dev
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$local_supabase_anon_key" >> app/.env.local.dev
        
        print_success "Local Supabase instance set up successfully"
        print_success "Local development environment variables saved to .env.local.dev files"
      else
        print_error "Failed to get local Supabase credentials"
      fi
    fi
  fi
}

# Function to set up deployment configuration
setup_deployment() {
  print_header "Setting Up Deployment Configuration"
  
  echo "Do you want to set up Vercel deployment for landing page and app? (y/n)"
  read -r setup_vercel
  
  if [[ $setup_vercel =~ ^[Yy]$ ]]; then
    if command_exists vercel; then
      # Link projects to Vercel
      echo "Setting up Vercel for landing page..."
      (cd landing && vercel link)
      
      echo "Setting up Vercel for app..."
      (cd app && vercel link)
      
      # Pull environment variables
      echo "Pulling environment variables for landing page..."
      (cd landing && vercel env pull)
      
      echo "Pulling environment variables for app..."
      (cd app && vercel env pull)
      
      print_success "Vercel deployment configured successfully"
    else
      print_error "Vercel CLI is not installed. Please install it with 'npm install -g vercel' and run the setup again."
    fi
  fi
  
  echo "Do you want to set up GitHub Actions workflows? (y/n)"
  read -r setup_github
  
  if [[ $setup_github =~ ^[Yy]$ ]]; then
    # Make sure .github/workflows directory exists
    mkdir -p .github/workflows
    
    # Copy workflow files if they don't exist
    for workflow in deploy-frontend.yml deploy-supabase.yml deploy-fly.yml deploy-cloudflare.yml deploy-codesandbox.yml; do
      if [ ! -f ".github/workflows/$workflow" ]; then
        cp -n ".github/workflows/$workflow" ".github/workflows/$workflow" 2>/dev/null || true
      fi
    done
    
    print_success "GitHub Actions workflows set up successfully"
    print_warning "You'll need to add the following secrets to your GitHub repository:"
    echo "- VERCEL_TOKEN"
    echo "- VERCEL_ORG_ID"
    echo "- VERCEL_LANDING_PROJECT_ID"
    echo "- VERCEL_APP_PROJECT_ID"
    echo "- SUPABASE_ACCESS_TOKEN"
    echo "- SUPABASE_PROJECT_ID"
    echo "- FLY_API_TOKEN"
    echo "- CLOUDFLARE_API_TOKEN"
    echo "- CLOUDFLARE_ACCOUNT_ID"
    echo "- DOCKERHUB_USERNAME"
    echo "- DOCKERHUB_TOKEN"
  fi
}

# Main function
main() {
  echo -e "${BOLD}${BLUE}🚀 SaaS Application Bootstrap Script 🚀${RESET}"
  echo -e "This script will set up your SaaS application for development and deployment.\n"
  
  check_prerequisites
  setup_env_variables
  install_dependencies
  setup_local_dev
  setup_deployment
  
  print_header "Bootstrap Complete"
  echo -e "Your SaaS application has been bootstrapped successfully! 🎉"
  echo -e "\nNext steps:"
  echo -e "1. Start the development server with ${BOLD}npm run dev${RESET}"
  echo -e "2. Configure your Supabase project further if needed"
  echo -e "3. Deploy your application using the configured deployment methods"
  echo -e "\nHappy coding! 🚀"
}

# Run the main function
main