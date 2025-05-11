# Contributing to the SaaS Application

Thank you for your interest in contributing to our SaaS application. This document provides guidelines and instructions for development and deployment.

## Development Environment Setup

### Prerequisites

- Node.js 18 or higher
- npm
- Git
- Supabase CLI (recommended)
- Vercel CLI (recommended for deployment)

### Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/saas-app.git
   cd saas-app
   ```

2. Run the bootstrap script
   ```bash
   chmod +x bootstrap.sh
   ./bootstrap.sh
   ```

   This script will:
   - Check prerequisites
   - Set up environment variables
   - Install dependencies
   - Configure local development
   - Set up deployment (optional)

3. Start the development server
   ```bash
   npm run dev
   ```

## Project Structure

```
skeleton/
├── landing/                # Marketing site (Next.js)
├── app/                    # Application frontend (Next.js)
├── supabase/               # Supabase setup, migrations, edge functions
├── codesandbox/            # CodeSandbox.io backend (for untrusted code execution)
├── fly/                    # Fly.io backend (for full VM runtime needs)
├── cloudflare/             # Cloudflare Workers backend
```

## Development Workflow

### Landing Page

The landing page is built with Next.js and uses TailwindCSS for styling. To work on the landing page:

```bash
cd landing
npm run dev
```

### Application Frontend

The application frontend is also built with Next.js and uses Supabase for authentication. To work on the app:

```bash
cd app
npm run dev
```

### Supabase Edge Functions

To develop and test Supabase Edge Functions:

1. Start a local Supabase instance:
   ```bash
   cd supabase
   supabase start
   ```

2. Deploy functions to your local instance:
   ```bash
   supabase functions serve
   ```

### Other Backend Components

Depending on your needs, you may work with:

- **Fly.io**: For services requiring a full VM runtime
- **CodeSandbox**: For isolated/untrusted code execution
- **Cloudflare Workers**: For edge computing needs

Each component has its own directory with a README detailing specific development steps.

## Database Migrations

Database migrations are stored in the `supabase/migrations` directory. To apply migrations:

```bash
cd supabase
supabase db push
```

## Deployment

### Frontend (Vercel)

The frontend components can be deployed to Vercel:

```bash
cd landing
vercel
```

```bash
cd app
vercel
```

### Supabase

Deploy Supabase Edge Functions:

```bash
cd supabase
supabase functions deploy
```

### Other Components

Each backend component has its own deployment process detailed in its respective directory.

## Testing

Run tests for all components:

```bash
npm test
```

Or for a specific component:

```bash
cd <component>
npm test
```

## Submitting Changes

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git commit -m "Description of changes"
   ```

3. Push your branch to the repository:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a pull request against the main branch

## Code Style

- Follow the existing code style
- Use ESLint and Prettier for consistent formatting
- Write meaningful commit messages
- Document your code as needed

## Questions?

If you have any questions, please open an issue on GitHub or contact the project maintainers.

Thank you for contributing!