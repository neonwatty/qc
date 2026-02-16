# QC Full-Stack Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the QC relationship wellness app from a client-side localStorage prototype into a full-stack app with Supabase auth, Postgres persistence, real-time partner sync, Stripe subscriptions, and Resend email.

**Architecture:** Template-first approach. Clone `neonwatty/nextjs-supabase-template` as the new `qc` repo, lay a sequential foundation (migrations, types, shared hooks, merged deps), then dispatch 8 parallel agents each owning a complete feature vertical. Post-agent integration merges outputs and verifies the build.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9 strict, Supabase (Postgres + RLS + Realtime + Storage), Stripe, Resend + React Email, Zustand 5, Tailwind CSS 4, Framer Motion, Radix UI, Capacitor (iOS)

**Source repos:**
- Template: `neonwatty/nextjs-supabase-template` (local: `/Users/jeremywatt/Desktop/nextjs-supabase-template/`)
- QC prototype: `neonwatty/qc-app` (GitHub, ~43K lines, 201 files)

---

## Phase 1: Repo Setup (sequential)

### Task 1: Create qc repo from template

**Files:**
- Create: new repo `neonwatty/qc` cloned from template

**Step 1: Create the repo**

```bash
cd ~/Desktop
gh repo create neonwatty/qc --template neonwatty/nextjs-supabase-template --clone --public
cd qc
```

**Step 2: Verify template files copied**

```bash
ls -la src/app/ src/lib/ supabase/ .claude/
```

Expected: All template files present (layout.tsx, middleware.ts, supabase clients, etc.)

**Step 3: Install dependencies**

```bash
npm install
```

Expected: Clean install, no errors

**Step 4: Verify dev server starts**

```bash
npx next build 2>&1 | tail -5
```

