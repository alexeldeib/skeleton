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
  
  # Optional: Check for Docker
  if command_exists docker; then
    # Check if Docker is running
    if docker info >/dev/null 2>&1; then
      print_success "Docker is installed and running"
    else
      print_warning "Docker is installed but not running. Start Docker to enable local Supabase development."
    fi
  else
    print_warning "Docker is not installed. It's required for local Supabase development."
    print_warning "Install from: https://docs.docker.com/get-docker/"
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
  create_env_file "cloudflare/.env"
  
  # Check if we've already set up production resources
  if [ -f ".project-config" ]; then
    echo "Found existing project configuration. Would you like to use production credentials for local development? (y/n)"
    read -r use_production_creds
    
    if [[ $use_production_creds =~ ^[Yy]$ ]]; then
      source .project-config
      
      # Update local .env files with production values
      echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" > landing/.env.local
      echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> landing/.env.local
      
      echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" > app/.env.local
      echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> app/.env.local
      
      echo "SUPABASE_URL=$SUPABASE_URL" > supabase/.env
      echo "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> supabase/.env
      echo "SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY" >> supabase/.env
      
      print_success "Environment variables updated with production credentials"
      return
    fi
  fi
  
  # Set up local Supabase development values
  echo "Setting up for local Supabase development..."
  
  # These are the default values for local Supabase
  local local_supabase_url="http://localhost:54321"
  local local_supabase_anon_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
  local local_supabase_service_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
  
  # Update .env files with local Supabase variables
  echo "NEXT_PUBLIC_SUPABASE_URL=$local_supabase_url" > landing/.env.local
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$local_supabase_anon_key" >> landing/.env.local
  
  echo "NEXT_PUBLIC_SUPABASE_URL=$local_supabase_url" > app/.env.local
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$local_supabase_anon_key" >> app/.env.local
  
  echo "SUPABASE_URL=$local_supabase_url" > supabase/.env
  echo "SUPABASE_ANON_KEY=$local_supabase_anon_key" >> supabase/.env
  echo "SUPABASE_SERVICE_KEY=$local_supabase_service_key" >> supabase/.env
  
  print_success "Environment variables set up for local development"
}

# Function to install dependencies
install_dependencies() {
  print_header "Installing Dependencies"
  
  # Install root dependencies
  echo "Installing root dependencies..."
  npm install
  print_success "Root dependencies installed"
  
  # Install dependencies for each package
  for pkg in landing app supabase fly cloudflare; do
    echo "Installing dependencies for $pkg..."
    (cd $pkg && npm install)
    print_success "$pkg dependencies installed"
  done
}

# Function to set up local Supabase
setup_local_supabase() {
  print_header "Setting Up Local Supabase"
  
  if ! command_exists supabase; then
    print_error "Supabase CLI is not installed. Install with: npm install -g supabase"
    return 1
  fi
  
  if ! command_exists docker; then
    print_error "Docker is not installed. It's required for local Supabase."
    return 1
  fi
  
  if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker."
    return 1
  fi
  
  # If a Supabase instance is already running, we should stop it first
  echo "Checking for running Supabase instances..."
  if (cd supabase && supabase status 2>/dev/null | grep -q "Database online"); then
    print_warning "Local Supabase is already running. Would you like to restart it? (y/n)"
    read -r restart_supabase
    
    if [[ $restart_supabase =~ ^[Yy]$ ]]; then
      echo "Stopping Supabase..."
      (cd supabase && supabase stop) || true
    else
      print_success "Using already running Supabase instance"
      return 0
    fi
  fi
  
  # Start Supabase
  echo "Starting local Supabase..."
  if (cd supabase && supabase start 2>&1); then
    print_success "Local Supabase started successfully"
  else
    print_error "Failed to start Supabase. This could be due to port conflicts."
    echo "Try manually stopping any existing instances with 'supabase stop' or check for port conflicts."
    return 1
  fi
  
  # Apply migrations
  echo "Applying database migrations..."
  if (cd supabase && supabase db reset -f 2>&1); then
    print_success "Database migrations applied successfully"
  else
    print_warning "Failed to apply migrations. This is not critical as long as Supabase is running."
  fi
  
  print_success "Local Supabase is ready for development"
}

# Function to initialize Git repository
initialize_git() {
  print_header "Initializing Git Repository"
  
  # Check if Git repo is already initialized
  if [ -d ".git" ]; then
    print_success "Git repository already initialized"
    return
  fi
  
  # Initialize Git
  git init
  
  # Create .gitignore file
  cat > .gitignore <<EOF
# Dependencies
node_modules
.pnp
.pnp.js

# Next.js
.next/
out/
build
dist

# Misc
.DS_Store
*.pem
.idea
.vscode

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment Variables
.env
.env.*
!.env.example

# Vercel
.vercel

# Supabase
.supabase

# Turbo
.turbo

# Project config
.project-config
EOF
  
  # Add files and create initial commit
  git add .
  git commit -m "Initial commit: SaaS application scaffold"
  
  print_success "Git repository initialized with initial commit"
}

# Main function
main() {
  echo -e "${BOLD}${BLUE}🚀 SaaS Application Development Environment Setup 🚀${RESET}"
  echo -e "This script will set up your local development environment.\n"
  
  check_prerequisites
  setup_env_variables
  install_dependencies
  setup_local_supabase || true # Continue even if Supabase setup fails
  initialize_git
  
  print_header "Development Environment Ready"
  echo -e "Your development environment is now set up! 🎉"
  echo -e "\nNext steps:"
  echo -e "1. Start the development server with:           ${BOLD}npm run dev${RESET}"
  echo -e "2. To use production environment, run:          ${BOLD}./bootstrap-production.sh${RESET}"
  echo -e "3. View the Supabase Studio locally at:         ${BOLD}http://localhost:54323${RESET}"
  echo -e "4. Access landing page locally at:              ${BOLD}http://localhost:3000${RESET}"
  echo -e "5. Access application frontend locally at:      ${BOLD}http://localhost:3001${RESET}"
  echo -e "\nHappy coding! 🚀"
}

# Run the main function
main