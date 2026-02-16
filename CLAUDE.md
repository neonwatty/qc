# CLAUDE.md

Project reference for Claude Code. Read this file first before making any changes.

## Project Overview

Production-ready Next.js template with Supabase auth, Stripe payments, Resend email, and Zustand state management. Deployed on Vercel with Doppler for secrets.

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack) |
| Language   | TypeScript 5.9 (strict mode)       |
| Auth       | Supabase Auth (SSR cookies)        |
| Database   | Supabase (Postgres + RLS)          |
| Payments   | Stripe (webhooks + checkout)       |
| Email      | Resend + React Email               |
| State      | Zustand 5                          |
| Styling    | Tailwind CSS 4                     |
| Testing    | Vitest + Playwright                |
| Linting    | ESLint 9 + Prettier 3              |
| Dead Code  | Knip                               |
| CI         | GitHub Actions                     |
| Deployment | Vercel (auto-deploy on push)       |
| Secrets    | Doppler                            |
| Mobile     | Capacitor (iOS)                    |

## Directory Structure

```
src/
  app/
    (auth)/           # Login, signup pages
    (dashboard)/      # Protected dashboard pages
    api/
      health/         # Health check endpoint
      cron/           # Cron job routes (Vercel cron)
      stripe/webhook/ # Stripe webhook handler
      email/webhook/  # Resend webhook handler
    auth/callback/    # OAuth callback handler
    globals.css       # Tailwind + CSS variables
    layout.tsx        # Root layout (Inter font, Analytics)
    providers.tsx     # Client providers wrapper
    page.tsx          # Landing page (redirects if authed)
  components/         # Shared UI components
  hooks/              # Client-side React hooks
  lib/
    auth.ts           # requireAuth(), getUserOrNull()
    email/            # Resend client, send helpers, templates
    stripe/           # Stripe client, plan config
    subscription/     # Server-side subscription checks
    supabase/         # Supabase client trio + middleware
    utils.ts          # cn(), case transforms
    validation.ts     # Zod schemas, validate() helper
  middleware.ts       # Auth session refresh, route protection
  store/              # Zustand stores
  test/               # Test setup and mocks
  types/              # Shared TypeScript types
supabase/
  config.toml         # Local Supabase config
  migrations/         # SQL migration files (append-only)
  seed.sql            # Local dev seed data
```

## Commands

```bash
# Development
npm run dev              # Start dev server (Doppler + Turbopack)
npm run dev:local        # Start dev server (local env only)

# Quality
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run typecheck        # TypeScript type check
npm run knip             # Detect dead code
npm run check            # All quality checks (lint + typecheck + format:check + test)

# Testing
npm run test             # Vitest run (single pass)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Vitest with coverage
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright with UI

# Build
npm run build            # Production build
npm run start            # Start production server

# Database (via Makefile)
make supabase-start      # Start local Supabase
make supabase-stop       # Stop local Supabase
make db-reset            # Reset DB (migrations + seed)
make db-migrate          # Run pending migrations
make db-new name=X       # Create new migration file
make db-push             # Push migrations to local Supabase
make db-pull             # Pull remote schema as migration
```

## Architecture

### Supabase Client Trio

Three Supabase clients for different contexts -- never mix them:

| Client              | File                     | Context                   | Auth         |
| ------------------- | ------------------------ | ------------------------- | ------------ |
| `createClient`      | `lib/supabase/server.ts` | Server components/actions | Cookie       |
| `createClient`      | `lib/supabase/client.ts` | Client components         | Cookie       |
| `createAdminClient` | `lib/supabase/admin.ts`  | Webhooks, cron jobs       | Service role |

### Auth Flow

1. Middleware (`src/middleware.ts`) refreshes session on every request
2. Public routes: `/`, `/login`, `/signup`, `/auth/callback`, `/api/health`, webhooks, cron
3. Protected routes redirect to `/login?redirect=<original_path>` when unauthenticated
4. `requireAuth()` returns `{ user, supabase }` -- use in server components/actions
5. `getUserOrNull()` returns `User | null` -- use for conditional rendering

### Middleware Pattern

- Refreshes Supabase auth cookies on every request
- Protects all routes except explicit public routes
- Adds security headers (X-Frame-Options, CSP, Referrer-Policy)
- Runs before every route via Next.js matcher

### Server/Client Boundary

- Server Components by default -- add `'use client'` only when needed
- `'use client'` only for hooks, event handlers, browser APIs
- Server actions validate inputs with Zod before any mutation
- Never pass sensitive data (service keys, tokens) as component props

## Conventions

### Code Style

- **No semicolons** -- enforced by Prettier
- **Single quotes** -- enforced by Prettier
- **Trailing commas** -- enforced by Prettier (`trailingComma: 'all'`)
- **120 character line width** -- enforced by Prettier
- **2 space indentation** -- enforced by Prettier/EditorConfig
- **Prefer `function` keyword** over arrow functions for top-level declarations
- **Explicit return types** on exported functions
- **No nested ternaries** -- use if/else or switch

### File Rules

- Max 300 lines per file -- split if larger
- Colocate tests next to source: `auth.ts` -> `auth.test.ts`
- Use `@/` path alias for all imports (configured in tsconfig)
- Import order: external packages, then `@/` imports, separated by blank line

