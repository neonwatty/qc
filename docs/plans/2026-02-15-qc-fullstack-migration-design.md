# QC Full-Stack Migration Design

> Migrate the QC relationship wellness app from a client-side prototype to a full-stack app using the nextjs-supabase-template.

## Summary

QC (Quality Control) is a relationship wellness app for couples -- structured check-ins, notes with privacy levels, growth milestones, love languages, reminders, partner requests, and session settings. The current prototype (mean-weasel/qc-app, ~43K lines, 201 files) is client-side only with localStorage persistence.

This design describes migrating QC into a new repo (`mean-weasel/qc`) built on top of `mean-weasel/nextjs-supabase-template`, adding Supabase auth, Postgres persistence with RLS, real-time partner sync, Resend email notifications, Stripe subscriptions, and Capacitor iOS builds.

The migration uses a template-first approach with 8 parallel subagents, each owning a complete feature vertical.

## Decisions

| Decision           | Choice                                            | Rationale                                        |
| ------------------ | ------------------------------------------------- | ------------------------------------------------ |
| Repo name          | `qc`                                              | Short, clean                                     |
| Migration approach | Template-first, 8 parallel agents                 | Maximum parallelism                              |
| State management   | Keep 5 React Contexts, swap persistence           | Least churn (~1,600 lines adapted not rewritten) |
| Couple pairing     | Email invite via Resend                           | Leverages template email infra                   |
| One-spouse rule    | UNIQUE on `profiles.couple_id` + app-level checks | Explicit constraint                              |
| Real-time          | Supabase Realtime on 5 high-frequency tables      | Partner sync without polling                     |
| Subscriptions      | Free (limited) + Pro ($10/mo unlimited)           | Simple, clear value prop                         |
| Route structure    | `(app)` group with QC sidebar layout              | Clean separation from auth routes                |

## Database Schema

12 tables, all with RLS scoped to couple membership.

### Tables

```sql
-- Extended from template
profiles
  id uuid PK (refs auth.users)
  display_name text
  email text
  avatar_url text
  couple_id uuid (refs couples, UNIQUE)
  created_at timestamptz
  updated_at timestamptz

-- New tables
couples
  id uuid PK
  name text
  relationship_start_date date
  settings jsonb
  created_at timestamptz

couple_invites
  id uuid PK
  couple_id uuid (refs couples)
  invited_by uuid (refs profiles)
  invited_email text
  token text UNIQUE
  status text (pending/accepted/expired)
  created_at timestamptz
  expires_at timestamptz

check_ins
  id uuid PK
  couple_id uuid (refs couples)
  started_at timestamptz
  completed_at timestamptz
  status text (in-progress/completed/abandoned)
  categories text[]
  mood_before int
  mood_after int
  reflection text

notes
  id uuid PK
  couple_id uuid (refs couples)
  author_id uuid (refs profiles)
  check_in_id uuid (refs check_ins, nullable)
  content text
  privacy text (private/shared/draft)
  tags text[]
  category_id text
  created_at timestamptz
  updated_at timestamptz

action_items
  id uuid PK
  couple_id uuid (refs couples)
  check_in_id uuid (refs check_ins)
  title text
  description text
  assigned_to uuid (refs profiles)
  due_date date
  completed boolean
  completed_at timestamptz
  created_at timestamptz

milestones
  id uuid PK
  couple_id uuid (refs couples)
  title text
  description text
  category text
  icon text
  achieved_at timestamptz
  rarity text (common/rare/epic/legendary)
  points int
  photo_url text

reminders
  id uuid PK
  couple_id uuid (refs couples)
  created_by uuid (refs profiles)
  title text
  message text
  category text (habit/check-in/action-item/special-date/custom)
  frequency text (once/daily/weekly/monthly/custom)
  scheduled_for timestamptz
  is_active boolean
  notification_channel text (in-app/email/both/none)
  custom_schedule jsonb

requests
  id uuid PK
  couple_id uuid (refs couples)
  requested_by uuid (refs profiles)
  requested_for uuid (refs profiles)
  title text
  description text
  category text (activity/task/reminder/conversation/date-night/custom)
  priority text (low/medium/high)
  status text (pending/accepted/declined/converted)
  suggested_date date
  created_at timestamptz

love_languages
  id uuid PK
  couple_id uuid (refs couples)
  user_id uuid (refs profiles)
  category text (words/acts/gifts/time/touch/custom)
  privacy text (private/shared)
  importance text (low/medium/high/essential)
  examples text[]
  created_at timestamptz

love_actions
  id uuid PK
  couple_id uuid (refs couples)
  linked_language_id uuid (refs love_languages)
  title text
  status text (suggested/planned/completed/recurring)
  frequency text (once/weekly/monthly/surprise)
  difficulty text (easy/moderate/challenging)
  completed_count int
  last_completed_at timestamptz

session_settings
  id uuid PK
  couple_id uuid (refs couples)
  session_duration int
  timeouts_per_partner int
  timeout_duration int
  turn_based_mode boolean
  turn_duration int
  allow_extensions boolean
  warm_up_questions boolean
  cool_down_time int
```

