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

  # If we're in auto mode and it's a y/n question, use AUTO_CONTINUE
  if [[ -n "$AUTO_CONTINUE" && "$prompt" == *"(y/n)"* ]]; then
    echo "$prompt: $AUTO_CONTINUE (auto)"
    eval "$var_name=\"$AUTO_CONTINUE\""
    return
  fi

  # If we're in auto mode and there's a default, use default
  if [[ -n "$AUTO_CONTINUE" && -n "$default" ]]; then
    echo "$prompt (default: $default): Using default (auto)"
    eval "$var_name=\"$default\""
    return
  fi

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
    
    # Generate a random password for the Supabase database
    DB_PASSWORD=$(openssl rand -base64 16)

    # Prompt for organization ID if not already set
    if [ -z "$SUPABASE_ORG_ID" ]; then
      # List available organizations
      echo "Available Supabase organizations:"
      supabase orgs list

      if [ -n "$AUTO_CONTINUE" ]; then
        # Try to extract first org ID automatically
        ORG_LIST=$(supabase orgs list)
        if [[ $ORG_LIST =~ ([a-zA-Z0-9_-]+)[[:space:]]+\|[[:space:]]+[[:alnum:][:space:]\']+$ ]]; then
          SUPABASE_ORG_ID="${BASH_REMATCH[1]}"
          echo "Auto-selected organization ID: $SUPABASE_ORG_ID"
        else
          print_error "Could not auto-select an organization ID"
          exit 1
        fi
      else
        prompt_input "Enter your Supabase organization ID" SUPABASE_ORG_ID
      fi
    fi

    # Create new Supabase project with required parameters
    echo "Creating Supabase project with org-id=$SUPABASE_ORG_ID, region=us-east-1"
    SUPABASE_OUTPUT=$(supabase projects create "$PROJECT_NAME" --org-id "$SUPABASE_ORG_ID" --db-password "$DB_PASSWORD" --region "us-east-1")

    # Extract project ID from the output using regex
    if [[ $SUPABASE_OUTPUT =~ Created\ project:\ ([a-zA-Z0-9-]+) ]]; then
      SUPABASE_PROJECT_ID="${BASH_REMATCH[1]}"
    else
      print_error "Failed to extract project ID from output"
      print_error "Output: $SUPABASE_OUTPUT"
      exit 1
    fi
    
    print_success "Supabase project created with ID: $SUPABASE_PROJECT_ID"
  fi
  
  # Get the project API keys
  echo "Fetching Supabase API keys..."

  # Try up to 3 times to fetch the API keys
  local retry_count=0
  local max_retries=3
  local success=false

  while [ $retry_count -lt $max_retries ] && [ "$success" = false ]; do
    SUPABASE_API_KEYS=$(supabase projects api-keys --project-ref "$SUPABASE_PROJECT_ID" 2>/tmp/supabase_error.log)

    if [ -z "$SUPABASE_API_KEYS" ]; then
      retry_count=$((retry_count + 1))
      print_warning "Attempt $retry_count to fetch Supabase API keys failed. Retrying in 5 seconds..."

      if [ -f /tmp/supabase_error.log ]; then
        print_warning "Error: $(cat /tmp/supabase_error.log)"
      fi

      if [ $retry_count -lt $max_retries ]; then
        sleep 5
      fi
    else
      success=true
    fi
  done

  if [ "$success" = false ]; then
    print_error "Failed to fetch Supabase API keys after $max_retries attempts."
    print_error "Please check your authentication, network connection, and try again."
    print_error "You may need to manually add the following keys to your .project-config file:"
    print_error "SUPABASE_ANON_KEY=\"your_anon_key\""
    print_error "SUPABASE_SERVICE_KEY=\"your_service_key\""
    print_error "SUPABASE_SERVICE_ROLE_KEY=\"your_service_key\""

    # Prompt user to continue or abort
    prompt_input "Do you want to continue without Supabase API keys? (y/n)" continue_without_keys
    if [ "$continue_without_keys" != "y" ] && [ "$continue_without_keys" != "Y" ]; then
      exit 1
    fi

    # Set placeholder values if the user chooses to continue
    SUPABASE_ANON_KEY="MISSING_KEY_PLEASE_REPLACE"
    SUPABASE_SERVICE_ROLE_KEY="MISSING_KEY_PLEASE_REPLACE"
    SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

    print_warning "Continuing with placeholder API keys. You MUST update these manually later!"
  else
    # Extract keys from text output using regex
    if [[ $SUPABASE_API_KEYS =~ anon[[:space:]]+public[[:space:]]+([a-zA-Z0-9.=_-]+) ]]; then
      SUPABASE_ANON_KEY="${BASH_REMATCH[1]}"
    else
      SUPABASE_ANON_KEY=""
    fi

    if [[ $SUPABASE_API_KEYS =~ service_role[[:space:]]+secret[[:space:]]+([a-zA-Z0-9.=_-]+) ]]; then
      SUPABASE_SERVICE_ROLE_KEY="${BASH_REMATCH[1]}"
    else
      SUPABASE_SERVICE_ROLE_KEY=""
    fi

    # Alias service_role key as SUPABASE_SERVICE_KEY for backward compatibility
    SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

    # Validate that we received valid keys
    if [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
      print_error "Failed to extract Supabase API keys. The response format may have changed."
      print_error "API Keys Response: $SUPABASE_API_KEYS"

      # Prompt user to continue or abort
      prompt_input "Do you want to continue without Supabase API keys? (y/n)" continue_without_keys
      if [ "$continue_without_keys" != "y" ] && [ "$continue_without_keys" != "Y" ]; then
        exit 1
      fi

      # Set placeholder values if the user chooses to continue
      SUPABASE_ANON_KEY="MISSING_KEY_PLEASE_REPLACE"
      SUPABASE_SERVICE_ROLE_KEY="MISSING_KEY_PLEASE_REPLACE"
      SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

      print_warning "Continuing with placeholder API keys. You MUST update these manually later!"
    else
      print_success "Successfully retrieved Supabase API keys"
    fi
  fi

  # Get the project URL
  SUPABASE_URL="https://$SUPABASE_PROJECT_ID.supabase.co"

  print_success "Supabase keys retrieved successfully"
  
  # Update project config with Supabase details
  cat >> .project-config <<EOF
SUPABASE_PROJECT_ID="$SUPABASE_PROJECT_ID"
SUPABASE_URL="$SUPABASE_URL"
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY"
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_DB_PASSWORD="$DB_PASSWORD"
SUPABASE_ORG_ID="$SUPABASE_ORG_ID"
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

  # Check if we have valid Supabase keys
  if [[ "$SUPABASE_URL" == "MISSING"* ]] || [[ "$SUPABASE_SERVICE_KEY" == "MISSING"* ]]; then
    print_warning "Using placeholder Supabase keys for Fly.io. This deployment will likely not work correctly."
    print_warning "You'll need to manually update the Fly.io secrets later with correct keys."
  fi

  # Try to set the secrets, but don't fail if it doesn't work
  if ! (cd fly && flyctl secrets set \
    SUPABASE_URL="$SUPABASE_URL" \
    SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" \
    SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
    PORT="8080" \
    --app "$FLY_APP_NAME" 2>/tmp/fly_error.log); then

    print_error "Failed to set Fly.io secrets."
    if [ -f /tmp/fly_error.log ]; then
      print_error "Error: $(cat /tmp/fly_error.log)"
    fi

    prompt_input "Do you want to continue despite Fly.io secret setting failure? (y/n)" continue_without_fly_secrets
    if [ "$continue_without_fly_secrets" != "y" ] && [ "$continue_without_fly_secrets" != "Y" ]; then
      exit 1
    fi

    print_warning "Continuing without setting Fly.io secrets. You'll need to set them manually later."
  else
    print_success "Fly.io secrets set successfully"
  fi
  
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

  # Check if we have valid Supabase keys
  if [[ "$SUPABASE_URL" == "MISSING"* ]] || [[ "$SUPABASE_ANON_KEY" == "MISSING"* ]]; then
    print_warning "Using placeholder Supabase keys for Cloudflare Worker. This deployment will likely not work correctly."
    print_warning "You'll need to manually update the Cloudflare Worker environment variables later with correct keys."
  fi

  # Deploy the worker
  echo "Deploying Cloudflare Worker..."
  if ! (cd cloudflare && wrangler deploy 2>/tmp/cf_error.log); then
    print_error "Failed to deploy Cloudflare Worker."
    if [ -f /tmp/cf_error.log ]; then
      print_error "Error: $(cat /tmp/cf_error.log)"
    fi

    prompt_input "Do you want to continue despite Cloudflare Worker deployment failure? (y/n)" continue_without_cf
    if [ "$continue_without_cf" != "y" ] && [ "$continue_without_cf" != "Y" ]; then
      exit 1
    fi

    print_warning "Continuing without deploying Cloudflare Worker. You'll need to deploy it manually later."
    CLOUDFLARE_WORKER_URL="NOT_DEPLOYED"
  else
    print_success "Cloudflare Worker deployed successfully"
  fi
  
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
  
  # Check if we have valid Supabase keys
  if [[ "$SUPABASE_URL" == "MISSING"* ]] || [[ "$SUPABASE_ANON_KEY" == "MISSING"* ]]; then
    print_warning "Using placeholder Supabase keys for Vercel. This deployment will likely not work correctly."
    print_warning "You'll need to manually update the Vercel environment variables later with correct keys."
  fi

  # Add environment variables - don't fail the script if these don't work
  if ! (cd landing && vercel env add NEXT_PUBLIC_SUPABASE_URL production "$SUPABASE_URL" 2>/tmp/vercel_error.log); then
    print_error "Failed to set NEXT_PUBLIC_SUPABASE_URL for landing page."
    if [ -f /tmp/vercel_error.log ]; then
      print_error "Error: $(cat /tmp/vercel_error.log)"
    fi
    print_warning "You'll need to set this manually later."
  fi

  if ! (cd landing && vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production "$SUPABASE_ANON_KEY" 2>/tmp/vercel_error.log); then
    print_error "Failed to set NEXT_PUBLIC_SUPABASE_ANON_KEY for landing page."
    if [ -f /tmp/vercel_error.log ]; then
      print_error "Error: $(cat /tmp/vercel_error.log)"
    fi
    print_warning "You'll need to set this manually later."
  fi

  # Create app project
  APP_PROJECT_NAME="$PROJECT_NAME-app"

  echo "Creating Vercel project for application: $APP_PROJECT_NAME"

  # Create the project
  if ! (cd app && vercel link --yes --project "$APP_PROJECT_NAME" 2>/tmp/vercel_error.log); then
    print_error "Failed to link app project to Vercel."
    if [ -f /tmp/vercel_error.log ]; then
      print_error "Error: $(cat /tmp/vercel_error.log)"
    fi

    prompt_input "Do you want to continue despite Vercel app linking failure? (y/n)" continue_without_vercel_app
    if [ "$continue_without_vercel_app" != "y" ] && [ "$continue_without_vercel_app" != "Y" ]; then
      exit 1
    fi

    print_warning "Continuing without linking app to Vercel. You'll need to set it up manually later."
  else
    # Add environment variables - don't fail if these don't work
    if ! (cd app && vercel env add NEXT_PUBLIC_SUPABASE_URL production "$SUPABASE_URL" 2>/tmp/vercel_error.log); then
      print_error "Failed to set NEXT_PUBLIC_SUPABASE_URL for app."
      if [ -f /tmp/vercel_error.log ]; then
        print_error "Error: $(cat /tmp/vercel_error.log)"
      fi
      print_warning "You'll need to set this manually later."
    fi

    if ! (cd app && vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production "$SUPABASE_ANON_KEY" 2>/tmp/vercel_error.log); then
      print_error "Failed to set NEXT_PUBLIC_SUPABASE_ANON_KEY for app."
      if [ -f /tmp/vercel_error.log ]; then
        print_error "Error: $(cat /tmp/vercel_error.log)"
      fi
      print_warning "You'll need to set this manually later."
    fi
  fi
  
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
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
SUPABASE_DB_PASSWORD=$DB_PASSWORD
EOF
  
  # Fly.io
  cat > fly/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
FLY_APP_NAME=$FLY_APP_NAME
PORT=8080
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

# Test function to only run specific parts of the script
test_env_extraction() {
  echo -e "${BOLD}${BLUE}🚀 Testing Environment Variable Extraction 🚀${RESET}"

  # Set test variables
  PROJECT_NAME="saas-test-project"
  SUPABASE_PROJECT_ID="test-project-id"
  SUPABASE_URL="https://test-project-id.supabase.co"
  SUPABASE_ANON_KEY="test-anon-key"
  SUPABASE_SERVICE_KEY="test-service-key"
  SUPABASE_SERVICE_ROLE_KEY="test-service-role-key"
  FLY_APP_NAME="$PROJECT_NAME-backend"
  FLY_APP_URL="https://$FLY_APP_NAME.fly.dev"
  CLOUDFLARE_WORKER_NAME="$PROJECT_NAME-worker"
  CLOUDFLARE_WORKER_URL="https://$CLOUDFLARE_WORKER_NAME.workers.dev"
  LANDING_PROJECT_NAME="$PROJECT_NAME-landing"
  LANDING_URL="https://$LANDING_PROJECT_NAME.vercel.app"
  APP_PROJECT_NAME="$PROJECT_NAME-app"
  APP_URL="https://$APP_PROJECT_NAME.vercel.app"

  # Create project config file
  echo "Creating test .project-config file..."
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

  # Create .env files
  update_local_env_files

  # Display created files
  echo -e "\nCreated .env files:"
  echo "---------------"
  echo "landing/.env.local:"
  cat landing/.env.local
  echo "---------------"
  echo "app/.env.local:"
  cat app/.env.local
  echo "---------------"
  echo "supabase/.env:"
  cat supabase/.env
  echo "---------------"
  echo "fly/.env:"
  cat fly/.env
  echo "---------------"
  echo "cloudflare/.env:"
  cat cloudflare/.env
  echo "---------------"

  print_success "Environment variable extraction test completed"
}

# Main function
main() {
  echo -e "${BOLD}${BLUE}🚀 SaaS Application Production Bootstrapper 🚀${RESET}"
  echo -e "This script will create and deploy all components of your SaaS application to production environments.\n"

  # Check prerequisites before proceeding
  check_prerequisites

  # Initialize the project
  if [ -n "$AUTO_PROJECT_NAME" ]; then
    PROJECT_NAME="$AUTO_PROJECT_NAME"
    # Remove any spaces and convert to lowercase
    PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
    echo "Using project name: $PROJECT_NAME"

    # Create a project config file to store variables
    cat > .project-config <<EOF
PROJECT_NAME="$PROJECT_NAME"
CREATED_AT="$(date)"
EOF

    print_success "Project initialized automatically"
  else
    initialize_project
  fi

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

# Test function for missing API keys
test_missing_keys() {
  echo -e "${BOLD}${BLUE}🚀 Testing Missing API Keys Handling 🚀${RESET}"

  # Set test variables with missing keys
  PROJECT_NAME="saas-test-project"
  SUPABASE_PROJECT_ID="test-project-id"
  SUPABASE_URL="https://test-project-id.supabase.co"
  SUPABASE_ANON_KEY="MISSING_KEY_PLEASE_REPLACE"
  SUPABASE_SERVICE_KEY="MISSING_KEY_PLEASE_REPLACE"
  SUPABASE_SERVICE_ROLE_KEY="MISSING_KEY_PLEASE_REPLACE"
  FLY_APP_NAME="$PROJECT_NAME-backend"
  FLY_APP_URL="https://$FLY_APP_NAME.fly.dev"
  CLOUDFLARE_WORKER_NAME="$PROJECT_NAME-worker"
  CLOUDFLARE_WORKER_URL="https://$CLOUDFLARE_WORKER_NAME.workers.dev"
  LANDING_PROJECT_NAME="$PROJECT_NAME-landing"
  LANDING_URL="https://$LANDING_PROJECT_NAME.vercel.app"
  APP_PROJECT_NAME="$PROJECT_NAME-app"
  APP_URL="https://$APP_PROJECT_NAME.vercel.app"

  # Create project config file
  echo "Creating test .project-config file with missing keys..."
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

  # Create .env files
  update_local_env_files

  # Display created files
  echo -e "\nCreated .env files with missing keys:"
  echo "---------------"
  echo "landing/.env.local:"
  cat landing/.env.local
  echo "---------------"
  echo "app/.env.local:"
  cat app/.env.local
  echo "---------------"
  echo "supabase/.env:"
  cat supabase/.env
  echo "---------------"
  echo "fly/.env:"
  cat fly/.env
  echo "---------------"
  echo "cloudflare/.env:"
  cat cloudflare/.env
  echo "---------------"

  print_success "Missing API keys handling test completed"
}

# Function to automatically run the script with minimal prompts
auto_run() {
  # Export auto project name for use in the main function
  export AUTO_PROJECT_NAME="saas-app-claude"

  # Export auto confirmation for various prompts
  export AUTO_CONTINUE="y"

  # Run the main function
  main
}

# Check for run mode
if [ "$1" == "--test-env" ]; then
  test_env_extraction
elif [ "$1" == "--test-missing-keys" ]; then
  test_missing_keys
elif [ "$1" == "--auto" ]; then
  auto_run
else
  # Run the main function
  main
fi