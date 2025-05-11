# SaaS Template Minimization Project

## Project Overview
Take a verbose, feature-rich SaaS application template and transform it into a minimalist, maintainable version while preserving core functionality. The goal is to reduce complexity, streamline documentation, consolidate redundant scripts, and improve the developer experience.

## Initial State
The template consists of:
1. Landing page (Next.js)
2. Main application (Next.js)
3. Supabase for auth and database
4. Duplicate backend implementations (Fly.io and Cloudflare)
5. Complex testing framework
6. Multiple bootstrap and configuration scripts
7. Verbose documentation

## Required Tasks

### 1. Streamline Documentation
Create concise yet comprehensive documentation:
- Simplify README.md to essential information
- Move detailed instructions to subdirectories
- Create a clear, organized file structure

### 2. Consolidate Bootstrap Scripts
- Analyze bootstrap-dev.sh, bootstrap-production.sh, and bootstrap.sh
- Create a single unified setup.sh script with:
  - Command-line options (--dev, --prod, --deploy, --help)
  - Clear error handling
  - Progress indicators
  - Prerequisite checking
  - Environment variable setup

### 3. Simplify Backend
- Choose one backend implementation (Fly.io preferred over Cloudflare)
- Create a unified directory structure
- Ensure deployment is straightforward
- Maintain full functionality

### 4. Simplify Testing
- Consolidate test files to focus on core functionality
- Create a simple run-tests.sh script
- Ensure tests are reliable and maintainable
- Remove redundant test cases

### 5. Environment Setup
- Create unified environment variable management
- Ensure cross-platform compatibility
- Add validation and error handling
- Maintain separation between dev and production environments

### 6. Create Deployment Documentation
- Write clear, step-by-step deployment instructions
- Include all necessary environment variables
- Document custom domain setup
- Include CI/CD examples

### 7. Clean Up Project
- Create a cleanup.sh script to remove redundant files
- Ensure all scripts are executable
- Organize files into logical directories
- Remove deprecated or unused components

### 8. Add devenv.sh Support
- Create devenv.nix configuration for reproducible environments
- Add dotenv integration
- Configure PostgreSQL, Node.js, and other dependencies
- Create .envrc for direnv activation
- Write install-devenv.sh helper script
- Add detailed documentation in docs/devenv.md

## Technical Requirements
- Maintain all core functionality
- Ensure backward compatibility
- Provide clear error messages
- Make scripts executable and cross-platform
- Use modern Node.js (LTS)
- Follow best practices for deployment
- Remove redundant code and scripts

## Implementation Details
- Use a modern file structure
- Implement proper error handling
- Add descriptive comments
- Create color-coded terminal output
- Use environment variables for configuration
- Document all changes
- Test thoroughly on multiple platforms

## Successful Outcome
A streamlined SaaS template with:
- Simplified documentation
- Unified setup script
- Single backend implementation
- Focused test framework
- Clear deployment instructions
- Reproducible development environment with devenv.sh
- Removal of all redundancy and complexity

The final product should be easy to understand, extend, and deploy while maintaining all the original template's core functionality.