# Contributing

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/saas-template.git
cd saas-template

# Install dependencies and configure environment
./setup.sh
```

### Development Workflow

```bash
# Start all components
npm run dev

# Run tests
./tests/run-tests.sh
```

### Structure

- `app/`: Application frontend (Next.js)
- `landing/`: Marketing site (Next.js) 
- `supabase/`: Database, auth, edge functions
- `backend/`: Backend API server
- `tests/`: Automated tests
- `docs/`: Documentation

## Style Guide

- Use TypeScript for type safety
- Follow ESLint and Prettier configuration
- Use async/await for asynchronous code
- Add JSDoc comments for public APIs

## Submitting Changes

1. Create a branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit with descriptive messages

3. Push branch and open a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Wait for review and address feedback

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test across multiple browsers/devices

## Deployment

See [deployment.md](./deployment.md) for deployment instructions.