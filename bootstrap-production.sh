#!/bin/bash

set -e

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

# Default project name
DEFAULT_PROJECT_NAME="saas-skeleton"
PROJECT_NAME=""

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
    eval "$var_name=\"$default\""
  else
    eval "$var_name=\"$input\""
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
  
  # Check for required CLI tools
  required_tools=("node" "npm" "git" "supabase" "vercel" "flyctl" "wrangler")
  required_tools_pretty=("Node.js" "npm" "Git" "Supabase CLI" "Vercel CLI" "Fly.io CLI" "Cloudflare Wrangler")
  required_tools_install=("Install from https://nodejs.org/" 
                         "Comes with Node.js" 
                         "Install from https://git-scm.com/" 
                         "npm install -g supabase" 
                         "npm install -g vercel" 
                         "curl -L https://fly.io/install.sh | sh" 
                         "npm install -g wrangler")
  
  for i in "${!required_tools[@]}"; do
    if command_exists "${required_tools[$i]}"; then
      if [[ "${required_tools[$i]}" == "node" ]]; then
        print_success "${required_tools_pretty[$i]} is installed ($(node --version))"
      elif [[ "${required_tools[$i]}" == "npm" ]]; then
        print_success "${required_tools_pretty[$i]} is installed ($(npm --version))"
      elif [[ "${required_tools[$i]}" == "git" ]]; then
        print_success "${required_tools_pretty[$i]} is installed ($(git --version))"
      else
        print_success "${required_tools_pretty[$i]} is installed"
      fi
    else
      print_error "${required_tools_pretty[$i]} is not installed. Install with: ${required_tools_install[$i]}"
      missing_prerequisites=true
    fi
  done
  
  # Check if user is authenticated with services
  echo -e "\nChecking authentication status for services..."
  
  # Check Supabase auth
  if supabase projects list &>/dev/null; then
    print_success "Authenticated with Supabase"
  else
    print_error "Not authenticated with Supabase. Run 'supabase login' first."
    missing_prerequisites=true
  fi
  
  # Check Vercel auth
  if vercel whoami &>/dev/null; then
    print_success "Authenticated with Vercel"
  else
    print_error "Not authenticated with Vercel. Run 'vercel login' first."
    missing_prerequisites=true
  fi
  
  # Check Fly.io auth
  if flyctl auth whoami &>/dev/null; then
    print_success "Authenticated with Fly.io"
  else
    print_error "Not authenticated with Fly.io. Run 'flyctl auth login' first."
    missing_prerequisites=true
  fi
  
  # Check Cloudflare auth (this is a simplified check)
  if wrangler whoami &>/dev/null; then
    print_success "Authenticated with Cloudflare"
  else
    print_error "Not authenticated with Cloudflare. Run 'wrangler login' first."
    missing_prerequisites=true
  fi
  
  if [ "$missing_prerequisites" = true ]; then
    print_error "Please install/authenticate the missing prerequisites and run this script again."
    exit 1
  fi
}

# Function to initialize project
initialize_project() {
  print_header "Initializing Project"
  
  # Get project name
  prompt_input "Enter your project name (lowercase, no spaces)" PROJECT_NAME "$DEFAULT_PROJECT_NAME"
  
  # Remove any spaces and convert to lowercase
  PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  
  print_success "Project name set to: $PROJECT_NAME"
  
  # Create a project config file to store variables
  cat > .project-config <<EOF
PROJECT_NAME="$PROJECT_NAME"
CREATED_AT="$(date)"
EOF

  print_success "Project initialized"
}

# Function to create Supabase project
create_supabase_project() {
  print_header "Creating Supabase Project"
  
  # Check if project already exists
  if supabase projects list | grep -q "$PROJECT_NAME"; then
    print_warning "Supabase project '$PROJECT_NAME' already exists"
    
    # Get the project ID
    SUPABASE_PROJECT_ID=$(supabase projects list --json | jq -r ".[] | select(.name == \"$PROJECT_NAME\") | .id")
    print_success "Using existing project ID: $SUPABASE_PROJECT_ID"
  else
    echo "Creating new Supabase project: $PROJECT_NAME"
    
    # Create new Supabase project (organization ID is optional)
    if [ -n "$SUPABASE_ORG_ID" ]; then
      SUPABASE_OUTPUT=$(supabase projects create "$PROJECT_NAME" --org-id "$SUPABASE_ORG_ID" --json)
    else
      SUPABASE_OUTPUT=$(supabase projects create "$PROJECT_NAME" --json)
    fi
    
    # Extract project ID from the output
    SUPABASE_PROJECT_ID=$(echo "$SUPABASE_OUTPUT" | jq -r '.id')
    
    print_success "Supabase project created with ID: $SUPABASE_PROJECT_ID"
  fi
  
  # Get the project API keys
  echo "Fetching Supabase API keys..."
  SUPABASE_API_KEYS=$(supabase projects api-keys --project-ref "$SUPABASE_PROJECT_ID" --json)
  
  # Extract the anon key and service key
  SUPABASE_ANON_KEY=$(echo "$SUPABASE_API_KEYS" | jq -r '.[] | select(.name == "anon key") | .api_key')
  SUPABASE_SERVICE_KEY=$(echo "$SUPABASE_API_KEYS" | jq -r '.[] | select(.name == "service_role key") | .api_key')
  
  # Get the project URL
  SUPABASE_URL="https://$SUPABASE_PROJECT_ID.supabase.co"
  
  print_success "Supabase keys retrieved successfully"
  
  # Update project config with Supabase details
  cat >> .project-config <<EOF
SUPABASE_PROJECT_ID="$SUPABASE_PROJECT_ID"
SUPABASE_URL="$SUPABASE_URL"
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY"
EOF

  print_success "Supabase configuration completed"
}

