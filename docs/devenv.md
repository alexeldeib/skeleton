# Development Environment with devenv.sh

This document explains how to use [devenv.sh](https://devenv.sh) with our SaaS template for a fully reproducible development environment.

## What is devenv.sh?

devenv.sh is a tool that creates reproducible developer environments using Nix. It ensures that all developers working on the project have the exact same environment, with the same versions of Node.js, PostgreSQL, and other dependencies.

## Prerequisites

- Nix package manager (installed automatically when you install devenv.sh)
- direnv (optional, for automatic activation)

## Setup

### 1. Install devenv.sh

```bash
curl -L https://get.devenv.sh/install.sh | bash
```

This will install both Nix and devenv.sh.

### 2. Install direnv (optional)

direnv automatically activates the environment when you enter the directory:

```bash
# macOS
brew install direnv

# Ubuntu/Debian
sudo apt install direnv

# Fedora
sudo dnf install direnv
```

Add the following to your shell configuration (.bashrc, .zshrc, etc.):

```bash
eval "$(direnv hook bash)"  # or zsh, fish, etc.
```

### 3. Clone and enter the repository

```bash
git clone https://github.com/yourusername/saas-template.git
cd saas-template
```

### 4. Activate the environment

If using direnv:
```bash
direnv allow
```

Or manually:
```bash
devenv shell
```

## Available Commands

Once in the devenv shell, you can use the following commands:

| Command | Description |
|---------|-------------|
| `setup` | Run the setup script to initialize the project |
| `dev` | Start all development servers |
| `test` | Run all tests |
| `build` | Build all components |
| `clean` | Clean up unnecessary files |

You can also start individual components:

```bash
devenv up app      # Start just the app server
devenv up landing  # Start just the landing page
devenv up supabase # Start just Supabase
```

## What's Included

Our devenv.nix configuration includes:

- Node.js 22 (LTS) and npm
- TypeScript
- PostgreSQL 15
- Docker
- Git
- All necessary tools for development

## Customizing

You can customize the environment by editing the `devenv.nix` file. For example, to add a new package:

```nix
packages = with pkgs; [
  nodejs_18
  nodePackages.npm
  nodePackages.typescript
  # Add new packages here
  nodePackages.yarn
];
```

Or to add a new script:

```nix
scripts = {
  # Existing scripts...
  
  # Add a new script
  lint.exec = ''
    npm run lint
  '';
};
```

## Troubleshooting

### Environment doesn't activate

Make sure direnv is properly set up:

```bash
which direnv
direnv --version
```

If direnv is working but the environment doesn't activate, try:

```bash
direnv reload
```

### Packages are missing

If a package is missing, add it to the `packages` list in `devenv.nix` and then rebuild the environment:

```bash
devenv update
devenv shell
```

### Database issues

If PostgreSQL doesn't start properly, you can try:

```bash
devenv down   # Stop all services
devenv up     # Start services again
```

## Reference

For more information about devenv.sh, see:

- [devenv.sh documentation](https://devenv.sh/basics/)
- [Nix language reference](https://nixos.org/manual/nix/stable/language/index.html)
- [Available packages](https://search.nixos.org/packages)