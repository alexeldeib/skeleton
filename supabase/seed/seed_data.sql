-- Seed data for the SaaS application
-- This file will seed the database with test data for development

-- Sample project data
INSERT INTO projects (id, name, description, owner_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo Project', 'A project used for demonstration purposes', 'replace-with-actual-user-id'),
  ('22222222-2222-2222-2222-222222222222', 'Test Project', 'A project used for testing', 'replace-with-actual-user-id');

-- Sample project members
-- Note: You'll need to replace these IDs with actual user IDs during real seeding
INSERT INTO project_members (project_id, user_id, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'replace-with-actual-user-id', 'owner'),
  ('22222222-2222-2222-2222-222222222222', 'replace-with-actual-user-id', 'owner');

-- Sample usage metrics
INSERT INTO usage_metrics (user_id, project_id, metric_name, metric_value)
VALUES 
  ('replace-with-actual-user-id', '11111111-1111-1111-1111-111111111111', 'api_calls', 150),
  ('replace-with-actual-user-id', '11111111-1111-1111-1111-111111111111', 'storage_usage_mb', 25.5),
  ('replace-with-actual-user-id', '22222222-2222-2222-2222-222222222222', 'api_calls', 75),
  ('replace-with-actual-user-id', '22222222-2222-2222-2222-222222222222', 'storage_usage_mb', 10.2);

-- Add some sample audit logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
VALUES 
  ('replace-with-actual-user-id', 'project_created', 'project', '11111111-1111-1111-1111-111111111111', 
   '{"name": "Demo Project", "description": "A project used for demonstration purposes"}'::jsonb),
  ('replace-with-actual-user-id', 'project_created', 'project', '22222222-2222-2222-2222-222222222222', 
   '{"name": "Test Project", "description": "A project used for testing"}'::jsonb),
  ('replace-with-actual-user-id', 'subscription_updated', 'subscription', NULL, 
   '{"old_plan": "free", "new_plan": "pro"}'::jsonb);