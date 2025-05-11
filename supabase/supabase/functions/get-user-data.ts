// Follow this Supabase Edge Function format
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.26.0'

interface WebhookPayload {
  type: string
  [key: string]: any
}

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

    // Get user profile data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get user subscription data
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    // Get user projects
    const { data: projects, error: projectsError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)

    // Get projects where user is a member
    const { data: memberProjects, error: memberProjectsError } = await supabaseClient
      .from('project_members')
      .select('project_id, role, projects:project_id(*)')
      .eq('user_id', user.id)
    
    // Combine owner projects and member projects
    const allProjects = [
      ...(projects || []),
      ...(memberProjects?.map(mp => ({
        ...mp.projects,
        role: mp.role
      })) || [])
    ]

    // Get usage metrics
    const { data: usageMetrics, error: usageMetricsError } = await supabaseClient
      .from('usage_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(10)

    // Return comprehensive user data
    return new Response(
      JSON.stringify({
        user,
        profile,
        subscription,
        projects: allProjects,
        usageMetrics,
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