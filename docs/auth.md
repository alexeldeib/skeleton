# Authentication System

This SaaS template uses Supabase for authentication.

## Supported Methods

- **Magic Link**: Email-based passwordless login
- **OAuth**: Google, GitHub

## Setup

Authentication is pre-configured in the template. To customize:

1. Update auth providers in Supabase dashboard
2. Modify `AuthPanel.tsx` for UI changes

## Flow

### Magic Link Flow

1. User enters email
2. Request is sent to Supabase
3. User receives email with link
4. Clicking link redirects to `/auth/callback`
5. Token is exchanged for session
6. User is redirected to dashboard

### OAuth Flow

1. User clicks provider button
2. Redirected to provider login
3. After successful login, redirected back to app
4. Token is exchanged via `/auth/callback`
5. User is redirected to dashboard

## Key Files

- `/app/src/components/auth/AuthPanel.tsx`: Main auth UI
- `/app/src/app/auth/callback/route.ts`: Handles auth redirects
- `/app/src/lib/supabase.ts`: Client configuration

## Error Handling

The authentication system includes:

- Form validation
- Network error detection
- User-friendly error messages
- Loading states

## Testing Auth

Run dedicated auth tests:

```bash
./tests/run-tests.sh
```

## Custom Configuration

### Redirect URLs

Set allowed redirect URLs in Supabase dashboard:
Auth > URL Configuration > Redirect URLs

### Email Templates

Customize email templates in Supabase dashboard:
Auth > Email Templates

### Session Management

Default session duration is 24 hours. To change:

1. Supabase Dashboard > Auth > Providers
2. Adjust "Session expiry"