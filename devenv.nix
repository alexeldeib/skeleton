{ pkgs, ... }:

{
  # Enable devenv for this project
  packages = with pkgs; [
    nodejs
    nodePackages.npm
    nodePackages.typescript
    nodePackages.pnpm
    git
    docker
    postgresql_15
  ];

  # Set environment variables
  env.NEXT_TELEMETRY_DISABLED = "1"; # Disable Next.js telemetry
  env.NODE_ENV = "development";

  # Enable dotenv integration
  dotenv.enable = true;
  
  # Define language support
  languages = {
    typescript.enable = true;
    javascript.enable = true;
  };

  # Configure services
  services = {
    postgres = {
      enable = true;
      package = pkgs.postgresql_15;
      initialDatabases = [{ name = "saas_template"; }];
      listen_addresses = "127.0.0.1";
      port = 54321;
    };
  };

  # Scripts for common tasks
  scripts = {
    dev.exec = ''
      npm run dev
    '';

    setup.exec = ''
      ./setup.sh
    '';

    test.exec = ''
      # Stop processes that might conflict with tests
      pkill -f "npm run dev" || true
      sleep 1
      # Run tests with explicit output
      chmod +x tests/run-tests.sh
      echo "===================================================================="
      echo "RUNNING TESTS"
      echo "===================================================================="
      bash -x ./tests/run-tests.sh
      echo "===================================================================="
      echo "TESTS COMPLETED"
      echo "===================================================================="
    '';

    # Run only auth tests
    test-auth.exec = ''
      # Stop any existing app processes
      pkill -f "npm run dev" || true
      sleep 1

      # Start the app
      cd app && npm run dev > /dev/null 2>&1 &
      APP_PID=$!

      # Wait for app to start
      MAX_RETRIES=15
      RETRY_COUNT=0
      echo "Waiting for app to start..."
      while ! curl -s http://localhost:3001 > /dev/null && [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        sleep 2
        RETRY_COUNT=$((RETRY_COUNT+1))
        echo -n "."
      done
      echo ""

      # Run auth tests
      echo "Running auth tests..."
      npm run test:auth

      # Kill app
      echo "Stopping app server..."
      kill $APP_PID 2>/dev/null || true
    '';

    build.exec = ''
      npm run build
    '';

    clean.exec = ''
      ./cleanup.sh
    '';
  };

  # Processes for development
  processes = {
    app.exec = "cd app && npm run dev";
    landing.exec = "cd landing && npm run dev";
    supabase.exec = "cd supabase && npx supabase start";
  };

  # Entry message when entering shell
  enterShell = ''
    echo "🚀 SaaS Template Development Environment"
    echo ""
    echo "Available commands:"
    echo "  dev          - Start all development servers"
    echo "  setup        - Set up the project"
    echo "  test         - Run all tests"
    echo "  test-auth    - Run only auth tests"
    echo "  build        - Build all components"
    echo "  clean        - Clean up unnecessary files"
    echo ""
    echo "Or start individual components:"
    echo "  devenv up app      - Start just the app server"
    echo "  devenv up landing  - Start just the landing page"
    echo "  devenv up supabase - Start just Supabase"
    echo ""
  '';

  # Configuration for testing environment
  enterTest = ''
    echo "🧪 Running tests in devenv environment"
    echo "Using Node.js $(node --version)"
    echo "Using NPM $(npm --version)"
    echo ""

    # Check for required environment variables
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
      echo "⚠️  Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
    else
      echo "✓ NEXT_PUBLIC_SUPABASE_URL is set"
    fi

    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
      echo "⚠️  Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable"
    else
      echo "✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    fi

    echo ""
  '';
}