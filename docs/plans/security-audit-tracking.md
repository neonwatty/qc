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