Expected: Build succeeds (may warn about missing env vars, that's fine)

**Step 5: Commit baseline**

```bash
git add -A && git commit -m "feat: initialize qc repo from nextjs-supabase-template"
git push origin main
```

---

### Task 2: Merge QC dependencies into package.json

**Files:**
- Modify: `package.json`

**Step 1: Add QC-specific dependencies**

Add these to the `dependencies` section of `package.json`:

```json
"framer-motion": "^12.23.12",
"@radix-ui/react-accordion": "^1.2.11",
"@radix-ui/react-avatar": "^1.1.14",
"@radix-ui/react-dialog": "^1.1.14",
"@radix-ui/react-dropdown-menu": "^2.1.15",
"@radix-ui/react-progress": "^1.1.7",
"@radix-ui/react-radio-group": "^1.3.7",
"@radix-ui/react-scroll-area": "^1.2.8",
"@radix-ui/react-select": "^2.2.5",
"@radix-ui/react-separator": "^1.1.7",
"@radix-ui/react-slider": "^1.3.5",
"@radix-ui/react-switch": "^1.2.5",
"@radix-ui/react-tabs": "^1.2.6",
"@radix-ui/react-tooltip": "^1.2.7",
"canvas-confetti": "^1.9.3",
"class-variance-authority": "^0.7.1",
"date-fns": "^4.1.0",
"lucide-react": "^0.542.0",
"sonner": "^2.0.7",
"tailwind-merge": "^3.3.1",
"tailwindcss-animate": "^1.0.7",
"uuid": "^11.1.0"
```

**Step 2: Install**

```bash
npm install
```

Expected: Clean install

**Step 3: Commit**

```bash
git add package.json package-lock.json && git commit -m "feat: add QC UI dependencies (framer-motion, radix, date-fns, etc.)"
```

---

### Task 3: Write Supabase migration 1 - extend profiles + create couples and couple_invites

**Files:**
- Create: `supabase/migrations/00003_couples_and_profiles.sql`

**Step 1: Write the migration**

```sql
-- Migration: couples table, extend profiles with couple_id, couple_invites

-- Couples table
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  relationship_start_date DATE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

-- Extend profiles with couple_id
ALTER TABLE public.profiles
  ADD COLUMN couple_id UUID REFERENCES public.couples(id) ON DELETE SET NULL,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- UNIQUE constraint: one person can only be in one couple
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_couple_id_unique UNIQUE (couple_id);

-- Wait: the UNIQUE on couple_id means only ONE profile can have a given couple_id.
-- That's wrong - two partners need the same couple_id.
-- Instead, enforce max 2 at application level. Remove UNIQUE, add a partial index or check.
-- Actually per design doc: UNIQUE on profiles.couple_id + app-level checks.
-- Re-reading: "UNIQUE on profiles.couple_id" would prevent two people sharing a couple.
-- The design intent is "one couple per person" not "one person per couple."
-- A person can only appear in one couple = each profile has at most one couple_id.
-- Two profiles CAN share the same couple_id (that's the pair).
-- So we do NOT want UNIQUE on couple_id. We want a CHECK or app-level limit.
-- Use a trigger to enforce max 2 members per couple.

-- Remove the UNIQUE we just added (it was wrong)
ALTER TABLE public.profiles
  DROP CONSTRAINT profiles_couple_id_unique;

-- Trigger: enforce max 2 members per couple
CREATE OR REPLACE FUNCTION public.check_couple_member_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.couple_id IS NOT NULL THEN
    IF (SELECT COUNT(*) FROM public.profiles WHERE couple_id = NEW.couple_id AND id != NEW.id) >= 2 THEN
      RAISE EXCEPTION 'A couple can have at most 2 members';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_couple_member_limit
  BEFORE INSERT OR UPDATE OF couple_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_couple_member_limit();

-- Couple invites table
CREATE TABLE public.couple_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

ALTER TABLE public.couple_invites ENABLE ROW LEVEL SECURITY;

-- RLS for couples: members can read/update their own couple
CREATE POLICY "Users can read own couple" ON public.couples
  FOR SELECT USING (id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own couple" ON public.couples
  FOR UPDATE USING (id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

-- Anyone authenticated can create a couple (during onboarding)
CREATE POLICY "Authenticated users can create couples" ON public.couples
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS for profiles: update own profile (couple_id column)
-- The template already has SELECT and UPDATE policies on profiles for auth.uid() = id
-- We need to ensure the UPDATE policy covers the new couple_id column (it does, since it's USING id = auth.uid())

-- RLS for couple_invites
CREATE POLICY "Users can read invites for their couple" ON public.couple_invites
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
    OR invited_email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create invites for their couple" ON public.couple_invites
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update invites for their couple" ON public.couple_invites
  FOR UPDATE USING (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
    OR invited_email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  );
```

**Step 2: Commit**

```bash
git add supabase/migrations/00003_couples_and_profiles.sql
git commit -m "feat: add couples, couple_invites tables and extend profiles"
```

---

### Task 4: Write Supabase migration 2 - check_ins, notes, action_items

**Files:**
- Create: `supabase/migrations/00004_checkins_notes_actions.sql`

**Step 1: Write the migration**

```sql
-- Migration: check_ins, notes, action_items tables

-- Check-ins table
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  categories TEXT[] NOT NULL DEFAULT '{}',
  mood_before INT CHECK (mood_before BETWEEN 1 AND 5),
  mood_after INT CHECK (mood_after BETWEEN 1 AND 5),
  reflection TEXT
);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read check-ins" ON public.check_ins
  FOR SELECT USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can create check-ins" ON public.check_ins
  FOR INSERT WITH CHECK (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can update check-ins" ON public.check_ins
  FOR UPDATE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can delete check-ins" ON public.check_ins
  FOR DELETE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

-- Notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
  content TEXT NOT NULL DEFAULT '',
  privacy TEXT NOT NULL DEFAULT 'shared' CHECK (privacy IN ('private', 'shared', 'draft')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  category_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Notes SELECT: shared/draft visible to couple, private only to author
CREATE POLICY "Couple members can read shared notes" ON public.notes
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
    AND (privacy != 'private' OR author_id = auth.uid())
  );

CREATE POLICY "Couple members can create notes" ON public.notes
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
    AND author_id = auth.uid()
  );

CREATE POLICY "Authors can update own notes" ON public.notes
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Authors can delete own notes" ON public.notes
  FOR DELETE USING (author_id = auth.uid());

-- Action items table
CREATE TABLE public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read action items" ON public.action_items
  FOR SELECT USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can create action items" ON public.action_items
  FOR INSERT WITH CHECK (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can update action items" ON public.action_items
  FOR UPDATE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can delete action items" ON public.action_items
  FOR DELETE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));
```

**Step 2: Commit**

```bash
git add supabase/migrations/00004_checkins_notes_actions.sql
git commit -m "feat: add check_ins, notes, action_items tables with RLS"
```

---

### Task 5: Write Supabase migration 3 - milestones

**Files:**
- Create: `supabase/migrations/00005_milestones.sql`

**Step 1: Write the migration**

```sql
-- Migration: milestones table + storage bucket for photos

CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('relationship', 'communication', 'intimacy', 'growth', 'adventure', 'milestone', 'custom')),
  icon TEXT,
  achieved_at TIMESTAMPTZ,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INT NOT NULL DEFAULT 0,
  photo_url TEXT
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read milestones" ON public.milestones
  FOR SELECT USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can create milestones" ON public.milestones
  FOR INSERT WITH CHECK (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can update milestones" ON public.milestones
  FOR UPDATE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can delete milestones" ON public.milestones
  FOR DELETE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

-- Storage bucket for milestone photos
INSERT INTO storage.buckets (id, name, public) VALUES ('milestone-photos', 'milestone-photos', true);

CREATE POLICY "Couple members can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'milestone-photos'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Anyone can read milestone photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'milestone-photos');

CREATE POLICY "Owners can delete photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'milestone-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Step 2: Commit**

```bash
git add supabase/migrations/00005_milestones.sql
git commit -m "feat: add milestones table + photo storage bucket"
```

---

### Task 6: Write Supabase migration 4 - reminders and requests

**Files:**
- Create: `supabase/migrations/00006_reminders_requests.sql`

**Step 1: Write the migration**

```sql
-- Migration: reminders and requests tables

CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  category TEXT NOT NULL DEFAULT 'custom' CHECK (category IN ('habit', 'check-in', 'action-item', 'special-date', 'custom')),
  frequency TEXT NOT NULL DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly', 'custom')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_channel TEXT NOT NULL DEFAULT 'in-app' CHECK (notification_channel IN ('in-app', 'email', 'both', 'none')),
  custom_schedule JSONB
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read reminders" ON public.reminders
  FOR SELECT USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can create reminders" ON public.reminders
  FOR INSERT WITH CHECK (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can update reminders" ON public.reminders
  FOR UPDATE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can delete reminders" ON public.reminders
  FOR DELETE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

-- Requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_for UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom' CHECK (category IN ('activity', 'task', 'reminder', 'conversation', 'date-night', 'custom')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'converted')),
  suggested_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read requests" ON public.requests
  FOR SELECT USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can create requests" ON public.requests
  FOR INSERT WITH CHECK (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can update requests" ON public.requests
  FOR UPDATE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can delete requests" ON public.requests
  FOR DELETE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));
```

**Step 2: Commit**

```bash
git add supabase/migrations/00006_reminders_requests.sql
git commit -m "feat: add reminders and requests tables with RLS"
```

---

### Task 7: Write Supabase migration 5 - love_languages, love_actions

**Files:**
- Create: `supabase/migrations/00007_love_languages.sql`

**Step 1: Write the migration**

```sql
-- Migration: love_languages and love_actions tables

CREATE TABLE public.love_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('words', 'acts', 'gifts', 'time', 'touch', 'custom')),
  privacy TEXT NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'shared')),
  importance TEXT NOT NULL DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'essential')),
  examples TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.love_languages ENABLE ROW LEVEL SECURITY;

-- Shared love languages visible to couple, private only to author
CREATE POLICY "Couple members can read shared love languages" ON public.love_languages
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
    AND (privacy = 'shared' OR user_id = auth.uid())
  );

