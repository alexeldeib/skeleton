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
      npm test
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
    echo "  dev      - Start all development servers"
    echo "  setup    - Set up the project"
    echo "  test     - Run tests"
    echo "  build    - Build all components"
    echo "  clean    - Clean up unnecessary files"
    echo ""
    echo "Or start individual components:"
    echo "  devenv up app      - Start just the app server"
    echo "  devenv up landing  - Start just the landing page"
    echo "  devenv up supabase - Start just Supabase"
    echo ""
  '';
}