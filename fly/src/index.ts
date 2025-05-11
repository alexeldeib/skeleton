import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Check if required environment variables are set
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'PORT',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is required but not set.`);
    process.exit(1);
  }
}

// Create Supabase client with service key
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

// Verify auth middleware
const verifyAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Example complex computation endpoint (that might be better suited for a VM than an edge function)
app.post('/api/compute', verifyAuth, async (req, res) => {
  try {
    const { data, options } = req.body;
    const user = req.user;
    
    if (!data || !options) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // This is where you would put your complex computation
    // For this example, we'll just simulate a delay
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Track usage
    await supabase
      .from('usage_metrics')
      .insert({
        user_id: user.id,
        project_id: options.project_id,
        metric_name: 'heavy_computation',
        metric_value: 1
      });
    
    // Return result
    res.status(200).json({
      result: `Computation complete for ${JSON.stringify(data)}`,
      computation_time: Date.now() - startTime,
      user_id: user.id
    });
  } catch (error: any) {
    console.error('Computation error:', error);
    res.status(500).json({ error: error.message || 'Computation failed' });
  }
});

// File processing endpoint (example of a more intensive task suited for a VM)
app.post('/api/process-files', verifyAuth, async (req, res) => {
  try {
    const { file_urls, options } = req.body;
    const user = req.user;
    
    if (!file_urls || !Array.isArray(file_urls) || !options) {
      return res.status(400).json({ error: 'Missing or invalid parameters' });
    }
    
    // Simulate file processing
    console.log(`Processing ${file_urls.length} files for user ${user.id}`);
    
    // Track usage
    await supabase
      .from('usage_metrics')
      .insert({
        user_id: user.id,
        project_id: options.project_id,
        metric_name: 'file_processing',
        metric_value: file_urls.length
      });
    
    // Return result
    res.status(200).json({
      message: `Successfully processed ${file_urls.length} files`,
      processed_files: file_urls.map(url => ({ url, status: 'processed' }))
    });
  } catch (error: any) {
    console.error('File processing error:', error);
    res.status(500).json({ error: error.message || 'File processing failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});