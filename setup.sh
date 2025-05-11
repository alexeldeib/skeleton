#!/bin/bash

set -e

# Text formatting
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RED="\033[31m"
RESET="\033[0m"

# Default project name
DEFAULT_PROJECT_NAME="saas-template"
PROJECT_NAME=$DEFAULT_PROJECT_NAME
MODE="dev"

print_header() { echo -e "\n${BOLD}${BLUE}==== $1 ====${RESET}\n"; }
print_success() { echo -e "${GREEN}✓ $1${RESET}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${RESET}"; }
print_error() { echo -e "${RED}✗ $1${RESET}"; exit 1; }

command_exists() { command -v "$1" >/dev/null 2>&1; }

# Check prerequisites
check_prerequisites() {
  print_header "Checking Prerequisites"
  local missing=false

  # Required for all modes
  for cmd in node npm git; do
    if command_exists $cmd; then
      print_success "$cmd is installed"
    else
      print_error "$cmd is not installed"
      missing=true
    fi
  done

  # Required for production mode
  if [[ "$MODE" == "prod" ]]; then
    for cmd in supabase vercel; do
      if command_exists $cmd; then
        print_success "$cmd is installed"
      else
        print_error "$cmd is required for production deployment"
        missing=true
      fi
    done

    # Check auth status
    if supabase projects list &>/dev/null; then
      print_success "Authenticated with Supabase"
    else
      print_error "Not authenticated with Supabase. Run 'supabase login' first"
    fi

    if vercel whoami &>/dev/null; then
      print_success "Authenticated with Vercel"
    else
      print_error "Not authenticated with Vercel. Run 'vercel login' first"
    fi
  else
    # Check for optional tools in dev mode
    for cmd in supabase docker; do
      if command_exists $cmd; then
        print_success "$cmd is installed"
      else
        print_warning "$cmd is recommended but not required"
      fi
    done
  fi

  if [ "$missing" = true ]; then
    print_error "Missing prerequisites. Install required tools and try again."
  fi
}

