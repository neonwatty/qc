# Skill: db-migrate

## Description

Create a new Supabase database migration and apply it locally.

## Instructions

1. Generate a timestamped SQL migration file in `supabase/migrations/` using the format:

   ```
   YYYYMMDDHHMMSS_description.sql
   ```

   Use the current UTC timestamp and a snake_case description of the change.

2. Write the SQL migration with:
   - The schema change (CREATE TABLE, ALTER TABLE, etc.)
   - Row Level Security (RLS) enabled on any new tables: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
   - RLS policies for the table covering at minimum:
     - SELECT: users can read their own rows (`auth.uid() = user_id`)
     - INSERT: users can insert their own rows
     - UPDATE: users can update their own rows
     - DELETE: users can delete their own rows
   - Appropriate indexes for foreign keys and frequently queried columns

3. Apply the migration locally:

   ```bash
   supabase db push
   ```

4. Verify the migration applied cleanly with no errors.

## Example

```sql
-- supabase/migrations/20250115120000_create_projects.sql

CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);
```
