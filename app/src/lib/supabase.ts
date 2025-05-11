import { createClient } from '@supabase/supabase-js';

// Default values for local development
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
// Use placeholder - actual key must be in .env.local
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'MISSING_ANON_KEY_PLEASE_CHECK_ENV';

// Log connection details during initialization
console.log('Initializing Supabase client with:', {
  url: SUPABASE_URL,
  keyLength: SUPABASE_ANON_KEY.length,
  keyPrefix: SUPABASE_ANON_KEY.substring(0, 10) + '...', // Only log prefix for security
  keySuffix: '...' + SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 10) // Log suffix for debugging
});

try {
  // Test the URL with a fetch before creating client
  fetch(`${SUPABASE_URL}/auth/v1/settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    }
  })
  .then(response => {
    console.log('Supabase API test response:', response.status, response.statusText);
    if (!response.ok) {
      console.error('Supabase API test failed:', response.status, response.statusText);
      response.text().then(text => console.error('Error details:', text));
    }
  })
  .catch(err => console.error('Supabase API test fetch error:', err));
} catch (error) {
  console.error('Supabase API test setup error:', error);
}

// Create Supabase client
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);

export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];