# Setup environment variables
setup_env_variables() {
  print_header "Setting Up Environment"
  
  # Create .env files
  mkdir -p landing app supabase

  for dir in landing app supabase; do
    touch $dir/.env.local
    print_success "Created $dir/.env.local"
  done

  if [[ "$MODE" == "dev" ]]; then
    # Set up local development environment
    local supabase_url="http://localhost:54321"
    local supabase_anon_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    local supabase_service_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
    
    # Update local dev environment files
    echo "NEXT_PUBLIC_SUPABASE_URL=$supabase_url" > landing/.env.local
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon_key" >> landing/.env.local
    
    echo "NEXT_PUBLIC_SUPABASE_URL=$supabase_url" > app/.env.local
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon_key" >> app/.env.local
    
    echo "SUPABASE_URL=$supabase_url" > supabase/.env.local
    echo "SUPABASE_ANON_KEY=$supabase_anon_key" >> supabase/.env.local
    echo "SUPABASE_SERVICE_KEY=$supabase_service_key" >> supabase/.env.local
    
    print_success "Environment variables set for local development"
  else
    # For production, we need to create real resources
    if [[ ! -f ".env.production" ]]; then
      # Prompt for project name
      read -p "Enter project name (default: $DEFAULT_PROJECT_NAME): " input_name
      PROJECT_NAME=${input_name:-$DEFAULT_PROJECT_NAME}
      PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
      
      print_success "Project name set to: $PROJECT_NAME"
      
      # Create Supabase project
      echo "Creating Supabase project..."
      if command_exists supabase; then
        # Get the first organization
        org_id=$(supabase orgs list --json | jq -r '.[0].id')
        
        if [[ -z "$org_id" ]]; then
          print_error "No Supabase organization found. Create one first."
        fi
        
        # Create a random password
        db_password=$(openssl rand -base64 16)
        
        # Create project
        supabase_output=$(supabase projects create "$PROJECT_NAME" --org-id "$org_id" --db-password "$db_password" --region "us-east-1")
        
        # Extract project ID
        if [[ $supabase_output =~ Created\ project:\ ([a-zA-Z0-9-]+) ]]; then
          supabase_project_id="${BASH_REMATCH[1]}"
          supabase_url="https://$supabase_project_id.supabase.co"
          
          # Get API keys
          sleep 5 # Give Supabase time to initialize
          supabase_keys=$(supabase projects api-keys --project-ref "$supabase_project_id")
          
          if [[ $supabase_keys =~ anon[[:space:]]+public[[:space:]]+([a-zA-Z0-9.=_-]+) ]]; then
            supabase_anon_key="${BASH_REMATCH[1]}"
          fi
          
          if [[ $supabase_keys =~ service_role[[:space:]]+secret[[:space:]]+([a-zA-Z0-9.=_-]+) ]]; then
            supabase_service_key="${BASH_REMATCH[1]}"
          fi
          
          # Save to .env.production
          echo "SUPABASE_PROJECT_ID=$supabase_project_id" > .env.production
          echo "SUPABASE_URL=$supabase_url" >> .env.production
          echo "SUPABASE_ANON_KEY=$supabase_anon_key" >> .env.production
          echo "SUPABASE_SERVICE_KEY=$supabase_service_key" >> .env.production
          echo "SUPABASE_DB_PASSWORD=$db_password" >> .env.production
          
          print_success "Supabase project created: $supabase_project_id"
          
          # Create Vercel projects
          for app_type in landing app; do
            vercel_project="$PROJECT_NAME-$app_type"
            echo "Creating Vercel project: $vercel_project"
            (cd $app_type && vercel link --yes --project "$vercel_project")
            (cd $app_type && vercel env add NEXT_PUBLIC_SUPABASE_URL production "$supabase_url")
            (cd $app_type && vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production "$supabase_anon_key")
            print_success "Vercel project created: $vercel_project"
          done
          
          # Save Vercel project names
          echo "LANDING_PROJECT=$PROJECT_NAME-landing" >> .env.production
          echo "APP_PROJECT=$PROJECT_NAME-app" >> .env.production
          
          # Update local environment with production values
          cp -f .env.production landing/.env.local
          cp -f .env.production app/.env.local
          cp -f .env.production supabase/.env.local
          
          # Create .gitignore with sensitive files
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
supabase/.branches
supabase/.temp

# Project config
.env.production
EOF
          
          print_success "Production environment configured successfully"
        else
          print_error "Failed to create Supabase project"
        fi
      else
        print_error "Supabase CLI not found"
      fi
    else
      print_warning ".env.production already exists. Using existing configuration."
      source .env.production
    fi
  fi
}

# Install dependencies
install_dependencies() {
  print_header "Installing Dependencies"
  
  # Create package.json if it doesn't exist
  if [[ ! -f "package.json" ]]; then
    cat > package.json <<EOF
{
  "name": "${PROJECT_NAME}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"cd landing && npm run dev\" \"cd app && npm run dev\"",
    "build": "npm run build:landing && npm run build:app",
    "build:landing": "cd landing && npm run build",
    "build:app": "cd app && npm run build",
    "test": "npm run test:app",
    "test:app": "cd app && npm test",
    "lint": "npm run lint:landing && npm run lint:app",
    "lint:landing": "cd landing && npm run lint",
    "lint:app": "cd app && npm run lint"
  },
  "devDependencies": {
    "concurrently": "^8.0.1"
  }
}
EOF
  fi
  
  # Install root dependencies
  npm install
  
  # Install component dependencies
  for dir in landing app supabase; do
    if [[ -f "$dir/package.json" ]]; then
      echo "Installing $dir dependencies..."
      (cd $dir && npm install)
      print_success "$dir dependencies installed"
    fi
  done
}

