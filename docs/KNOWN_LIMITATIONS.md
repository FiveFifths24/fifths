# Known Limitations

Phase 2 establishes the secure account and identity foundation. It does not activate product participation.

- Email/password authentication, recovery, profile onboarding, and logout are implemented, but they cannot operate until the founder-owned Supabase project is connected, the migration is applied, and Auth URLs are configured.
- Social login, MFA enrollment, account deletion, email change, profile editing, avatar upload, session management UI, and production SMTP are not implemented.
- The `/account` route is a minimal identity-readiness page, not the personal Home dashboard planned for Phase 3.
- Pulse check-ins, recommendations, Sessions, registrations, Circle membership, Commons submissions, campaign applications, Passport entries, reports, and notifications are not implemented.
- Demonstration and preview language is explicitly labeled; no sample card represents a live opportunity, community, campaign, or activity.
- Privacy, terms, community, Creator Commons, and Fifth Realm safety pages are structured drafts requiring professional legal and operational review.
- Rate limiting, email delivery, monitoring, backups, analytics persistence, and production security headers are not configured.
- Playwright remains deferred until a founder-owned Supabase preview environment can support deterministic account journeys. Phase 2 uses focused validation, component, redirect, and database-security contract tests.
- The initial SQL migration has not been executed against a live project in this repository environment. Apply it first to a non-production Supabase branch/project, run multi-user negative RLS tests, and review the generated database types before production.
- As of the Phase 2 review, `npm audit --omit=dev` reports high-severity advisories in Next.js transitive `postcss` and `sharp` versions. The available automated fix proposes a breaking Next.js downgrade, so it was not applied. Upgrade when Next.js publishes a compatible patched release and rerun the full gate.
- No component library was added. Phase 1 primitives are small, owned by FIFTHS, and documented in `docs/DESIGN_SYSTEM.md`.
- The MVP remains restricted to adults 18 and older and excludes payments, direct messaging, chat, AI/ML, public leaderboards, physical venue control, virtual tabletop tools, and copyrighted game content.

These are intentional phase boundaries. Phase 3 is the next tracked work in `docs/ROADMAP.md`.
