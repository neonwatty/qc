# Security Audit Tracking

Automated OWASP-aligned security audit tracking. 10 categories to cover: Auth & Access Control, Input Validation, RLS Completeness, Secret Management, Security Headers, Dependency Vulnerabilities, Rate Limiting, Error Handling, CSRF/Session, Data Exposure.

Each iteration is appended below by the `/security-audit` skill.

---

## Iteration Log

### Iteration 1 (2026-02-28)

**Categories Audited:** Auth & Access Control (A01), Input Validation (A03)
**Findings:** 9 (3 HIGH, 4 MEDIUM, 2 LOW)
**Fixed:** 7 (3 HIGH, 4 MEDIUM)
**Deferred:** 2 (LOW)

#### Fixed

- [x] Missing couple_id scoping in toggleReminder — any authenticated user could toggle another couple's reminders (category: Auth, severity: HIGH)
- [x] Missing couple_id scoping in deleteReminder — any authenticated user could delete another couple's reminders (category: Auth, severity: HIGH)
- [x] Missing couple_id scoping in snoozeReminder/unsnoozeReminder — same cross-couple mutation issue (category: Auth, severity: HIGH)
- [x] Unvalidated key parameter in updateCoupleSettings RPC — SECURITY DEFINER function accepts any JSONB key, could set arbitrary fields on couples table (category: Input Validation, severity: MEDIUM)
- [x] Missing couple verification in resendInviteAction — no check that invite belongs to user's couple (category: Auth, severity: MEDIUM)
- [x] Weak token validation in unsubscribe endpoint — used length check instead of UUID format (category: Input Validation, severity: MEDIUM)
- [x] Wrong column names in data-export.ts — used user_id instead of author_id (notes) and created_by (reminders), silently returning empty arrays (category: Auth, severity: MEDIUM)

#### Deferred

- [ ] toHTML function doesn't sanitize javascript: URIs (category: Input Validation, severity: LOW, reason: low risk since content is user-authored, not rendered in high-privilege contexts)
- [ ] In-memory rate limiter not persistent across Vercel instances (category: Auth, severity: LOW, reason: architectural limitation of serverless — would need external store like Redis)

#### Categories Remaining

- Authorization & Row-Level Security (A01)
- Secret Management (A02)
- Security Headers (A05)
- Dependency Vulnerabilities (A06)
- Rate Limiting (A04)
- Error Handling (A09)
- CSRF/Session (A07)
- Data Exposure (A02)

### Iteration 2 (2026-02-28)

**Categories Audited:** Authorization & Row-Level Security (A01), Secret Management (A02)
**Findings:** 0 HIGH, 0 MEDIUM (code), 1 MEDIUM (operational)
**Fixed:** 0 (no code changes needed)
**Deferred:** 1

#### Audit Results

**RLS (A01) — PASS:**

- All 16+ data tables have RLS enabled with couple-scoped policies
- Privacy filtering on notes and love_languages correctly implemented
- 10 SECURITY DEFINER functions all use `SET search_path = ''`
- All SECURITY DEFINER RPCs validated at app layer before calling (create_couple_for_user, update_couple_setting, convert_request_to_reminder, seed_default_categories)
- Anon role has zero access (no GRANT statements found)
- Storage bucket: public read removed in migration 00023, replaced with couple-scoped access

**Secret Management (A02) — PASS:**

- No hardcoded secrets in source code
- NEXT*PUBLIC* vars contain only public-safe values (URL, anon key)
- SUPABASE_SERVICE_ROLE_KEY restricted to server-only (lib/supabase/admin.ts)
- All secrets validated before use with proper error handling
- .gitignore correctly excludes .env files
- No secrets leaked in error messages or console logs
- Webhook signature verification via Svix
- Cron auth uses timing-safe comparison

#### Deferred

- [ ] Rotate local Supabase personal access token (category: Secret Management, severity: MEDIUM, reason: operational task, not a code fix — token is in local .env which is gitignored)

#### Categories Remaining

- Security Headers (A05)
- Dependency Vulnerabilities (A06)
- Rate Limiting (A04)
- Error Handling (A09)
- CSRF/Session (A07)
- Data Exposure (A02)

### Iteration 3 (2026-02-28)

**Categories Audited:** Security Headers (A05), Error Handling (A09)
**Findings:** 1 HIGH, 3 MEDIUM, 2 LOW
**Fixed:** 3 (1 HIGH, 2 MEDIUM)
**Deferred:** 3

#### Fixed

- [x] Supabase error messages leaked to client in 8+ server action files — could expose DB table/column names and constraint details. Added `sanitizeDbError()` utility, applied to all server actions and API routes (category: Error Handling, severity: HIGH)
- [x] Auth error details leaked in login/signup/callback — Supabase auth errors like "User already registered" disclosed to users. Replaced with generic messages: "Invalid email or password" (login), "Unable to create account" (signup), "Authentication failed" (callback) (category: Error Handling, severity: MEDIUM)
- [x] Unsubscribe endpoint returned HTML without security headers — missing CSP, X-Frame-Options, X-Content-Type-Options. Added hardened headers including strict CSP (category: Security Headers, severity: MEDIUM)

#### Deferred

- [ ] CSP uses 'unsafe-inline' for script-src — required by Next.js hydration and Capacitor WKWebView. Would need nonce-based CSP or hash-based approach (category: Security Headers, severity: HIGH, reason: requires deep Next.js/Capacitor investigation, not a quick fix)
- [ ] No CSP report-uri/report-to for violation monitoring (category: Security Headers, severity: LOW, reason: would need a reporting endpoint)
- [ ] Missing X-DNS-Prefetch-Control header (category: Security Headers, severity: LOW, reason: CSP connect-src already restricts connections)

#### Categories Remaining

- Dependency Vulnerabilities (A06)
- Rate Limiting (A04)
- CSRF/Session (A07)
- Data Exposure (A02)
