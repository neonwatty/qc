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

### Iteration 4 (2026-02-28)

**Categories Audited:** Dependency Vulnerabilities (A06), CSRF/Session (A07)
**Findings:** 1 MEDIUM, 5 LOW
**Fixed:** 1 (MEDIUM)
**Deferred:** 1

#### Audit Results

**Dependency Vulnerabilities (A06) — PASS (dev-only issues):**

- Zero production vulnerabilities — all 6 findings are in dev-only dependency trees
- `rollup` path traversal (CWE-22) fixed via `npm audit fix` (4.57.1 → 4.59.0)
- `ajv` ReDoS fixed via `npm audit fix` (6.12.6 → 6.14.0)
- `minimatch` ReDoS partially fixed (3.1.2 → 3.1.5, 9.0.5 → 9.0.9)
- 4 remaining HIGH-rated vulns are all minimatch inside semantic-release's bundled npm — cannot be fixed without breaking downgrade
- No `.npmrc` customizations, standard `package-lock.json` in use

**CSRF/Session (A07) — PASS:**

- Auth cookies: HttpOnly + Secure + SameSite configured by Supabase SSR
- Session refresh on every request via middleware `updateSession()`
- No session fixation vectors — sessions are user-bound via `auth.getUser()`
- All 11 server action files have built-in Next.js CSRF protection
- API routes: webhook uses Svix signature verification, cron uses timing-safe Bearer token
- Zero auth tokens in URLs — only invite/unsubscribe UUIDs (expected)
- OAuth callback: Supabase handles state/PKCE internally
- Token storage: auth tokens in HttpOnly cookies only, no localStorage/sessionStorage for auth
- `sanitizeRedirect()` prevents open redirect attacks
- CSP includes `form-action 'self'` preventing cross-origin form submission

#### Fixed

- [x] Dev dependency vulnerabilities in rollup, ajv, minimatch — applied `npm audit fix` for non-breaking upgrades (category: Dependency Vulnerabilities, severity: MEDIUM)

#### Deferred

- [ ] minimatch ReDoS inside semantic-release bundled npm — requires breaking downgrade to v24 (category: Dependency Vulnerabilities, severity: LOW, reason: dev-only CI tooling, no production exposure, awaiting upstream fix)

#### Categories Remaining

- Rate Limiting (A04)
- Data Exposure (A02)

### Iteration 5 (2026-02-28)

**Categories Audited:** Rate Limiting (A04), Data Exposure (A02)
**Findings:** 1 HIGH, 3 MEDIUM, 4 LOW
**Fixed:** 1 (HIGH)
**Deferred:** 3 MEDIUM, 4 LOW

#### Audit Results

**Rate Limiting (A04):**

- Existing rate limiter: `lib/rate-limit.ts` with in-memory fixed-window algorithm
- Only one endpoint currently rate-limited: invite token validation (10 req/min per token)
- Login/signup are client-side Supabase Auth calls — Supabase has built-in auth rate limiting on their servers
- Health endpoint is read-only with minimal info exposure
- Email webhook protected by Svix cryptographic signature verification
- Unsubscribe tokens use 128-bit UUID entropy (brute force impractical)

**Data Exposure (A02):**

- Email addresses were logged in webhook bounce/complaint handlers — FIXED
- Privacy flags properly enforced on notes and love_languages (RLS + client-side)
- Data export requires auth and respects privacy flags
- Storage uploads require authentication with couple-scoped paths
- Redirect validation prevents open redirect attacks
- Unsubscribe token validation prevents injection

#### Fixed

- [x] Email addresses (PII) logged in webhook bounce and complaint handlers — replaced with email_id for logging, removed PII from error messages (category: Data Exposure, severity: HIGH)

#### Deferred

- [ ] No rate limiting on login/signup client-side auth calls (category: Rate Limiting, severity: MEDIUM, reason: Supabase Auth provides server-side rate limiting; adding client-side limits would require middleware/server action wrapper)
- [ ] `select('*')` queries expose all columns including internal fields like `email_unsubscribe_token` (category: Data Exposure, severity: MEDIUM, reason: requires type refactoring across components; RLS prevents cross-user access; internal use only)
- [ ] Missing unsubscribe URLs in milestone and request notification emails (category: Data Exposure, severity: MEDIUM, reason: feature gap requiring email template updates and additional DB queries)
- [ ] No rate limiting on health check endpoint (category: Rate Limiting, severity: LOW, reason: read-only, minimal info)
- [ ] No rate limiting on unsubscribe endpoint (category: Rate Limiting, severity: LOW, reason: UUID entropy makes brute force impractical)
- [ ] Invite rate limiter is token-based not IP-based (category: Rate Limiting, severity: LOW, reason: token-based limiting is acceptable for invite flow)
- [ ] Console logging of non-sensitive error messages in production (category: Data Exposure, severity: LOW, reason: no PII in these logs)

#### Categories Remaining

None — all 10 OWASP categories have been audited.

---

## Audit Summary

| Iteration | Categories                               | Fixed      | Deferred           |
| --------- | ---------------------------------------- | ---------- | ------------------ |
| 1         | Auth & Access Control, Input Validation  | 7 (3H, 4M) | 2 (2L)             |
| 2         | Authorization & RLS, Secret Management   | 0          | 1 (1M operational) |
| 3         | Security Headers, Error Handling         | 3 (1H, 2M) | 3 (1H, 2L)         |
| 4         | Dependency Vulnerabilities, CSRF/Session | 1 (1M)     | 1 (1L)             |
| 5         | Rate Limiting, Data Exposure             | 1 (1H)     | 7 (3M, 4L)         |
| **Total** | **10/10**                                | **12**     | **14**             |

### Remaining Deferred Items (by severity)

**HIGH (1):**

- CSP uses 'unsafe-inline' for script-src (requires Next.js/Capacitor nonce-based approach)

**MEDIUM (5):**

- Rotate local Supabase personal access token (operational)
- No rate limiting on login/signup (Supabase provides server-side limiting)
- `select('*')` queries expose internal fields (type refactoring needed)
- Missing unsubscribe URLs in some email templates (feature gap)
- (none critical — all have mitigations in place)

**LOW (8):**

- toHTML javascript: URI sanitization
- In-memory rate limiter not persistent across instances
- minimatch ReDoS in semantic-release
- No rate limiting on health/unsubscribe endpoints
- Invite rate limiter is token-based not IP-based
- No CSP report-uri
- Missing X-DNS-Prefetch-Control
- Console logging patterns