CREATE POLICY "Users can create love languages" ON public.love_languages
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update own love languages" ON public.love_languages
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own love languages" ON public.love_languages
  FOR DELETE USING (user_id = auth.uid());

-- Love actions table
CREATE TABLE public.love_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  linked_language_id UUID REFERENCES public.love_languages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'planned', 'completed', 'recurring')),
  frequency TEXT NOT NULL DEFAULT 'once' CHECK (frequency IN ('once', 'weekly', 'monthly', 'surprise')),
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  completed_count INT NOT NULL DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.love_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read love actions" ON public.love_actions
  FOR SELECT USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can create love actions" ON public.love_actions
  FOR INSERT WITH CHECK (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can update love actions" ON public.love_actions
  FOR UPDATE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can delete love actions" ON public.love_actions
  FOR DELETE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));
```

**Step 2: Commit**

```bash
git add supabase/migrations/00007_love_languages.sql
git commit -m "feat: add love_languages and love_actions tables with RLS"
```

---

### Task 8: Write Supabase migration 6 - session_settings + enable realtime

**Files:**
- Create: `supabase/migrations/00008_session_settings_and_realtime.sql`

**Step 1: Write the migration**

```sql
-- Migration: session_settings table + enable realtime on high-frequency tables

CREATE TABLE public.session_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  session_duration INT NOT NULL DEFAULT 600,
  timeouts_per_partner INT NOT NULL DEFAULT 2,
  timeout_duration INT NOT NULL DEFAULT 60,
  turn_based_mode BOOLEAN NOT NULL DEFAULT false,
  turn_duration INT NOT NULL DEFAULT 120,
  allow_extensions BOOLEAN NOT NULL DEFAULT true,
  warm_up_questions BOOLEAN NOT NULL DEFAULT false,
  cool_down_time INT NOT NULL DEFAULT 60,
  CONSTRAINT session_settings_couple_id_unique UNIQUE (couple_id)
);

ALTER TABLE public.session_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read session settings" ON public.session_settings
  FOR SELECT USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can create session settings" ON public.session_settings
  FOR INSERT WITH CHECK (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can update session settings" ON public.session_settings
  FOR UPDATE USING (couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

-- Enable Supabase Realtime on high-frequency tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.love_actions;

-- Updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.love_languages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

**Step 2: Commit**

```bash
git add supabase/migrations/00008_session_settings_and_realtime.sql
git commit -m "feat: add session_settings, enable realtime, add updated_at triggers"
```

---

### Task 9: Write shared TypeScript types

**Files:**
- Create: `src/types/index.ts` (replace template types with QC types)
- Create: `src/types/checkin.ts`
- Create: `src/types/bookends.ts`
- Create: `src/types/database.ts`

**Step 1: Write database types**

Create `src/types/database.ts` with Supabase-compatible types generated from the schema. These are the raw database row types.

```typescript
// Database row types matching Supabase schema

export interface DbCouple {
  id: string
  name: string | null
  relationship_start_date: string | null
  settings: Record<string, unknown>
  created_at: string
}

export interface DbProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  couple_id: string | null
  plan: string
  created_at: string
  updated_at: string
}

export interface DbCoupleInvite {
  id: string
  couple_id: string
  invited_by: string
  invited_email: string
  token: string
  status: 'pending' | 'accepted' | 'expired'
  created_at: string
  expires_at: string
}

export interface DbCheckIn {
  id: string
  couple_id: string
  started_at: string
  completed_at: string | null
  status: 'in-progress' | 'completed' | 'abandoned'
  categories: string[]
  mood_before: number | null
  mood_after: number | null
  reflection: string | null
}

export interface DbNote {
  id: string
  couple_id: string
  author_id: string
  check_in_id: string | null
  content: string
  privacy: 'private' | 'shared' | 'draft'
  tags: string[]
  category_id: string | null
  created_at: string
  updated_at: string
}

export interface DbActionItem {
  id: string
  couple_id: string
  check_in_id: string | null
  title: string
  description: string | null
  assigned_to: string | null
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface DbMilestone {
  id: string
  couple_id: string
  title: string
  description: string | null
  category: string
  icon: string | null
  achieved_at: string | null
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  photo_url: string | null
}

export interface DbReminder {
  id: string
  couple_id: string
  created_by: string
  title: string
  message: string | null
  category: 'habit' | 'check-in' | 'action-item' | 'special-date' | 'custom'
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
  scheduled_for: string
  is_active: boolean
  notification_channel: 'in-app' | 'email' | 'both' | 'none'
  custom_schedule: Record<string, unknown> | null
}

export interface DbRequest {
  id: string
  couple_id: string
  requested_by: string
  requested_for: string
  title: string
  description: string | null
  category: 'activity' | 'task' | 'reminder' | 'conversation' | 'date-night' | 'custom'
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'accepted' | 'declined' | 'converted'
  suggested_date: string | null
  created_at: string
}

export interface DbLoveLanguage {
  id: string
  couple_id: string
  user_id: string
  title: string
  description: string | null
  category: 'words' | 'acts' | 'gifts' | 'time' | 'touch' | 'custom'
  privacy: 'private' | 'shared'
  importance: 'low' | 'medium' | 'high' | 'essential'
  examples: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface DbLoveAction {
  id: string
  couple_id: string
  linked_language_id: string | null
  title: string
  description: string | null
  status: 'suggested' | 'planned' | 'completed' | 'recurring'
  frequency: 'once' | 'weekly' | 'monthly' | 'surprise'
  difficulty: 'easy' | 'moderate' | 'challenging'
  completed_count: number
  last_completed_at: string | null
  created_at: string
}

export interface DbSessionSettings {
  id: string
  couple_id: string
  session_duration: number
  timeouts_per_partner: number
  timeout_duration: number
  turn_based_mode: boolean
  turn_duration: number
  allow_extensions: boolean
  warm_up_questions: boolean
  cool_down_time: number
}
```

**Step 2: Write the main types index**

Replace `src/types/index.ts` with QC domain types that extend database types. Port the type unions and interfaces from the QC app's `src/types/index.ts` (282 lines), adapting string IDs to uuid and Date fields to ISO strings. Include:
- Re-export all `Db*` types from `./database`
- `SubscriptionPlan`, `SubscriptionStatus` (keep from template)
- `Profile` (extends DbProfile)
- `Subscription` (keep from template)
- All QC type unions: `ReminderCategory`, `ReminderFrequency`, `NotificationChannel`, `RequestCategory`, `RequestPriority`, `RequestStatus`, `LoveLanguageCategory`, `LoveLanguagePrivacy`, `LoveLanguageImportance`, `LoveActionStatus`, `LoveActionSuggestedBy`, `LoveActionFrequency`, `LoveActionDifficulty`
- Domain interfaces that map to Db types but with richer typing

**Step 3: Port checkin.ts and bookends.ts types**

Copy and adapt from QC app's `src/types/checkin.ts` (81 lines) and `src/types/bookends.ts` (72 lines). These are mostly client-side state types that don't need database changes -- keep them as-is except replacing any `Date` objects with ISO strings.

**Step 4: Commit**

```bash
git add src/types/
git commit -m "feat: add QC domain types and database row types"
```

---

### Task 10: Write useRealtimeCouple hook

**Files:**
- Create: `src/hooks/useRealtimeCouple.ts`

**Step 1: Write the hook**

```typescript
'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type RealtimeTable = 'notes' | 'check_ins' | 'action_items' | 'requests' | 'love_actions'

interface UseRealtimeCoupleOptions<T extends Record<string, unknown>> {
  table: RealtimeTable
  coupleId: string | null
  onInsert?: (record: T) => void
  onUpdate?: (record: T) => void
  onDelete?: (oldRecord: T) => void
}

export function useRealtimeCouple<T extends Record<string, unknown>>({
  table,
  coupleId,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeCoupleOptions<T>): void {
  const onInsertRef = useRef(onInsert)
  const onUpdateRef = useRef(onUpdate)
  const onDeleteRef = useRef(onDelete)

  useEffect(() => {
    onInsertRef.current = onInsert
    onUpdateRef.current = onUpdate
    onDeleteRef.current = onDelete
  }, [onInsert, onUpdate, onDelete])

  useEffect(() => {
    if (!coupleId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`${table}:couple:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.eventType === 'INSERT' && onInsertRef.current) {
            onInsertRef.current(payload.new as T)
          } else if (payload.eventType === 'UPDATE' && onUpdateRef.current) {
            onUpdateRef.current(payload.new as T)
          } else if (payload.eventType === 'DELETE' && onDeleteRef.current) {
            onDeleteRef.current(payload.old as T)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, coupleId])
}
```

**Step 2: Commit**

```bash
git add src/hooks/useRealtimeCouple.ts
git commit -m "feat: add useRealtimeCouple hook for partner sync"
```

---

### Task 11: Write lib/couples.ts (couple CRUD + invite logic)

**Files:**
- Create: `src/lib/couples.ts`

**Step 1: Write the module**

This module contains server-side functions for couple management. All functions use the server Supabase client (cookie auth + RLS).

```typescript
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { DbCouple, DbCoupleInvite, DbProfile } from '@/types/database'

