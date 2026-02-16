# nextjs-supabase-template

Production-ready Next.js 16 template with Supabase auth, Stripe payments, Resend email, and a full Claude Code development setup.

## What's Included

- **Next.js 16** with App Router, React 19, TypeScript strict mode, Turbopack
- **Supabase** auth (SSR cookies), Postgres with RLS, local dev environment
- **Stripe** subscription management with webhook handlers (free/pro tiers)
- **Resend** transactional email with React Email templates
- **Zustand** state management with request deduplication
- **Zod** schema validation for all external inputs
- **Tailwind CSS 4** with oklch color system and dark mode
- **Capacitor** for iOS app builds (dual build mode: server for Vercel, static export for iOS)
- **Claude Code** with 15 skills, 3 agents, hooks for auto-formatting and file protection
- **GitHub Actions CI** with lint, typecheck, unit tests, E2E (Playwright + local Supabase), and dead code detection
- **Makefile** with 30+ targets for dev, database, build, test, and iOS workflows

## Quick Start

### 1. Create a new repo from this template

```bash
gh repo create my-app --template neonwatty/nextjs-supabase-template --clone
cd my-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase locally

```bash
npx supabase start
npx supabase db push
```

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values, or set up [Doppler](https://www.doppler.com/) for secrets management:

```bash
cp .env.example .env.local
```

### 5. Start the dev server

```bash
npm run dev:local    # uses .env.local
npm run dev          # uses Doppler
```

## Project Structure

```
src/
  app/
    (auth)/              Login, signup pages
    (dashboard)/         Protected dashboard pages
    api/
      health/            Health check endpoint
      cron/              Vercel cron jobs
      stripe/webhook/    Stripe webhook handler
      email/webhook/     Resend webhook handler
    auth/callback/       OAuth callback handler
  components/            Shared UI components
  hooks/                 Client-side React hooks
  lib/
    auth.ts              requireAuth(), getUserOrNull()
    email/               Resend client, send helpers, templates
    stripe/              Stripe client, plan config
    subscription/        Server-side subscription checks
    supabase/            Client trio (browser, server, admin) + middleware
    utils.ts             cn(), case transforms
    validation.ts        Zod schemas, validate() helper
  middleware.ts          Auth session refresh, route protection, security headers
  store/                 Zustand stores
  test/                  Test setup and mocks
  types/                 Shared TypeScript types
supabase/
  config.toml            Local dev config (ports 54321-54324)
  migrations/            SQL migrations (append-only)
  seed.sql               Local dev seed data
```

## Architecture

### Supabase Client Trio

Three clients for different contexts -- never mix them:

| Client | File | Context | Auth |
|--------|------|---------|------|
| `createClient` | `lib/supabase/client.ts` | Client components | Cookie |
| `createClient` | `lib/supabase/server.ts` | Server components/actions | Cookie |
| `createAdminClient` | `lib/supabase/admin.ts` | Webhooks, cron jobs | Service role |

### Auth Flow

1. Middleware refreshes Supabase session on every request
2. Protected routes redirect to `/login?redirect=<path>` when unauthenticated
3. `requireAuth()` returns `{ user, supabase }` for server components
4. OAuth callback at `/auth/callback` exchanges code for session

### Subscription Tiers

| Plan | Limits | Price |
|------|--------|-------|
| Free | 10 items | $0/mo |
| Pro | 1000 items | $10/mo |

Configure in `src/lib/stripe/client.ts`.

## Commands

```bash
# Development
npm run dev              # Doppler + Turbopack
npm run dev:local        # Local env only

# Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript strict
npm run format           # Prettier
npm run knip             # Dead code detection
npm run check            # All of the above + tests

# Testing
npm run test             # Vitest (single pass)
npm run test:coverage    # Vitest with coverage
npm run test:e2e         # Playwright E2E

# Database (via Makefile)
make supabase-start      # Start local Supabase
make db-reset            # Reset DB (migrations + seed)
make db-new name=X       # Create new migration

# iOS
make ios-build           # Build static export + sync
make ios-open            # Open in Xcode
```

See `make help` for the full list of Makefile targets.

## Claude Code Setup

### Hooks

- **PreToolUse**: blocks edits to `.env` files, `package-lock.json`, and existing migrations
- **PostToolUse**: auto-runs ESLint fix + Prettier on every file edit

### Skills (15)

**Project-specific:** `scaffold-api`, `db-migrate`, `gen-test`, `audit-rls`, `monitor-ci`, `ship`

**Development workflow:** `feature-dev`, `code-review`, `systematic-debugging`, `test-driven-development`, `pr-creator`, `validator`, `brainstorming`, `bug-interview`, `feature-interview`

### Agents (3)

`code-reviewer`, `security-reviewer`, `test-writer`

### MCP Servers

- **supabase** -- database queries and management
- **context7** -- documentation lookups

## Code Style

- No semicolons
- Single quotes
- Trailing commas
- 120 character line width
- 2 space indentation
- Max 300 lines per file (enforced by ESLint)
- Max 150 lines per function (enforced by ESLint)

## Environment Variables

All secrets managed via [Doppler](https://www.doppler.com/). See `.env.example` for the full list:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend email API key |
| `CRON_SECRET` | Authenticates Vercel cron requests |

## CI Pipeline

GitHub Actions runs on push to `main` and on pull requests:

1. **lint-and-typecheck** -- ESLint + `tsc --noEmit`
2. **unit-tests** -- Vitest with coverage
3. **e2e-tests** -- Playwright with local Supabase (2 shards)
4. **knip** -- Dead code detection

## License

MIT
