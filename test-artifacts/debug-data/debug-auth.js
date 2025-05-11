// Debug Supabase auth connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugAuth() {
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Anon Key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('Supabase client created');
    
    // Test authentication methods
    try {
      console.log('Testing auth.getUser()...');
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error from getUser():', error);
      } else {
        console.log('getUser() succeeded:', data);
      }
    } catch (err) {
      console.error('Exception from getUser():', err);
    }
  } catch (error) {
    console.error('Error creating Supabase client:', error);
  }
}

debugAuth().catch(console.error);