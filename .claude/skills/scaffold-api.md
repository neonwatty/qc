# Skill: scaffold-api

## Description

Generate a Next.js API route at `src/app/api/[resource]/route.ts` with auth, validation, and error handling.

## Instructions

1. Create the route file at `src/app/api/<resource>/route.ts`.

2. Use this template structure:

```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const CreateSchema = z.object({
  // Define fields based on the resource
})

const UpdateSchema = CreateSchema.partial()

export async function GET(request: NextRequest): Promise<Response> {
  const user = await requireAuth()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('<resource>')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await requireAuth()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('<resource>')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data, { status: 201 })
}
```

3. For routes with dynamic segments (`[id]`), create at `src/app/api/<resource>/[id]/route.ts`:
   - GET: fetch single record with ownership check (404 if not found, 403 if not owner)
   - PATCH: validate with partial schema, update with ownership check
   - DELETE: delete with ownership check

4. Always include:
   - Auth check via `requireAuth()` as the first operation
   - Zod validation for request bodies
   - Ownership filter (`user_id = auth.uid()`) on all queries
   - Proper HTTP status codes: 200, 201, 400, 401, 403, 404, 500
   - `Response.json()` for all returns
