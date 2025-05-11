# SaaS Application Skeleton

A production-ready SaaS application template including a landing page, application frontend, and backend components.

## Project Structure

```
skeleton/
├── landing/                # Marketing site (Next.js)
├── app/                    # Application frontend (Next.js)
├── supabase/               # Supabase setup, migrations, edge functions
├── fly/                    # Fly.io backend (for full VM runtime needs)
├── cloudflare/             # Cloudflare Workers backend
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm
- Git
- Supabase CLI (`npm install -g supabase`)
- Vercel CLI (`npm install -g vercel`) - for production deployment
- Fly.io CLI - for production deployment
- Cloudflare Wrangler CLI (`npm install -g wrangler`) - for production deployment
- Docker - for local Supabase development

### Quick Start (Development)

```bash
# Clone the repository
git clone https://github.com/yourusername/skeleton.git
cd skeleton

# Set up development environment
npm run bootstrap
# or
./bootstrap-dev.sh

# Start Supabase locally (if needed)
cd supabase && supabase start && cd ..

# Start frontend development servers in separate terminals:
# Terminal 1 - Landing page (http://localhost:3000)
cd landing && npm run dev

# Terminal 2 - App frontend (http://localhost:3001)
cd app && npm run dev
```

This will:
1. Check prerequisites
2. Set up environment variables for local development
3. Install dependencies
4. Start a local Supabase instance
5. Initialize Git repository
6. Start the landing page on http://localhost:3000
7. Start the application on http://localhost:3001

### Production Deployment

```bash
# Make sure you're authenticated with all services
supabase login
vercel login
flyctl auth login
wrangler login

# Bootstrap production environment
npm run bootstrap:prod
# or
./bootstrap-production.sh
```

This will:
1. Create real production resources:
   - Supabase project
   - Vercel projects for landing and app
   - Fly.io application
   - Cloudflare Worker
2. Deploy database migrations
3. Deploy Supabase Edge Functions
4. Deploy Fly.io application
5. Deploy Vercel projects
6. Configure local environment to use production values

## Development Workflow

Once set up, you can use these commands:

```bash
# Start the landing page server
cd landing && npm run dev

# Start the app server 
cd app && npm run dev

# Start Supabase locally
cd supabase && supabase start

# Stop Supabase
cd supabase && supabase stop

# Build all packages
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## Components

### Landing Page

Marketing site built with Next.js and TailwindCSS, featuring:
- Mailing list signup
- Features showcase
- Pricing plans
- Call-to-action sections

### Application Frontend

Protected application built with Next.js, featuring:
- Supabase Authentication (Magic Link, Google, GitHub)
- Dashboard
- Analytics/Usage page
- Settings page for account configuration

### Backend Components

- **Supabase Edge Functions**: Serverless functions for API endpoints
- **CodeSandbox.io Integration**: Code for executing untrusted code is integrated directly into Fly.io or other server-side components as needed
- **Fly.io App**: Full VM runtime for more complex backend needs
- **Cloudflare Workers**: Edge computing functions

## Database

PostgreSQL database hosted on Supabase with:
- Structured migrations
- Row-level security policies
- Automatic triggers for user creation and updates

## Deployment

Each component has its own deployment pipeline:

- **Frontend**: Deployed to Vercel
- **Supabase**: Edge Functions and migrations
- **Fly.io**: Docker container deployment
- **Cloudflare**: Workers deployment

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and workflows.

## License

MIT