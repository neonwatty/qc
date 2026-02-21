# QC Gap Analysis — Implementation Roadmap

## Overview

This directory contains detailed implementation plans derived from comparing the original QC prototype with the current production app. Plans are organized into independent workstreams that can be parallelized.

## Plan Index

| #   | Plan                                                          | Priority | Est. Effort | Parallel Group |
| --- | ------------------------------------------------------------- | -------- | ----------- | -------------- |
| 01  | [Re-enable Animations](./01-animations.md)                    | HIGH     | Small       | A              |
| 02  | [Enrich Onboarding](./02-onboarding.md)                       | HIGH     | Medium      | A              |
| 03  | [Check-in Session Enhancements](./03-checkin-enhancements.md) | HIGH     | Large       | B              |
| 04  | [Dashboard Upgrades](./04-dashboard-upgrades.md)              | HIGH     | Medium      | A              |
| 05  | [Reminder Enhancements](./05-reminders.md)                    | MEDIUM   | Medium      | B              |
| 06  | [Request Enhancements](./06-requests.md)                      | MEDIUM   | Small       | C              |
| 07  | [Growth Analytics](./07-growth-analytics.md)                  | MEDIUM   | Medium      | C              |
| 08  | [Settings Expansion](./08-settings.md)                        | MEDIUM   | Medium      | C              |
| 09  | [Error Handling & Toast System](./09-error-handling.md)       | MEDIUM   | Small       | A              |
| 10  | [Streak & Gamification](./10-streaks.md)                      | HIGH     | Small       | B              |

## Parallelization Strategy

### Parallel Group A (No DB migrations needed)

- **01 Animations** — Pure frontend, no schema changes
- **02 Onboarding** — New frontend steps, no schema changes (reads existing tables)
- **04 Dashboard** — New widgets/components, queries existing data
- **09 Error Handling** — Pure infrastructure, no feature overlap

### Parallel Group B (DB migrations + check-in/reminder domain)

- **03 Check-in Enhancements** — Touches check-in context, session settings schema
- **05 Reminders** — New columns on reminders table, new UI components
- **10 Streaks** — New computed stats, touches dashboard + check-in

### Parallel Group C (Independent feature areas)

- **06 Requests** — Touches requests table only
- **07 Growth Analytics** — Touches milestones/growth only, adds chart library
- **08 Settings** — New settings panels, touches session_settings + couples tables

### Worktree Allocation

| Worktree                        | Plans      | Rationale                                         |
| ------------------------------- | ---------- | ------------------------------------------------- |
| `feat/animations-and-ux`        | 01, 09     | Pure frontend polish, no conflicts                |
| `feat/onboarding-v2`            | 02         | Self-contained onboarding rewrite                 |
| `feat/dashboard-v2`             | 04, 10     | Dashboard widgets + streak tracking               |
| `feat/checkin-v2`               | 03         | Complex check-in session enhancements             |
| `feat/reminders-v2`             | 05         | Reminder domain overhaul                          |
| `feat/requests-growth-settings` | 06, 07, 08 | Independent feature areas, can merge sequentially |

### Dependency Graph

```
01 Animations ──────────────────────────── (no deps)
02 Onboarding ──────────────────────────── (no deps)
03 Check-in Enhancements ───────────────── (no deps, but 01 makes it look better)
04 Dashboard Upgrades ──────────────────── depends on 10 (streak data)
05 Reminders ───────────────────────────── (no deps)
06 Requests ────────────────────────────── depends on 05 (request→reminder conversion)
07 Growth Analytics ────────────────────── (no deps)
08 Settings ────────────────────────────── depends on 03 (session settings fields)
09 Error Handling ──────────────────────── (no deps)
10 Streaks ─────────────────────────────── (no deps)
```

## Merge Order

1. **Wave 1** (parallel): 01, 02, 09, 10 — No conflicts, no schema overlap
2. **Wave 2** (parallel): 03, 04, 05, 07 — After Wave 1 merges
3. **Wave 3** (sequential): 06, 08 — Depend on Wave 2 features