export async function createCouple(params: {
  name?: string
  relationshipStartDate?: string
}): Promise<DbCouple> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('couples')
    .insert({
      name: params.name ?? null,
      relationship_start_date: params.relationshipStartDate ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create couple: ${error.message}`)
  return data
}

export async function getCouple(coupleId: string): Promise<DbCouple | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('couples')
    .select()
    .eq('id', coupleId)
    .single()

  if (error) return null
  return data
}

export async function getCoupleMembers(coupleId: string): Promise<DbProfile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('couple_id', coupleId)

  if (error) throw new Error(`Failed to get couple members: ${error.message}`)
  return data ?? []
}

export async function getPartner(userId: string): Promise<DbProfile | null> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', userId)
    .single()

  if (!profile?.couple_id) return null

  const { data: partner } = await supabase
    .from('profiles')
    .select()
    .eq('couple_id', profile.couple_id)
    .neq('id', userId)
    .single()

  return partner ?? null
}

export async function joinCouple(userId: string, coupleId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ couple_id: coupleId })
    .eq('id', userId)

  if (error) throw new Error(`Failed to join couple: ${error.message}`)
}

export async function leaveCouple(userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ couple_id: null })
    .eq('id', userId)

  if (error) throw new Error(`Failed to leave couple: ${error.message}`)
}

export async function createInvite(params: {
  coupleId: string
  invitedBy: string
  invitedEmail: string
}): Promise<DbCoupleInvite> {
  const supabase = await createClient()
  const token = crypto.randomUUID()

  const { data, error } = await supabase
    .from('couple_invites')
    .insert({
      couple_id: params.coupleId,
      invited_by: params.invitedBy,
      invited_email: params.invitedEmail,
      token,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create invite: ${error.message}`)
  return data
}

export async function getInviteByToken(token: string): Promise<DbCoupleInvite | null> {
  // Use admin client since the invited user may not be in the couple yet
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('couple_invites')
    .select()
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (error) return null
  return data
}

