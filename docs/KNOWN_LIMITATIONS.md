# Known Limitations

Phase 3 establishes private Pulse and personal Home on top of the secure account foundation. It does not activate Sessions or product participation.

- Email/password authentication, recovery, profile onboarding, logout, and Pulse are implemented, but they cannot operate until the founder-owned Supabase project is connected, both ordered migrations are applied, and Auth URLs are configured.
- Social login, MFA enrollment, account deletion, email change, profile editing, avatar upload, session management UI, and production SMTP are not implemented.
- `/home` shows real profile and Pulse state. It intentionally shows an empty recommendation state because Phase 4+ candidate inventory does not exist yet.
- Recommendation ranking is an application-code foundation, not the Phase 8 unified production review. It does not yet fetch, filter, or paginate records from Sessions, Circles, Commons, or Realm.
- Pulse history is limited to the latest 30 records in the interface. Editing, deletion, export, analytics, streaks, and longitudinal health interpretation are not implemented.
- Sessions, registrations, Circle membership, Commons submissions, campaign applications, Passport entries, reports, and notifications are not implemented.
- Demonstration and preview language is explicitly labeled; no sample card represents a live opportunity, community, campaign, or activity.
- Privacy, terms, community, Creator Commons, and Fifth Realm safety pages are structured drafts requiring professional legal and operational review.
- Rate limiting, email delivery, monitoring, backups, analytics persistence, and production security headers are not configured.
- Playwright remains deferred until a founder-owned Supabase preview environment can support deterministic account and Pulse journeys. Phase 3 uses focused validation, component, ranking, redirect, and database-security contract tests.
- The SQL migrations have not been executed against a live project in this repository environment. Apply them in order to a non-production Supabase branch/project, run multi-user negative RLS tests, and review regenerated database types before production.
- Next.js 16.2.12 still declares vulnerable transitive versions of `postcss` and `sharp`. A narrowly scoped npm override pins only Next.js's copies to `postcss` 8.5.25 and `sharp` 0.35.3, the current patched releases verified by the dependency-security review. Remove the override after Next.js declares patched versions, then regenerate the lockfile and rerun the full quality and audit gates.
- No component library was added. Phase 1 primitives are small, owned by FIFTHS, and documented in `docs/DESIGN_SYSTEM.md`.
- The MVP remains restricted to adults 18 and older and excludes payments, direct messaging, chat, AI/ML, public leaderboards, physical venue control, virtual tabletop tools, and copyrighted game content.

These are intentional phase boundaries. Phase 4 is the next tracked work in `docs/ROADMAP.md`.
