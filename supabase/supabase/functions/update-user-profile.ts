// Follow this Supabase Edge Function format
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.26.0'

serve(async (req) => {
  try {
    // Get authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get JWT token from authorization header
    const token = authorization.replace('Bearer ', '')
    
    // Create a Supabase client with the auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    // Get current user data
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError) {
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get request body
    const { full_name, avatar_url } = await req.json()
    
    // Update user metadata in auth
    const { error: updateUserError } = await supabaseClient.auth.updateUser({
      data: { 
        full_name,
        avatar_url
      }
    })
    
    if (updateUserError) {
      return new Response(JSON.stringify({ error: updateUserError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Update profiles table (should happen automatically via trigger, but just to be sure)
    const { data: updatedProfile, error: updateProfileError } = await supabaseClient
      .from('profiles')
      .update({ 
        full_name,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (updateProfileError) {
      return new Response(JSON.stringify({ error: updateProfileError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Log the update in audit_logs
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'profile_updated',
        entity_type: 'profile',
        entity_id: user.id,
        metadata: { full_name, avatar_url }
      })

    return new Response(
      JSON.stringify({
        message: 'Profile updated successfully',
        profile: updatedProfile
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})