export async function acceptInvite(token: string, userId: string): Promise<void> {
  const supabase = createAdminClient()

  // Get the invite
  const invite = await getInviteByToken(token)
  if (!invite) throw new Error('Invite not found or expired')

  // Check invite hasn't expired
  if (new Date(invite.expires_at) < new Date()) {
    await supabase
      .from('couple_invites')
      .update({ status: 'expired' })
      .eq('id', invite.id)
    throw new Error('Invite has expired')
  }

  // Check user isn't already in a couple
  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', userId)
    .single()

  if (profile?.couple_id) throw new Error('You are already in a couple')

  // Join the couple
  const { error: joinError } = await supabase
    .from('profiles')
    .update({ couple_id: invite.couple_id })
    .eq('id', userId)

  if (joinError) throw new Error(`Failed to join couple: ${joinError.message}`)

  // Mark invite as accepted
  await supabase
    .from('couple_invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id)
}

export async function resendInvite(inviteId: string): Promise<DbCoupleInvite> {
  const supabase = await createClient()
  const newToken = crypto.randomUUID()

  const { data, error } = await supabase
    .from('couple_invites')
    .update({
      token: newToken,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', inviteId)
    .select()
    .single()

  if (error) throw new Error(`Failed to resend invite: ${error.message}`)
  return data
}
```

**Step 2: Commit**

```bash
git add src/lib/couples.ts
git commit -m "feat: add couples CRUD and invite logic"
```

---

### Task 12: Update middleware for QC routes

**Files:**
- Modify: `src/lib/supabase/middleware.ts`
- Modify: `src/app/auth/callback/route.ts`

**Step 1: Add QC public routes to middleware**

Add `/onboarding`, `/invite`, and `/invite/[token]` to the `PUBLIC_ROUTES` array in `src/lib/supabase/middleware.ts`. Also redirect authenticated users without a couple to `/onboarding` instead of letting them access the dashboard.

The middleware should:
1. Keep existing session refresh logic
2. Add `/onboarding` and `/invite` to public routes
3. After auth check, query the user's profile for `couple_id`
4. If authenticated + no `couple_id` + accessing `(app)` routes -> redirect to `/onboarding`
5. If authenticated + has `couple_id` + accessing `/onboarding` -> redirect to `/dashboard`

**Step 2: Update auth callback to redirect to onboarding**

In `src/app/auth/callback/route.ts`, after exchanging the code for a session, check if the user has a `couple_id`. If not, redirect to `/onboarding` instead of `/dashboard`.

**Step 3: Commit**

```bash
git add src/lib/supabase/middleware.ts src/app/auth/callback/route.ts
git commit -m "feat: add onboarding redirect logic to middleware and auth callback"
```

---

### Task 13: Update Stripe plan config for QC tiers

**Files:**
- Modify: `src/lib/stripe/client.ts`
- Modify: `src/lib/subscription/server.ts`

**Step 1: Update PLAN_CONFIG**

Replace the template's generic plan config with QC-specific limits:

```typescript
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    maxCheckInsPerMonth: 4,
    maxNotes: 20,
    maxMilestones: 5,
    maxPhotoUploads: 0,
    maxReminderEmails: 0,
    maxLoveLanguages: 3,
    canExport: false,
  },
  pro: {
    name: 'Pro',
    maxCheckInsPerMonth: Infinity,
    maxNotes: Infinity,
    maxMilestones: Infinity,
    maxPhotoUploads: Infinity,
    maxReminderEmails: Infinity,
    maxLoveLanguages: Infinity,
    canExport: true,
  },
} as const
```

**Step 2: Update canUserDoAction for QC actions**

Update `src/lib/subscription/server.ts` to check QC-specific limits (check-ins, notes, milestones, etc.) instead of the template's generic `maxItems`.

**Step 3: Commit**

```bash
git add src/lib/stripe/client.ts src/lib/subscription/server.ts
git commit -m "feat: configure QC-specific Stripe subscription tiers"
```

---

### Task 14: Copy QC utility libraries

**Files:**
- Create: `src/lib/animations.ts` (from QC's 481-line animations.ts)
- Create: `src/lib/text-formatting.ts` (from QC's 284-line text-formatting.ts)
- Create: `src/lib/haptics.ts` (from QC's 175-line haptics.ts)

**Step 1: Copy animation variants**

Port QC's `src/lib/animations.ts` as-is. This contains Framer Motion variants (pageTransition, fadeIn, slideUp, staggerContainer, modalBackdrop, etc.) and spring configs. No changes needed.

**Step 2: Copy text formatting**

Port QC's `src/lib/text-formatting.ts` as-is. Contains applyFormat, removeFormat, parseMarkdown, toPlainText, toHTML, sanitizeText. No changes needed.

**Step 3: Copy haptics**

Port QC's `src/lib/haptics.ts` as-is. Contains haptic feedback patterns and the useHapticFeedback hook. No changes needed.

**Step 4: Commit**

```bash
git add src/lib/animations.ts src/lib/text-formatting.ts src/lib/haptics.ts
git commit -m "feat: port QC utility libraries (animations, text-formatting, haptics)"
```

---

### Task 15: Copy QC base UI components

**Files:**
- Create: `src/components/ui/` (port all Radix-wrapped UI primitives from QC)

**Step 1: Port base UI components**

Copy all files from QC's `src/components/ui/` directory:
- button.tsx, input.tsx, textarea.tsx, card.tsx, badge.tsx
- tabs.tsx, dialog.tsx, alert.tsx, avatar.tsx
- dropdown-menu.tsx, select.tsx, radio-group.tsx
- switch.tsx, slider.tsx, progress.tsx
- scroll-area.tsx, accordion.tsx, separator.tsx, tooltip.tsx

These are Radix UI wrappers with Tailwind styling. Copy as-is, adjusting any imports to use `@/` path alias.

**Step 2: Port motion components**

Copy QC's motion components (MotionBox, StaggerContainer, StaggerItem, PageTransition) to `src/components/ui/`.

**Step 3: Port mobile interaction components**

Copy PullToRefresh, SwipeGestures, LongPressMenu, MobileInput, MobileSheet, TouchButton, PrimaryActionFAB.

**Step 4: Port utility components**

Copy LazyComponents, LoadingSkeleton, LoadingStates, Skeleton, ErrorBoundary, FallbackUI.

**Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "feat: port QC base UI components (radix wrappers, motion, mobile, utilities)"
```

---

### Task 16: Update globals.css with QC theme

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Merge QC theme into template CSS**

Replace the template's CSS variables with QC's pink/coral theme system:
- `--primary`: 350 85% 50% (coral pink)
- `--secondary`: 15 90% 65% (soft coral)
- `--accent`: 25 95% 75% (peach)
- Custom colors: coral variants, peach, blush, rose-gold, warm-gray
- Keep template's dark mode support
- Add QC's high-contrast mode support
- Add touch-manipulation and safe-area-inset styles

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: apply QC pink/coral theme to globals.css"
```

---

### Task 17: Push foundation and verify

**Step 1: Push all foundation work**

```bash
git push origin main
```

**Step 2: Verify migration count**

```bash
ls supabase/migrations/
```

Expected: 8 files (00001 through 00008)

**Step 3: Verify types compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors (or only errors from missing components that agents will create)

---

## Phase 2: Parallel Agent Dispatch (8 agents)

> Each agent below is an independent subagent that reads from the QC prototype (`neonwatty/qc-app`) and writes into the new `qc` repo. Agents do NOT depend on each other -- they share the foundation from Phase 1 but write to non-overlapping file paths.
>
> **Dispatch all 8 agents simultaneously.**

### Task 18: Agent 1 -- Auth + Couples

**Scope:** Extend template auth, onboarding flow, partner invite flow, invite email template.

**Files to create:**
- `src/app/onboarding/page.tsx` -- Multi-step onboarding: display name, partner email, relationship start date
- `src/app/invite/[token]/page.tsx` -- Invite acceptance page: validates token, shows couple info, joins couple
- `src/lib/email/templates/invite.tsx` -- React Email template for partner invite
- `src/app/onboarding/actions.ts` -- Server actions: createCoupleAndInvite, completeOnboarding
- `src/app/invite/[token]/actions.ts` -- Server actions: validateInvite, acceptInviteAction

**Key behavior:**
1. After signup -> auth callback redirects to `/onboarding`
2. Onboarding page collects: display name (updates profile), partner's email, relationship start date
3. On submit: creates couple, sets user's couple_id, creates invite, sends email via Resend
4. Invite email contains link to `/invite/[token]`
5. Invite page: if not logged in, show signup CTA. If logged in, show couple info + "Join" button
6. On accept: validates token not expired, user not already in couple, sets couple_id, updates invite status

**Reference files from QC app:**
- `src/app/onboarding/page.tsx` (QC has an existing onboarding page -- port the UI, replace localStorage with server actions)
- `src/components/onboarding/` (any onboarding components)

**Conventions:**
- Server actions use Zod validation
- Email template matches WelcomeEmail style from template
- No semicolons, single quotes, 2-space indent

---

### Task 19: Agent 2 -- Check-ins

**Scope:** Port CheckInContext + BookendsContext + SessionSettingsContext, all check-in and bookends components.

**Files to create:**
- `src/contexts/CheckInContext.tsx` -- Rewrite from QC's 521-line context, replacing localStorage with Supabase queries
- `src/contexts/BookendsContext.tsx` -- Rewrite from QC's 328-line context
- `src/contexts/SessionSettingsContext.tsx` -- Rewrite from QC's 239-line context
- `src/app/(app)/checkin/page.tsx` -- Port from QC's checkin/page.tsx
- `src/components/checkin/` -- Port all check-in components from QC
- `src/components/bookends/` -- Port PrepBanner, PreparationModal, ReflectionForm from QC

**Key changes from QC prototype:**
1. CheckInContext: Replace `loadFromStorage('qc_checkin_session')` with Supabase queries to `check_ins`, `notes`, `action_items` tables
2. BookendsContext: Replace localStorage with Supabase queries (mood_before/mood_after on check_ins table)
3. SessionSettingsContext: Replace localStorage with Supabase queries to `session_settings` table
4. Add `useRealtimeCouple` calls for `check_ins` and `action_items` tables
5. All Supabase queries use `couple_id` filter (from user's profile)

**Reference files from QC app:**
- `src/contexts/CheckInContext.tsx` (521 lines)
- `src/contexts/BookendsContext.tsx` (328 lines)
- `src/contexts/SessionSettingsContext.tsx` (239 lines)
- `src/types/checkin.ts` (81 lines)
- `src/types/bookends.ts` (72 lines)
- `src/app/checkin/page.tsx`
- `src/components/checkin/` (all files)
- `src/components/bookends/` (all files)

**Keep unchanged:** All presentational components, animations, step flow logic

---

### Task 20: Agent 3 -- Notes

**Scope:** Port notes page and components, Supabase queries with privacy filtering.

**Files to create:**
- `src/app/(app)/notes/page.tsx` -- Port from QC's notes/page.tsx
- `src/components/notes/` -- Port all notes components (RichTextEditor, TagManager, BulkActions, NoteCard, NoteList, etc.)
- `src/hooks/useNoteEditor.ts` -- Port from QC, replace localStorage with Supabase
- `src/hooks/useNoteTags.ts` -- Port from QC

**Key changes from QC prototype:**
1. Notes page: Replace localStorage reads with Supabase query to `notes` table filtered by `couple_id`
2. Privacy filtering: Private notes only visible to author (RLS handles this, but UI should also filter)
3. CRUD operations: Replace localStorage writes with Supabase insert/update/delete
4. Add `useRealtimeCouple` for `notes` table to sync shared notes with partner
5. Note creation: Set `author_id` to current user, `couple_id` from profile

**Reference files from QC app:**
- `src/app/notes/page.tsx`
- `src/components/notes/` (all files)
- `src/hooks/useNoteEditor.ts`
- `src/hooks/useNoteTags.ts`

---

### Task 21: Agent 4 -- Growth Gallery

**Scope:** Port milestones page and components, add Supabase Storage for photo uploads.

**Files to create:**
- `src/app/(app)/growth/page.tsx` -- Port from QC's growth/page.tsx
- `src/components/growth/` -- Port Timeline, TimelineItem, MemoryCard, PhotoGallery, MilestoneCard
- `src/hooks/useMilestones.ts` -- Port from QC, replace localStorage with Supabase

**Key changes from QC prototype:**
1. Replace localStorage with Supabase query to `milestones` table
2. Photo uploads: Use Supabase Storage bucket `milestone-photos`
3. Upload flow: `supabase.storage.from('milestone-photos').upload(path, file)` -> save public URL to `milestones.photo_url`
4. CRUD: Supabase insert/update/delete on milestones table

**Reference files from QC app:**
- `src/app/growth/page.tsx`
- `src/components/growth/` (all files)
- `src/hooks/useMilestones.ts`
- `src/lib/chart-data.ts` (if analytics charts are used)

---

### Task 22: Agent 5 -- Reminders + Requests

**Scope:** Port both feature sets, update cron job for reminder emails.

**Files to create:**
- `src/app/(app)/reminders/page.tsx` -- Port from QC
- `src/app/(app)/requests/page.tsx` -- Port from QC
- `src/components/reminders/` -- Port RemindersChat and related
- `src/components/requests/` -- Port RequestsInbox and related
- Modify: `src/app/api/cron/send-reminders/route.ts` -- Implement actual reminder email sending

**Key changes from QC prototype:**
1. Reminders: Replace mock data with Supabase queries to `reminders` table
2. Requests: Replace mock data with Supabase queries to `requests` table
3. Add `useRealtimeCouple` for `requests` table (partner sync)
4. Cron job: Query `reminders` where `is_active = true` and `scheduled_for <= now()` and `notification_channel` includes email, then send via `sendBatchEmails()`
5. Request actions: Accept/decline updates `status` column

**Reference files from QC app:**
- `src/app/reminders/page.tsx`
- `src/app/requests/page.tsx`
- `src/components/reminders/` (all files)
- `src/components/requests/` (all files)
- `src/lib/mock-reminders.ts` (to understand data shape)
- `src/lib/mock-requests.ts` (to understand data shape)

---

### Task 23: Agent 6 -- Love Languages

**Scope:** Port LoveLanguagesContext + all love language components.

**Files to create:**
- `src/contexts/LoveLanguagesContext.tsx` -- Rewrite from QC's 444-line context
- `src/app/(app)/love-languages/page.tsx` -- Port from QC
- `src/app/(app)/love-languages/actions/page.tsx` -- Port from QC
- `src/app/(app)/love-languages/layout.tsx` -- Port from QC
- `src/components/love-languages/` -- Port LoveLanguageCard, AddLanguageDialog, etc.

**Key changes from QC prototype:**
1. LoveLanguagesContext: Replace localStorage (`qc-love-languages`) with Supabase queries to `love_languages` and `love_actions` tables
2. Privacy: Private love languages only visible to owner (RLS handles this)
3. Partner languages: Query where `couple_id` matches and `user_id` != current user and `privacy = 'shared'`
4. Add `useRealtimeCouple` for `love_actions` table
5. Remove demo data loading (loadDemoData method)

**Reference files from QC app:**
- `src/contexts/LoveLanguagesContext.tsx` (444 lines)
- `src/app/love-languages/page.tsx`
- `src/app/love-languages/actions/page.tsx`
- `src/app/love-languages/layout.tsx`
- `src/components/love-languages/` (all files)

---

### Task 24: Agent 7 -- Settings

**Scope:** Port all settings pages and session settings CRUD.

**Files to create:**
- `src/app/(app)/settings/page.tsx` -- Port from QC's settings page (7 tabs)
- `src/components/settings/` -- Port all: CategoryManager, NotificationSettings, ReminderScheduler, ThemeSelector, PersonalizationPanel, SessionSettingsPanel, CategoryEditor, PromptLibrary, PromptTemplateEditor, SessionAgreementModal
- `src/hooks/useCategories.ts` -- Port from QC

**Key changes from QC prototype:**
1. Session settings: Read/write to `session_settings` table instead of localStorage
2. Profile settings: Update `profiles` table (display_name, avatar_url)
3. Couple settings: Update `couples.settings` JSONB column
4. Add "Leave couple" action (calls `leaveCouple()` from lib/couples.ts)
5. Add "Resend invite" action (calls `resendInvite()` from lib/couples.ts)
6. Add Stripe subscription management link (portal URL)

**Reference files from QC app:**
- `src/app/settings/page.tsx`
- `src/components/Settings/` (note: capital S in QC)
- `src/hooks/useCategories.ts`

---

### Task 25: Agent 8 -- Layout + Dashboard

**Scope:** Root layout, QC sidebar/header/mobile nav, dashboard hub, landing page, ThemeContext, QC-specific Providers wrapper.

**Files to create:**
- `src/app/(app)/layout.tsx` -- QC app shell with sidebar, header, mobile nav
- `src/app/(app)/dashboard/page.tsx` -- QC dashboard hub with quick actions, stats, recent activity
- `src/app/layout.tsx` -- Update root layout for QC (Inter font -> QC font, metadata, QC Providers)
- `src/app/page.tsx` -- QC landing page (Hero, FeatureGrid)
- `src/app/providers.tsx` -- Wrap all 5 QC context providers
- `src/contexts/ThemeContext.tsx` -- Port from QC's 95-line context
- `src/components/layout/` -- Port Header, Navigation/Sidebar, Footer, PageHeader from QC
- `src/components/dashboard/` -- Port QuickActions, LoveLanguagesWidget, stats components
- `src/components/Landing/` -- Port Hero, FeatureGrid from QC

**Key changes from QC prototype:**
1. Root layout: Replace QC's static layout with template's auth-aware layout
2. `(app)/layout.tsx`: Server component that calls `requireAuth()`, renders QC sidebar/header/mobile nav
3. Dashboard: Replace localStorage-based stats with Supabase count queries
4. ThemeContext: Keep as-is (localStorage persistence is fine for theme preference)
5. Providers: Wrap children in CheckInProvider, BookendsProvider, SessionSettingsProvider, LoveLanguagesProvider, ThemeProvider
6. Landing page: Port QC's Hero and FeatureGrid, add login/signup CTAs

**Reference files from QC app:**
- `src/app/layout.tsx` (256 lines -- root layout with sidebar + header)
- `src/app/page.tsx` (landing)
- `src/app/dashboard/page.tsx`
- `src/contexts/ThemeContext.tsx` (95 lines)
- `src/components/layout/` (Header, Navigation, Footer, PageHeader)
- `src/components/dashboard/` (QuickActions, LoveLanguagesWidget)
- `src/components/Landing/` (Hero, FeatureGrid)
- `src/components/providers/Providers.tsx`

---

## Phase 3: Post-Agent Integration (sequential)

### Task 26: Merge agent outputs and resolve conflicts

**Step 1: Check for file conflicts**

After all 8 agents complete, check if any agents wrote to the same file paths:

```bash
git log --oneline --all --name-only | sort | uniq -d
```

**Step 2: Resolve any import conflicts**

Common issues to check:
- Circular imports between contexts
- Missing re-exports from `src/contexts/index.ts`
- Provider nesting order in `src/app/providers.tsx`
- Component imports using wrong paths

**Step 3: Commit**

```bash
git add -A && git commit -m "fix: resolve post-agent integration conflicts"
```

---

### Task 27: Verify build compiles

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: No errors. Fix any type errors found.

**Step 2: Run build**

```bash
npx next build 2>&1
```

Expected: Build succeeds. Fix any build errors.

**Step 3: Commit fixes**

```bash
git add -A && git commit -m "fix: resolve build and type errors from integration"
```

---

### Task 28: Run lint and format

**Step 1: Run ESLint**

```bash
npx eslint . --fix 2>&1
```

Fix any remaining lint errors (max-lines violations will need file splitting).

**Step 2: Run Prettier**

```bash
npx prettier --write "src/**/*.{ts,tsx}" 2>&1
```

**Step 3: Run Knip**

```bash
npx knip 2>&1
```

Remove any dead code flagged.

**Step 4: Commit**

```bash
git add -A && git commit -m "chore: lint, format, remove dead code"
```

---

### Task 29: Update CLAUDE.md for QC project

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update project overview**

Replace template description with QC description. Update:
- Project overview: QC relationship wellness app
- Directory structure: Add `(app)` route group, contexts, QC components
- Database section: Document all 12 tables and RLS pattern
- Conventions: Keep all existing, add QC-specific (couple-scoped queries, privacy filtering)

**Step 2: Commit**

```bash
git add CLAUDE.md && git commit -m "docs: update CLAUDE.md for QC project"
```

---

### Task 30: Final push and verify

**Step 1: Push everything**

```bash
git push origin main
```

**Step 2: Verify on GitHub**

```bash
gh repo view neonwatty/qc --web
```

**Step 3: Final status**

```bash
echo "Migration complete. QC repo is live at github.com/neonwatty/qc"
```

---

## File Ownership Map (Agent Boundaries)

No two agents write to the same file. If a file is needed by multiple agents, it's created in the foundation (Phase 1).

| Path | Owner |
|------|-------|
| `supabase/migrations/*` | Phase 1 (Tasks 3-8) |
| `src/types/*` | Phase 1 (Task 9) |
| `src/hooks/useRealtimeCouple.ts` | Phase 1 (Task 10) |
| `src/lib/couples.ts` | Phase 1 (Task 11) |
| `src/lib/animations.ts` | Phase 1 (Task 14) |
| `src/lib/text-formatting.ts` | Phase 1 (Task 14) |
| `src/lib/haptics.ts` | Phase 1 (Task 14) |
| `src/components/ui/*` | Phase 1 (Task 15) |
| `src/app/globals.css` | Phase 1 (Task 16) |
| `src/lib/supabase/middleware.ts` | Phase 1 (Task 12) |
| `src/lib/stripe/client.ts` | Phase 1 (Task 13) |
| `src/lib/subscription/server.ts` | Phase 1 (Task 13) |
| `src/app/onboarding/*` | Agent 1 |
| `src/app/invite/*` | Agent 1 |
| `src/lib/email/templates/invite.tsx` | Agent 1 |
| `src/contexts/CheckInContext.tsx` | Agent 2 |
| `src/contexts/BookendsContext.tsx` | Agent 2 |
| `src/contexts/SessionSettingsContext.tsx` | Agent 2 |
| `src/app/(app)/checkin/*` | Agent 2 |
| `src/components/checkin/*` | Agent 2 |
| `src/components/bookends/*` | Agent 2 |
| `src/app/(app)/notes/*` | Agent 3 |
| `src/components/notes/*` | Agent 3 |
| `src/hooks/useNoteEditor.ts` | Agent 3 |
| `src/hooks/useNoteTags.ts` | Agent 3 |
| `src/app/(app)/growth/*` | Agent 4 |
| `src/components/growth/*` | Agent 4 |
| `src/hooks/useMilestones.ts` | Agent 4 |
| `src/app/(app)/reminders/*` | Agent 5 |
| `src/app/(app)/requests/*` | Agent 5 |
| `src/components/reminders/*` | Agent 5 |
| `src/components/requests/*` | Agent 5 |
| `src/app/api/cron/send-reminders/route.ts` | Agent 5 |
| `src/contexts/LoveLanguagesContext.tsx` | Agent 6 |
| `src/app/(app)/love-languages/*` | Agent 6 |
| `src/components/love-languages/*` | Agent 6 |
| `src/app/(app)/settings/*` | Agent 7 |
| `src/components/settings/*` | Agent 7 |
| `src/hooks/useCategories.ts` | Agent 7 |
| `src/app/(app)/layout.tsx` | Agent 8 |
| `src/app/(app)/dashboard/*` | Agent 8 |
| `src/app/layout.tsx` | Agent 8 |
| `src/app/page.tsx` | Agent 8 |
| `src/app/providers.tsx` | Agent 8 |
| `src/contexts/ThemeContext.tsx` | Agent 8 |
| `src/components/layout/*` | Agent 8 |
| `src/components/dashboard/*` | Agent 8 |
| `src/components/Landing/*` | Agent 8 |
