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
    const { name, description } = await req.json()
    
    if (!name) {
      return new Response(JSON.stringify({ error: 'Project name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check user's subscription for project limits
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (subscriptionError) {
      return new Response(JSON.stringify({ error: 'Error checking subscription' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Count existing projects
    const { count, error: projectCountError } = await supabaseClient
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
    
    if (projectCountError) {
      return new Response(JSON.stringify({ error: 'Error checking project count' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if user has reached project limit based on their plan
    const projectLimits = {
      'free': 1,
      'pro': 5,
      'enterprise': 100,
    }

    const limit = projectLimits[subscription.plan] || 1
    
    if (count >= limit) {
      return new Response(JSON.stringify({ 
        error: `You have reached your project limit for the ${subscription.plan} plan`
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create project
    const { data: project, error: createProjectError } = await supabaseClient
      .from('projects')
      .insert({
        name,
        description,
        owner_id: user.id,
      })
      .select()
      .single()
    
    if (createProjectError) {
      return new Response(JSON.stringify({ error: createProjectError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Add owner as project member
    const { error: memberError } = await supabaseClient
      .from('project_members')
      .insert({
        project_id: project.id,
        user_id: user.id,
        role: 'owner',
      })
    
    if (memberError) {
      // If adding the owner as a member fails, log the error but continue
      console.error('Error adding owner as project member:', memberError)
    }

    // Log project creation in audit_logs
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'project_created',
        entity_type: 'project',
        entity_id: project.id,
        metadata: { name, description }
      })

    return new Response(
      JSON.stringify({
        message: 'Project created successfully',
        project,
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