# Function to create Fly.io apps
create_fly_app() {
  print_header "Creating Fly.io Application"
  
  FLY_APP_NAME="$PROJECT_NAME-backend"
  
  # Check if app already exists
  if flyctl apps list | grep -q "$FLY_APP_NAME"; then
    print_warning "Fly.io app '$FLY_APP_NAME' already exists"
  else
    echo "Creating new Fly.io app: $FLY_APP_NAME"
    
    # Create the app
    (cd fly && flyctl apps create "$FLY_APP_NAME" --json)
    
    print_success "Fly.io app created: $FLY_APP_NAME"
  fi
  
  # Set secrets for the app
  echo "Setting Fly.io app secrets..."
  (cd fly && flyctl secrets set \
    SUPABASE_URL="$SUPABASE_URL" \
    SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" \
    --app "$FLY_APP_NAME")
  
  # Get the app details
  FLY_APP_URL="https://$FLY_APP_NAME.fly.dev"
  
  # Update project config with Fly.io details
  cat >> .project-config <<EOF
FLY_APP_NAME="$FLY_APP_NAME"
FLY_APP_URL="$FLY_APP_URL"
EOF

  print_success "Fly.io configuration completed"
}

# Function to create Cloudflare Workers
create_cloudflare_worker() {
  print_header "Creating Cloudflare Worker"
  
  CLOUDFLARE_WORKER_NAME="$PROJECT_NAME-worker"
  
  # Check if we're inside the cloudflare directory
  if [ ! -d "cloudflare" ]; then
    print_error "Cloudflare directory not found"
    return 1
  fi
  
  # Update wrangler.toml with the worker name
  sed -i.bak "s/name = \"saas-app-worker\"/name = \"$CLOUDFLARE_WORKER_NAME\"/" cloudflare/wrangler.toml
  rm cloudflare/wrangler.toml.bak
  
  # Add environment variables to wrangler.toml
  cat >> cloudflare/wrangler.toml <<EOF

[vars]
SUPABASE_URL = "$SUPABASE_URL"
SUPABASE_ANON_KEY = "$SUPABASE_ANON_KEY"
EOF
  
  # Deploy the worker
  echo "Deploying Cloudflare Worker..."
  (cd cloudflare && wrangler deploy)
  
  # Get the worker URL
  CLOUDFLARE_WORKER_URL="https://$CLOUDFLARE_WORKER_NAME.workers.dev"
  
  # Update project config with Cloudflare worker details
  cat >> .project-config <<EOF
CLOUDFLARE_WORKER_NAME="$CLOUDFLARE_WORKER_NAME"
CLOUDFLARE_WORKER_URL="$CLOUDFLARE_WORKER_URL"
EOF

  print_success "Cloudflare Worker configuration completed"
}

# Function to create Vercel projects
create_vercel_projects() {
  print_header "Creating Vercel Projects"
  
  # Create landing page project
  LANDING_PROJECT_NAME="$PROJECT_NAME-landing"
  
  echo "Creating Vercel project for landing page: $LANDING_PROJECT_NAME"
  
  # Create the project
  (cd landing && vercel link --yes --project "$LANDING_PROJECT_NAME")
  
  # Add environment variables
  (cd landing && vercel env add NEXT_PUBLIC_SUPABASE_URL production "$SUPABASE_URL")
  (cd landing && vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production "$SUPABASE_ANON_KEY")
  
  # Create app project
  APP_PROJECT_NAME="$PROJECT_NAME-app"
  
  echo "Creating Vercel project for application: $APP_PROJECT_NAME"
  
  # Create the project
  (cd app && vercel link --yes --project "$APP_PROJECT_NAME")
  
  # Add environment variables
  (cd app && vercel env add NEXT_PUBLIC_SUPABASE_URL production "$SUPABASE_URL")
  (cd app && vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production "$SUPABASE_ANON_KEY")
  
  # Get Vercel project URLs
  LANDING_URL="https://$LANDING_PROJECT_NAME.vercel.app"
  APP_URL="https://$APP_PROJECT_NAME.vercel.app"
  
  # Update project config with Vercel details
  cat >> .project-config <<EOF
LANDING_PROJECT_NAME="$LANDING_PROJECT_NAME"
LANDING_URL="$LANDING_URL"
APP_PROJECT_NAME="$APP_PROJECT_NAME"
APP_URL="$APP_URL"
EOF

  print_success "Vercel projects configuration completed"
}

# Function to deploy database migrations
deploy_migrations() {
  print_header "Deploying Database Migrations"
  
  # Link to the Supabase project
  echo "Linking to Supabase project..."
  (cd supabase && supabase link --project-ref "$SUPABASE_PROJECT_ID")
  
  # Push migrations
  echo "Pushing database migrations..."
  (cd supabase && supabase db push)
  
  print_success "Database migrations deployed successfully"
}

# Function to deploy Supabase Edge Functions
deploy_edge_functions() {
  print_header "Deploying Supabase Edge Functions"
  
  # Link to the Supabase project if not already linked
  if [ ! -f "supabase/.supabase/config.json" ]; then
    echo "Linking to Supabase project..."
    (cd supabase && supabase link --project-ref "$SUPABASE_PROJECT_ID")
  fi
  
  # Deploy edge functions
  echo "Deploying edge functions..."
  for function_file in supabase/supabase/functions/*.ts; do
    function_name=$(basename "$function_file" .ts)
    echo "Deploying edge function: $function_name"
    (cd supabase && supabase functions deploy "$function_name" --project-ref "$SUPABASE_PROJECT_ID")
  done
  
  print_success "Supabase Edge Functions deployed successfully"
}

# Function to deploy Fly.io app
deploy_fly_app() {
  print_header "Deploying Fly.io Application"
  
  echo "Building and deploying Fly.io app..."
  (cd fly && flyctl deploy --app "$FLY_APP_NAME")
  
  print_success "Fly.io app deployed successfully"
}

# Function to deploy Vercel projects
deploy_vercel_projects() {
  print_header "Deploying Vercel Projects"
  
  # Deploy landing page
  echo "Deploying landing page to Vercel..."
  (cd landing && vercel deploy --prod)
  
  # Deploy app
  echo "Deploying application to Vercel..."
  (cd app && vercel deploy --prod)
  
  print_success "Vercel projects deployed successfully"
}

# Function to update environment files for local development
update_local_env_files() {
  print_header "Updating Local Environment Files"
  
  # Create local environment files with production values
  
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
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
EOF
  
  # Fly.io
  cat > fly/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
FLY_APP_NAME=$FLY_APP_NAME
EOF
  
  # Cloudflare Worker
  cat > cloudflare/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
CLOUDFLARE_WORKER_NAME=$CLOUDFLARE_WORKER_NAME
EOF
  
  print_success "Local environment files updated with production values"
}

# Function to display deployment summary
display_summary() {
  print_header "Deployment Summary"
  
  echo -e "${BOLD}Project Name:${RESET} $PROJECT_NAME"
  echo ""
  
  echo -e "${BOLD}Supabase:${RESET}"
  echo "  Project ID: $SUPABASE_PROJECT_ID"
  echo "  URL: $SUPABASE_URL"
  echo "  Dashboard: https://app.supabase.com/project/$SUPABASE_PROJECT_ID"
  echo ""
  
  echo -e "${BOLD}Vercel:${RESET}"
  echo "  Landing Page: $LANDING_URL"
  echo "  Application: $APP_URL"
  echo ""
  
  echo -e "${BOLD}Fly.io:${RESET}"
  echo "  App Name: $FLY_APP_NAME"
  echo "  URL: $FLY_APP_URL"
  echo ""
  
  echo -e "${BOLD}Cloudflare Worker:${RESET}"
  echo "  Worker Name: $CLOUDFLARE_WORKER_NAME"
  echo "  URL: $CLOUDFLARE_WORKER_URL"
  echo ""
  
  echo -e "${BOLD}DNS Configuration Example:${RESET}"
  echo "  1. Set up a custom domain for your landing page (e.g., yourdomain.com)"
  echo "  2. Set up a subdomain for your app (e.g., app.yourdomain.com)"
  echo "  3. Set up subdomain for your API (e.g., api.yourdomain.com) pointing to Fly.io or Cloudflare Worker"
  echo ""
  
  echo -e "${BOLD}Next Steps:${RESET}"
  echo "  1. Set up custom domains in Vercel for both projects"
  echo "  2. Configure DNS records through your DNS provider"
  echo "  3. Update auth redirect URLs in Supabase to include your custom domains"
  echo "  4. Start local development with 'npm run dev'"
  echo ""
  
  print_success "Production deployment completed successfully!"
}

# Main function
main() {
  echo -e "${BOLD}${BLUE}🚀 SaaS Application Production Bootstrapper 🚀${RESET}"
  echo -e "This script will create and deploy all components of your SaaS application to production environments.\n"
  
  # Check prerequisites before proceeding
  check_prerequisites
  
  # Initialize the project
  initialize_project
  
  # Create resources in each platform
  create_supabase_project
  create_vercel_projects
  create_fly_app
  create_cloudflare_worker
  
  # Deploy all components
  deploy_migrations
  deploy_edge_functions
  deploy_fly_app
  deploy_vercel_projects
  
  # Update local env files with production values
  update_local_env_files
  
  # Display deployment summary
  display_summary
}

# Source existing project config if available
if [ -f .project-config ]; then
  source .project-config
fi

# Run the main function
main