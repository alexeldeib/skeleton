import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Check required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'PORT',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is required but not set.`);
    process.exit(1);
  }
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const verifyAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error: any) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Resource-intensive endpoint example (better suited for VM than edge function)
app.post('/api/process', verifyAuth, async (req, res) => {
  try {
    const { data } = req.body;
    const user = req.user;
    
    if (!data) {
      return res.status(400).json({ error: 'Missing data parameter' });
    }
    
    // Simulate processing
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Track usage
    await supabase
      .from('usage_metrics')
      .insert({
        user_id: user.id,
        metric_name: 'api_process',
        metric_value: 1
      });
    
    res.status(200).json({
      result: `Processed: ${JSON.stringify(data)}`,
      processing_time: Date.now() - startTime,
      user_id: user.id
    });
  } catch (error: any) {
    console.error('Process error:', error);
    res.status(500).json({ error: error.message || 'Processing failed' });
  }
});

// Proxy endpoint example
app.post('/api/proxy', verifyAuth, async (req, res) => {
  try {
    const { url } = req.body;
    const user = req.user;
    
    if (!url) {
      return res.status(400).json({ error: 'Missing URL parameter' });
    }
    
    // Make the request
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Proxy request failed', 
        status: response.status 
      });
    }
    
    const data = await response.text();
    
    // Track usage
    await supabase
      .from('usage_metrics')
      .insert({
        user_id: user.id,
        metric_name: 'api_proxy',
        metric_value: 1
      });
    
    res.status(200).json({ 
      success: true,
      data,
      user_id: user.id
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message || 'Proxy request failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});