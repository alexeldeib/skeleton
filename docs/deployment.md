# Deployment Guide

This guide covers deploying the SaaS template to production environments.

## Prerequisites

- Supabase account (https://supabase.com)
- Vercel account (https://vercel.com)
- Fly.io account (https://fly.io)
- Authenticated CLI tools:
  ```bash
  supabase login
  vercel login
  fly auth login
  ```

## Quick Deploy

For automated deployment:

```bash
./setup.sh --prod   # Set up production environment
./setup.sh --deploy # Deploy all components
```

## Manual Deployment Steps

### 1. Database (Supabase)

```bash
# Create project
supabase projects create my-saas-app --org-id <your-org-id>

# Link to local config
supabase link --project-ref <project-id>

# Push migrations
supabase db push

# Deploy edge functions
supabase functions deploy
```

### 2. Backend (Fly.io)

```bash
# In backend directory
cd backend

# Create app
fly apps create my-saas-app-backend

# Set secrets
fly secrets set \
  SUPABASE_URL=https://<project-id>.supabase.co \
  SUPABASE_SERVICE_KEY=<service-key>

# Deploy
fly deploy
```

### 3. Frontend (Vercel)

```bash
# Deploy landing page
cd landing
vercel --prod

# Deploy app
cd app
vercel --prod
```

## Environment Variables

### Supabase
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Public API key
- `SUPABASE_SERVICE_KEY`: Secret service role key

### Frontend
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key
- `NEXT_PUBLIC_API_URL`: URL to backend API (if used)

### Backend
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Secret service role key
- `PORT`: Port for the server (usually 8080)

## Custom Domains

### Vercel

1. Add your domain in Project Settings > Domains
2. Configure DNS records as instructed by Vercel
3. Wait for domain verification

### Supabase Auth Configuration

After setting up custom domains, update Redirect URLs in Supabase:

1. Go to Authentication > URL Configuration
2. Add your new domains to "Redirect URLs" (e.g., `https://app.yourdomain.com/**`)

## Monitoring & Logs

- Supabase: Project Dashboard > Logs
- Vercel: Project > Deployments > Specific Deployment > Functions
- Fly.io: `fly logs`

## Continuous Deployment

Example GitHub Action workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Deploy Database
        run: |
          npm install -g supabase
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Deploy Frontend
        run: |
          npm install -g vercel
          cd app
          vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Backend
        run: |
          curl -L https://fly.io/install.sh | sh
          cd backend
          ~/.fly/bin/fly deploy
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```