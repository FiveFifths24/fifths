# Known Limitations

Phase 6 establishes real Creator Commons discovery, saves, private responses, acceptance, and two-sided completion on top of private Pulse, personal Home, shared Sessions, and Circles. It does not activate Fifth Realm campaigns, organizations, or verified Passport activity.

- Email/password authentication, recovery, profile onboarding, logout, Pulse, Sessions, Circles, and Creator Commons are implemented, but they cannot operate until the founder-owned Supabase project is connected, all five ordered migrations are applied, and Auth URLs are configured.
- Social login, MFA enrollment, account deletion, email change, profile editing, avatar upload, production SMTP, and an administrator role-management interface are not implemented.
- `/home` shows real profile, Pulse, and eligible Session, Circle, and Commons matches. It still presents honest empty states when there is no current Pulse or no published inventory.
- Recommendation ranking is an application-code foundation, not the Phase 8 unified production review. It now adapts Sessions, Circles, and Commons opportunities but does not fetch or rank Realm campaigns.
- Pulse history is limited to the latest 30 records in the interface. Editing, deletion, export, analytics, streaks, and longitudinal health interpretation are not implemented.
- Session waitlists, recurring events, editing after creation, private meeting links, precise addresses, organizer co-hosting, payments, calendar export, and automated reminders are not implemented.
- Circle ownership transfer, editing, member bans, posts, feeds, chat, reports, notifications, and global moderation queues are not implemented.
- Creator opportunity editing, automated deadline closure, compensation fields, payments, escrow, contracts, tax collection, file uploads, equipment transfers, messaging, public applicant profiles, disputes, and organization ownership are not implemented. Response and completion workflows are intentionally structured and private.
- Fifth Realm campaign applications and Passport entries remain later work.
- Demonstration and preview language is explicitly labeled; no sample card represents a live opportunity, community, campaign, or activity.
- Privacy, terms, community, Creator Commons, and Fifth Realm safety pages are structured drafts requiring professional legal and operational review.
- Rate limiting, email delivery, monitoring, backups, analytics persistence, and production security headers are not configured.
- Playwright remains deferred until a founder-owned Supabase preview environment can support deterministic account, Pulse, Session-capacity, private-Circle, Commons-response, acceptance-contention, withdrawal, and completion journeys. Phase 6 uses focused validation, component, ranking-adapter, redirect, and database-security contract tests.
- The SQL migrations have not been executed against a live project in this repository environment. Apply all five in order to a non-production Supabase branch/project, run multi-user negative RLS, concurrent Session and opportunity-capacity, private-Circle, response-privacy, withdrawal, audit, and two-sided completion tests, and review regenerated database types before production.
- Next.js 16.2.12 still declares vulnerable transitive versions of `postcss` and `sharp`. Exact npm overrides resolve `postcss` to 8.5.25 and `sharp` to 0.35.3 throughout the dependency tree; both npm audit checks report zero vulnerabilities. Remove the overrides after Next.js directly declares patched versions, then regenerate the lockfile and rerun the full quality and audit gates.
- No component library was added. Phase 1 primitives are small, owned by FIFTHS, and documented in `docs/DESIGN_SYSTEM.md`.
- The MVP remains restricted to adults 18 and older and excludes payments, direct messaging, chat, AI/ML, public leaderboards, physical venue control, virtual tabletop tools, and copyrighted game content.

These are intentional phase boundaries. Phase 7 is the next tracked work in `docs/ROADMAP.md`.
