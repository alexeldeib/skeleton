require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'not set');

// Test connection by trying to get all rows from a non-existent table (will fail with permission denied, but shows connection works)
async function testConnection() {
  try {
    const { data, error } = await supabase.from('test_table').select('*').limit(1);

    if (error) {
      // The error "relation does not exist" (PGRST116) actually means
      // our connection is working - we just don't have this table
      if (error.message.includes('does not exist')) {
        console.log('✅ Connection successful! (Got expected error: table does not exist)');
        console.log('    This confirms our Supabase connection is working properly!');
      } else {
        console.log('❌ Connection test failed with error:', error.message);
      }
    } else {
      console.log('✅ Connection successful! Received data:', data);
    }
  } catch (err) {
    console.error('❌ Connection test failed with exception:', err.message);
  }
}

testConnection();