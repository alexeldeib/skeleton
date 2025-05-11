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
    const { metric_name, metric_value, project_id } = await req.json()
    
    if (!metric_name || metric_value === undefined || !project_id) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: metric_name, metric_value, project_id' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate that the project exists and user has access
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single()
    
    if (projectError || !project) {
      return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if user is project owner or member
    if (project.owner_id !== user.id) {
      const { data: member, error: memberError } = await supabaseClient
        .from('project_members')
        .select('*')
        .eq('project_id', project_id)
        .eq('user_id', user.id)
        .single()
      
      if (memberError || !member) {
        return new Response(JSON.stringify({ error: 'Access denied to this project' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Record usage metric
    const { data: usageMetric, error: usageError } = await supabaseClient
      .from('usage_metrics')
      .insert({
        user_id: user.id,
        project_id,
        metric_name,
        metric_value,
      })
      .select()
      .single()
    
    if (usageError) {
      return new Response(JSON.stringify({ error: usageError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        message: 'Usage metric recorded successfully',
        usage_metric: usageMetric,
      }),
      {
        status: 201,
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