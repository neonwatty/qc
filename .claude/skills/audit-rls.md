# Skill: audit-rls

## Description

Audit all Supabase tables to verify that Row Level Security (RLS) is enabled and policies exist. Reports any unprotected tables.

## Instructions

1. Query the database for all tables in the `public` schema and their RLS status:

```sql
SELECT
  t.tablename AS table_name,
  t.rowsecurity AS rls_enabled
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;
```

2. Query for existing RLS policies on each table:

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

3. Run these queries using one of:
   - `supabase db query` CLI command (preferred for local dev)
   - Supabase MCP server if available
   - Direct SQL via the Supabase management API

4. Analyze the results and report:

   **For each table, check:**
   - Is RLS enabled? (`rowsecurity = true`)
   - Are there policies for SELECT, INSERT, UPDATE, DELETE?
   - Do policies include ownership checks (`auth.uid() = user_id`)?
   - Are there any overly permissive policies (e.g., `USING (true)` without good reason)?

5. Output format:

```
## RLS Audit Report

### Protected Tables
- users: RLS enabled, 4 policies (SELECT, INSERT, UPDATE, DELETE)
- projects: RLS enabled, 4 policies (SELECT, INSERT, UPDATE, DELETE)

### UNPROTECTED Tables (action required)
- audit_logs: RLS DISABLED - no policies found
- settings: RLS enabled but MISSING policies for DELETE

### Warnings
- public_content: has permissive SELECT policy (USING true) - verify this is intentional
```

6. For any unprotected tables, suggest the appropriate RLS policies to add.