### RLS Pattern

Every table uses couple-scoped access:

```sql
USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()))
```

Exception: `notes` with `privacy = 'private'` adds `AND author_id = auth.uid()` to SELECT.

### Constraints

- `profiles.couple_id` has a UNIQUE constraint (one spouse per person)
- `couple_invites` checks invited user's `couple_id IS NULL` before accepting
- Couples limited to exactly 2 members (enforced at application level)

## Couple Pairing Flow

1. User A signs up via template auth (login/signup pages)
2. After auth callback, redirect to `/onboarding` (not `/dashboard`)
3. Onboarding collects: display name, partner's email, relationship start date
4. Creates `couples` row, sets User A's `profiles.couple_id`, creates `couple_invites` with unique token
5. Sends invite email via Resend with magic link to `/invite/[token]`
6. User B clicks link -> `/invite/[token]` -> redirects to signup if needed
7. After signup/login, token validated, User B's `profiles.couple_id` set, invite status -> accepted
8. Both users now see shared dashboard

Edge cases:

- Invite expires after 7 days, resendable from settings
- If partner already paired, invite rejected
- Unpair: either partner can leave from settings (nulls their couple_id)

## Parallel Agent Dispatch

### Sequential Foundation (before agents)

1. Create `qc` repo from template
2. Write all 6 migration files
3. Write shared TypeScript types (adapted from QC's types/)
4. Write `useRealtimeCouple()` hook
5. Write `lib/couples.ts` (couple CRUD + invite logic)
6. Merge package.json dependencies (add Framer Motion, Radix UI, canvas-confetti, date-fns, uuid, sonner)

### 8 Parallel Agents

| #   | Agent                | Scope                                                                                                 | Key Files                                                                                                                                                        |
| --- | -------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Auth + Couples       | Extend template auth, onboarding pages, invite flow, invite email template                            | onboarding/page.tsx, invite/[token]/page.tsx, lib/couples.ts, email/templates/invite.tsx                                                                         |
| 2   | Check-ins            | Port CheckInContext + BookendsContext + SessionSettingsContext, all checkin/ and bookends/ components | contexts/CheckInContext.tsx, contexts/BookendsContext.tsx, app/(app)/checkin/, components/checkin/, components/bookends/                                         |
| 3   | Notes                | Port notes components, Supabase queries with privacy filtering                                        | app/(app)/notes/, components/notes/, RichTextEditor, TagManager, BulkActions                                                                                     |
| 4   | Growth Gallery       | Port milestones, Supabase Storage for photos                                                          | app/(app)/growth/, components/growth/, MilestoneCard, PhotoUpload                                                                                                |
| 5   | Reminders + Requests | Port both feature sets, cron email job                                                                | app/(app)/reminders/, app/(app)/requests/, components/reminders/, components/requests/                                                                           |
| 6   | Love Languages       | Port LoveLanguagesContext + components                                                                | contexts/LoveLanguagesContext.tsx, app/(app)/love-languages/, components/love-languages/                                                                         |
| 7   | Settings             | Port all settings pages, session settings CRUD                                                        | app/(app)/settings/, components/settings/, CategoryManager, PromptLibrary, PromptTemplateEditor                                                                  |
| 8   | Layout + Dashboard   | Root layout, QC sidebar/header/mobile nav, dashboard hub, landing page, ThemeContext, animations      | app/(app)/layout.tsx, app/layout.tsx, app/page.tsx, components/layout/, components/dashboard/, components/Landing/, contexts/ThemeContext.tsx, lib/animations.ts |

### Post-Agent Integration

- Merge all agent outputs
- Resolve import conflicts
- Verify build compiles
- Run lint + typecheck

## Real-Time Partner Sync

### Tables with Realtime Subscriptions

- `notes` (shared only)
- `check_ins` (start/complete events)
- `action_items` (completion)
- `requests` (send/accept/decline)
- `love_actions` (completion)

### Tables Without Realtime (pull on page load)

- `milestones`, `reminders`, `love_languages`, `session_settings`, `profiles`, `couples`

### Implementation

A `useRealtimeCouple(tableName)` hook subscribing to Postgres changes filtered by `couple_id`. Each context provider calls this hook and merges incoming changes.

## Stripe Subscription Tiers

| Feature             | Free | Pro ($10/mo) |
| ------------------- | ---- | ------------ |
| Check-ins per month | 4    | Unlimited    |
| Notes               | 20   | Unlimited    |
| Milestones          | 5    | Unlimited    |
| Photo uploads       | 0    | Unlimited    |
| Reminder emails     | 0    | Unlimited    |
| Love languages      | 3    | Unlimited    |
| Export data         | No   | Yes          |

Uses template's existing Stripe webhook, subscriptions table, and `canUserDoAction()` helper.

## Repo Structure

```
qc/
├── .claude/                    # From template (15 skills, 3 agents, hooks)
├── .github/workflows/ci.yml   # From template
├── supabase/
│   ├── migrations/             # 6 migration files
│   ├── config.toml
│   └── seed.sql                # Optional demo couple for local dev
├── src/
│   ├── app/
│   │   ├── (auth)/             # login, signup (from template)
│   │   ├── (app)/              # Protected app shell
│   │   │   ├── dashboard/
│   │   │   ├── checkin/
│   │   │   ├── notes/
│   │   │   ├── growth/
│   │   │   ├── reminders/
│   │   │   ├── love-languages/
│   │   │   ├── requests/
│   │   │   ├── settings/
│   │   │   └── layout.tsx      # QC sidebar + header + mobile nav
│   │   ├── onboarding/         # Couple setup flow
│   │   ├── invite/[token]/     # Partner invite acceptance
│   │   ├── api/                # Template endpoints + cron
│   │   ├── auth/callback/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # QC landing page
│   │   └── globals.css         # QC pink theme
│   ├── components/             # ~125 components from QC
│   ├── contexts/               # 5 contexts rewritten for Supabase
│   ├── hooks/                  # QC hooks + useRealtimeCouple
│   ├── lib/
│   │   ├── supabase/           # Client trio + middleware (from template)
│   │   ├── email/              # Template + invite template
│   │   ├── stripe/             # From template
│   │   ├── auth.ts             # From template
│   │   ├── couples.ts          # Couple CRUD + invite logic
│   │   ├── animations.ts       # From QC
│   │   ├── text-formatting.ts  # From QC
│   │   └── haptics.ts          # From QC
│   ├── store/                  # Zustand (subscription state only)
│   ├── types/                  # QC types adapted for Supabase
│   └── middleware.ts           # From template
├── CLAUDE.md
├── Makefile
├── package.json                # Merged deps
└── ...config files
```

## What Stays, Changes, and Goes

### Stays As-Is

- All ~125 presentational components
- Framer Motion animations
- Radix UI primitives
- Touch gestures, haptics, page transitions
- CSS/theme system (pink gradients, oklch variables)

### Changes (localStorage -> Supabase)

- 5 Context providers rewritten for Supabase queries
- storage.ts replaced by Supabase client calls
- Types adapted (string IDs -> uuid, Date -> timestamptz)

### New

- Supabase migrations (12 tables + RLS)
- Couple pairing + email invite flow
- `/onboarding` and `/invite/[token]` routes
- `useRealtimeCouple()` hook
- Cron job for reminder emails
- Stripe subscription gating

### Removed

- demo-scenarios.ts, demo-reset.ts, mock-data.ts, mock-reminders.ts, mock-requests.ts
- All test-\* debug pages
- GitHub Pages config
- Static export config (basePath, assetPrefix)
- data-init.ts
