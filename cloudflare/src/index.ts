export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

// Helper function to validate auth token with Supabase
async function validateToken(request: Request, env: Env): Promise<any> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Call Supabase to validate token
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': env.SUPABASE_ANON_KEY
    }
  });
  
  if (!response.ok) {
    return null;
  }
  
  return await response.json();
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Example API endpoint that requires authentication
    if (url.pathname === '/api/proxy' && request.method === 'POST') {
      const userInfo = await validateToken(request, env);
      
      if (!userInfo) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      let data;
      try {
        data = await request.json();
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Example of proxying to another service
      const targetUrl = data.url;
      
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'Missing target URL' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      try {
        const proxiedResponse = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'SaaS-App-Worker/1.0'
          }
        });
        
        if (!proxiedResponse.ok) {
          return new Response(JSON.stringify({ 
            error: 'Proxy request failed',
            status: proxiedResponse.status
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        const proxyData = await proxiedResponse.text();
        
        return new Response(JSON.stringify({ 
          success: true,
          data: proxyData,
          user_id: userInfo.id
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: 'Proxy request failed',
          message: error.message
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
    
    // Route not found
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  },
};