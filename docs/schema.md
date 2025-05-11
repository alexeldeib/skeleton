# Database Schema

This document describes the Supabase database schema.

## Core Tables

### profiles

Stores user profile information.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  email text unique,
  name text,
  avatar_url text
);

-- Access policies
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);
```

### projects

Stores project data for each user.

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  name text not null,
  description text,
  user_id uuid references profiles(id) on delete cascade not null
);

-- Access policies
alter table projects enable row level security;
create policy "Users can view their own projects" on projects
  for select using (auth.uid() = user_id);
create policy "Users can insert their own projects" on projects
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects" on projects
  for update using (auth.uid() = user_id);
create policy "Users can delete their own projects" on projects
  for delete using (auth.uid() = user_id);
```

### usage_metrics

Tracks user activity for analytics and billing.

```sql
create table usage_metrics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  user_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  metric_name text not null,
  metric_value integer not null
);

-- Access policies
alter table usage_metrics enable row level security;
create policy "Users can view their own metrics" on usage_metrics
  for select using (auth.uid() = user_id);
```

## Triggers

### Create Profile on User Signup

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Update Profile Timestamps

```sql
create or replace function public.update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger update_profile_timestamp
  before update on profiles
  for each row execute function public.update_timestamp();

create trigger update_project_timestamp
  before update on projects
  for each row execute function public.update_timestamp();
```

## Views

### user_summary

Aggregates user activity for quick access.

```sql
create view user_summary as
select
  p.id,
  p.email,
  p.name,
  count(proj.id) as project_count,
  sum(um.metric_value) as total_usage
from profiles p
left join projects proj on p.id = proj.user_id
left join usage_metrics um on p.id = um.user_id
group by p.id, p.email, p.name;
```

## Setting Up Locally

For local development, the setup script creates these tables automatically:

```bash
./setup.sh
```

## Migrations

Database migrations are in the `supabase/migrations` directory.

To apply:

```bash
cd supabase
supabase db reset   # Local development
supabase db push    # Production
```