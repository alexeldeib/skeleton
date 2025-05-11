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
      chmod +x tests/run-tests.sh
      # First terminate any existing app processes to avoid port conflicts
      lsof -i :3001 -t | xargs kill -9 2>/dev/null || true
      ./tests/run-tests.sh
    '';

    # Run only auth tests
    test-auth.exec = ''
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
      npx playwright test tests/auth.test.js

      # Kill app
      if [[ -n "$APP_PID" ]]; then
        echo "Stopping app..."
        kill $APP_PID 2>/dev/null || true
      fi
    '';

    build.exec = ''
      npm run build
    '';

    clean.exec = ''
      ./cleanup.sh
    '';
  };

  # Processes for development
  # Processes for development (not used in testing)
  processes = {
    app = {
      exec = "cd app && npm run dev";
      # Don't start this process when running tests
      when = {
        command_not = ["^devenv test.*"];
      };
    };
    landing = {
      exec = "cd landing && npm run dev";
      # Don't start this process when running tests
      when = {
        command_not = ["^devenv test.*"];
      };
    };
    supabase = {
      exec = "cd supabase && npx supabase start";
      # Allow this to run during tests since it doesn't conflict
      when = {
        always = true;
      };
    };
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