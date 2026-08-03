# Phase 11 Release Readiness

## Current decision: no-go for public beta

The checked-in application is ready for a founder-owned preview deployment and live validation. It is **not yet approved for public beta**. The repository cannot prove the behavior of an unconnected Supabase project, production email delivery, operational response, backups, or draft legal text.

Move to a public-beta go decision only after every founder gate below is complete and the result is recorded outside the repository with an owner and date.

## Automated release gates

Run the complete local gate from a clean checkout:

```bash
npm ci
npx playwright install chromium
npm run check:release
```

`check:release` verifies formatting, ESLint, strict TypeScript, unit/component and SQL contract tests, a production build, Chromium journeys at desktop and mobile sizes, WCAG automated scans, and both runtime-only and complete-tree npm audits.

GitHub Actions repeats these checks on every pull request and on pushes to `main`. Browser diagnostics are retained for 14 days when the workflow completes. Branch protection should require both named jobs:

- `Format, lint, type, unit, build, and audit`
- `Browser, accessibility, and responsive review`

Automated accessibility checks are a regression gate, not a certification. Keyboard, screen-reader, zoom, high-contrast, reduced-motion, and plain-language review remain manual release work.

## Environment promotion

| Environment | Purpose                                                    | Data rule                                                                                                     | Promotion gate                                                                              |
| ----------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Local       | Static, unit, component, build, and public-browser review  | Placeholder public values are acceptable; never use production records                                        | `npm run check:release` passes                                                              |
| Preview     | Real Auth, RLS, capacity, privacy, and workflow validation | Dedicated non-production Supabase project/branch with synthetic adult test accounts                           | All eight migrations, Auth URLs, role assignments, and every manual multi-user test pass    |
| Production  | Initial 18+ beta                                           | Separate production configuration, least-privilege access, reviewed retention, backup, and support procedures | Founder signs the go checklist after legal, security, accessibility, and operational review |

Never point a pull-request preview at the production database. Public Supabase values may be present in the browser; database passwords, JWT secrets, and service-role keys must never enter GitHub, client code, or preview logs.

## Founder go checklist

- [ ] Connect the Five Fifths-owned non-production Supabase project and apply all eight migrations in order.
- [ ] Regenerate and review database types after the live schema is applied.
- [ ] Configure exact local, preview, and production Auth callback URLs and production SMTP.
- [ ] Complete every positive, negative, concurrency, audit, and cross-user RLS journey in `docs/MANUAL_SETUP.md` with synthetic accounts.
- [ ] Review rate limits and add platform-level throttling and bot protection for public/account abuse paths.
- [ ] Enable monitored database backups and perform a documented restore rehearsal.
- [ ] Configure error monitoring, availability monitoring, privacy-safe log retention, and an incident owner.
- [ ] Complete manual keyboard, screen-reader, 200% zoom, forced-colors, reduced-motion, and representative-device review.
- [ ] Obtain professional legal/privacy review of every draft policy and approve community/moderation operations.
- [ ] Verify the production response headers, TLS, environment separation, and Auth redirects on the deployed origin.
- [ ] Protect `main`, require the two Phase 11 workflow jobs and review, and block force pushes.
- [ ] Record a named release owner, support contact, launch window, rollback owner, and final go/no-go decision.

## Preview smoke test

After each preview deployment:

1. Open `/`, `/ecosystem`, `/login`, `/signup`, all five public module pages, and all five legal/safety pages on a narrow mobile viewport and a desktop viewport.
2. Use the skip link, desktop navigation, mobile menu, password visibility controls, and keyboard focus order.
3. Confirm response headers include CSP, `nosniff`, frame denial, referrer policy, and permissions policy. Production must also include HSTS.
4. Create and confirm a synthetic adult account, complete onboarding, sign out, sign in, request recovery, and update the password.
5. Exercise every role and product workflow in the manual setup guide, including negative cross-user reads and near-simultaneous capacity actions.
6. Confirm private reports, feedback, applications, responses, Passport activity, and notifications never appear to unrelated accounts.
7. Confirm monitoring receives a controlled test event without exposing credentials or private member content.

## Deployment sequence

1. Freeze the candidate commit and ensure GitHub checks pass from `package-lock.json` via `npm ci`.
2. Back up the target database and record the restore point before applying a migration.
3. Apply only reviewed, ordered migrations to preview first. This phase adds no migration.
4. Deploy the exact candidate commit to preview and complete the smoke and multi-user gates.
5. Approve the same commit for production, verify environment variables, and deploy during the recorded launch window.
6. Repeat the public, Auth, privacy, and header smoke tests on production before announcing availability.

## Rollback

Application rollback and database recovery are separate decisions:

1. Stop promotion and announce the incident to the named release owner.
2. In Vercel, redeploy the last known-good production deployment built from its recorded commit.
3. Re-run public, Auth, and privacy smoke tests against that deployment.
4. Do **not** reverse a Supabase migration with destructive ad hoc SQL. Preserve evidence, restrict access if needed, and use a reviewed forward corrective migration.
5. If data integrity is affected, pause writes and follow the tested Supabase backup/restore procedure before reopening access.
6. Record impact, timeline, affected data boundaries, corrective action, and the new release decision.

## Phase boundary

Phase 11 adds release controls, not product behavior. It does not add new database tables, migrations, authentication methods, moderation automation, messaging, payments, AI/ML, public leaderboards, youth accounts, or venue control. The tracked MVP phases are complete in code after this review; public beta remains gated by the founder checklist above.