### Naming

- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Functions: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Database columns: `snake_case`

### TypeScript

- Strict mode enabled -- no `any` types
- Use `unknown` with type guards instead of `any`
- Zod for runtime validation of external data (API inputs, form data)
- Explicit `Props` type for every React component

## Database

### Migration Workflow

1. Create migration: `make db-new name=add_projects`
2. Write SQL in the generated file (include RLS policies)
3. Apply locally: `make db-push`
4. Test locally, then commit the migration file
5. Migrations run automatically on Vercel deploy

### RLS Patterns

Every table in `public` schema MUST have:

- RLS enabled: `ALTER TABLE public.X ENABLE ROW LEVEL SECURITY`
- SELECT policy: `USING (auth.uid() = user_id)`
- INSERT policy: `WITH CHECK (auth.uid() = user_id)`
- UPDATE policy: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- DELETE policy: `USING (auth.uid() = user_id)`

Trigger functions use `SECURITY DEFINER SET search_path = ''` for safety.

### Existing Tables

- `profiles` -- auto-created on signup via trigger, references `auth.users`
- `subscriptions` -- auto-created when profile is created, one per user

## Claude Code Features

### Hooks (`.claude/settings.json`)

- **PreToolUse (protect-files)**: blocks edits to `.env` files, `package-lock.json`, and existing migration files
- **PostToolUse (auto-format)**: runs ESLint fix + Prettier on every file after edit/write

### Skills (`.claude/skills/`)

**Project-specific:**

| Skill          | Description                                              |
| -------------- | -------------------------------------------------------- |
| `scaffold-api` | Generate API route with auth, validation, error handling |
| `db-migrate`   | Create and apply a Supabase migration                    |
| `gen-test`     | Generate Vitest unit tests for a source file             |
| `audit-rls`    | Audit all tables for RLS policies                        |
| `monitor-ci`   | Check GitHub Actions CI status and diagnose failures     |
| `ship`         | Run quality pipeline and create PR or deploy             |

**Development workflow:**

| Skill                     | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| `feature-dev`             | Guided 7-phase feature development with codebase exploration   |
| `code-review`             | Multi-angle PR code review with confidence scoring             |
| `systematic-debugging`    | 4-phase root cause investigation before proposing fixes        |
| `test-driven-development` | Red-Green-Refactor TDD cycle                                   |
| `pr-creator`              | Create PR, monitor CI, fix failures until green                |
| `validator`               | Auto-detect project and run lint, typecheck, tests, knip       |
| `brainstorming`           | Explore intent, requirements, and design before implementation |
| `bug-interview`           | Deep bug triage interview to isolate root cause                |
| `feature-interview`       | Deep feature discovery interview before implementation         |

### Agents (`.claude/agents/`)

| Agent               | Description                                     |
| ------------------- | ----------------------------------------------- |
| `code-reviewer`     | Review changes for quality, auth, RLS, patterns |
| `security-reviewer` | Audit for RLS, auth bypass, key exposure, XSS   |
| `test-writer`       | Generate Vitest + Playwright tests              |

### MCP Servers (`.mcp.json`)

- **supabase**: Supabase MCP server for database queries
- **context7**: Context7 MCP server for documentation lookups

## Deployment

### Vercel

- Auto-deploys on push to `main`
- Preview deploys on pull requests
- Build command: `next build`
- Environment variables managed via Doppler integration

### Environment Variables

All secrets live in Doppler. See `.env.example` for the full list:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- public Supabase config
- `SUPABASE_SERVICE_ROLE_KEY` -- server-only admin access
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` -- Stripe config
- `RESEND_API_KEY` -- email service
- `CRON_SECRET` -- authenticates Vercel cron requests

## Testing

### Unit Tests (Vitest)

- Config: `vitest.config.ts` with `vitest.setup.ts`
- Mock Supabase via `src/test/mocks/supabase.ts`
- Mock Next.js navigation/headers via `src/test/setup.ts`
- AAA pattern: Arrange, Act, Assert
- Reset mocks in `beforeEach`

### E2E Tests (Playwright)

- Config: `playwright.config.ts`
- Tests live in `e2e/` directory
- CI runs with sharded Playwright (2 shards)
- Uses local Supabase instance in CI

### CI Pipeline (GitHub Actions)

Runs on push to `main` and pull requests:

1. **lint-and-typecheck**: ESLint + `tsc --noEmit`
2. **unit-tests**: Vitest with coverage
3. **e2e-tests**: Playwright with local Supabase (after lint + unit pass)
4. **knip**: Dead code detection

## Guardrails

- **Retry limit**: max 3 attempts on any failing operation before stopping
- **Never edit existing migrations**: create a new migration instead (enforced by hook)
- **Never expose service role key**: only use in `lib/supabase/admin.ts`, webhooks, and cron
- **Never commit `.env` files**: use Doppler (enforced by hook)
- **Never use `any`**: use `unknown` with type guards
- **Never skip auth checks**: every API route and server action starts with `requireAuth()`
- **Always enable RLS**: every new table must have RLS enabled with ownership policies
- **Always validate inputs**: use Zod schemas for API inputs and form data