# Set up local Supabase
setup_local_supabase() {
  print_header "Setting Up Local Supabase"
  
  if ! command_exists supabase; then
    print_warning "Supabase CLI not installed. Skipping local setup."
    return
  fi
  
  if ! command_exists docker; then
    print_warning "Docker not installed. Supabase requires Docker."
    return
  fi
  
  # Check if Docker is running
  if ! docker info >/dev/null 2>&1; then
    print_warning "Docker not running. Please start Docker first."
    return
  fi
  
  # Check if Supabase is already running
  if (cd supabase && supabase status 2>/dev/null | grep -q "Database online"); then
    print_success "Supabase is already running"
  else
    echo "Starting Supabase..."
    (cd supabase && supabase start)
    print_success "Supabase started successfully"
  fi
  
  # Apply migrations
  echo "Applying database migrations..."
  (cd supabase && supabase db reset -f)
  print_success "Database migrations applied"
}

# Deploy to production
deploy_production() {
  print_header "Deploying to Production"
  
  if [[ ! -f ".env.production" ]]; then
    print_error "Production environment not set up. Run './setup.sh --prod' first."
  fi
  
  source .env.production
  
  # Deploy Supabase migrations
  echo "Deploying database migrations..."
  (cd supabase && supabase link --project-ref "$SUPABASE_PROJECT_ID")
  (cd supabase && supabase db push)
  
  # Deploy edge functions
  for function_dir in supabase/supabase/functions/*; do
    if [[ -d "$function_dir" ]]; then
      function_name=$(basename "$function_dir")
      echo "Deploying edge function: $function_name"
      (cd supabase && supabase functions deploy "$function_name" --project-ref "$SUPABASE_PROJECT_ID")
    fi
  done
  
  # Deploy Vercel projects
  echo "Deploying landing page..."
  (cd landing && vercel deploy --prod)
  
  echo "Deploying app..."
  (cd app && vercel deploy --prod)
  
  print_success "Production deployment completed!"
}

# Initialize git
initialize_git() {
  print_header "Initializing Git Repository"
  
  if [[ -d ".git" ]]; then
    print_success "Git repository already initialized"
    return
  fi
  
  git init
  git add .
  git commit -m "Initial commit: SaaS template setup"
  print_success "Git repository initialized"
}

# Main function
main() {
  # Check if devenv is available
  if command_exists devenv; then
    echo -e "${YELLOW}devenv.sh detected!${RESET}"
    echo -e "For a fully reproducible development environment, you can use:"
    echo -e "  ${GREEN}devenv shell${RESET} - Enter the devenv shell"
    echo -e "  ${GREEN}devenv up${RESET}    - Start all services"
    echo
    echo -e "Continuing with standard setup, but consider using devenv.sh for better reproducibility."
    echo
  fi

  # Process command line arguments
  for arg in "$@"; do
    case $arg in
      --prod)
        MODE="prod"
        shift
        ;;
      --deploy)
        MODE="deploy"
        shift
        ;;
      --help)
        echo "Usage: ./setup.sh [options]"
        echo "Options:"
        echo "  --prod    Set up production environment"
        echo "  --deploy  Deploy to production"
        echo "  --help    Show this help message"
        exit 0
        ;;
    esac
  done
  
  if [[ "$MODE" == "deploy" ]]; then
    check_prerequisites
    deploy_production
    exit 0
  fi
  
  print_header "SaaS Template Setup ($MODE mode)"
  check_prerequisites
  setup_env_variables
  install_dependencies
  
  if [[ "$MODE" == "dev" ]]; then
    setup_local_supabase
    initialize_git
  fi
  
  # Show success message
  print_header "Setup Complete! 🎉"
  if [[ "$MODE" == "dev" ]]; then
    echo "Your development environment is ready."
    echo "Start the application: npm run dev"
    echo "  Landing: http://localhost:3000"
    echo "  App:     http://localhost:3001"
  else
    echo "Your production environment is ready."
    echo "Deploy your application: ./setup.sh --deploy"
  fi
}

# Run the script
main "$@"