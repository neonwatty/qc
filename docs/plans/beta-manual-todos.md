# Beta Launch — Manual To-Dos

Items that require human action outside the codebase (service provider settings, deployment config, external tools, etc.).

---

### From Iteration 1 (2026-03-01)

- [ ] Set up error monitoring service (e.g., Sentry) — no error tracking exists, production errors go unnoticed (dimension: ops, severity: HIGH)
- [ ] Decide on and publish a support contact method (email/GitHub URL) — privacy policy and terms reference contact info that doesn't exist (dimension: feature, severity: HIGH)
- [ ] Configure Resend with a production domain email sender — currently using placeholder `onboarding@resend.dev` (dimension: ops, severity: MEDIUM)
- [ ] Configure uptime monitoring (e.g., Pingdom, UptimeRobot) for `tryqc.co` (dimension: ops, severity: MEDIUM)
- [ ] Monitor Resend email deliverability and bounce rates from the Resend dashboard (dimension: ops, severity: MEDIUM)
- [ ] Verify all required environment variables are set in the Vercel dashboard before launch (dimension: ops, severity: MEDIUM)
- [ ] Set up Resend API key in production (currently intentionally skipped) (dimension: ops, severity: HIGH)
- [ ] Consider adding CSP report-uri directive for security violation monitoring (dimension: ops, severity: LOW)
