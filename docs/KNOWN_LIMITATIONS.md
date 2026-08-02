# Known Limitations

Phase 8 unifies explainable recommendations across real Session, Circle, Creator Commons, and Fifth Realm inventory. It does not activate organizations or verified Passport activity.

- Email/password authentication, recovery, profile onboarding, logout, Pulse, Sessions, Circles, Creator Commons, and Fifth Realm are implemented, but they cannot operate until the founder-owned Supabase project is connected, all six ordered migrations are applied, and Auth URLs are configured.
- Social login, MFA enrollment, account deletion, email change, profile editing, avatar upload, production SMTP, and an administrator role-management interface are not implemented.
- `/home` shows real profile, Pulse, and one eligible Session, Circle, Commons, and Realm feed. It still presents honest empty states when there is no current Pulse, no relevant result, or no published inventory.
- Recommendation ranking is deterministic application code, not a promise of suitability. It normalizes by applicable candidate signals, softly balances initial module representation, and shows reasons and nonnumeric fit levels. It does not learn from behavior, infer missing preferences, or replace member choice.
- Pulse history is limited to the latest 30 records in the interface. Editing, deletion, export, analytics, streaks, and longitudinal health interpretation are not implemented.
- Session waitlists, recurring events, editing after creation, private meeting links, precise addresses, organizer co-hosting, payments, calendar export, and automated reminders are not implemented.
- Circle ownership transfer, editing, member bans, posts, feeds, chat, reports, notifications, and global moderation queues are not implemented.
- Creator opportunity editing, automated deadline closure, compensation fields, payments, escrow, contracts, tax collection, file uploads, equipment transfers, messaging, public applicant profiles, disputes, and organization ownership are not implemented. Response and completion workflows are intentionally structured and private.
- Campaign editing, co-game-masters, invitations, character records, files, maps, dice, rules references, virtual tabletop tools, private meeting links, recurring scheduling, and campaign-specific attendance are not implemented. Campaign meetings use existing shared Sessions, and Passport entries remain later work.
- Demonstration and preview language is explicitly labeled; no sample card represents a live opportunity, community, campaign, or activity.
- Privacy, terms, community, Creator Commons, and Fifth Realm safety pages are structured drafts requiring professional legal and operational review.
- Rate limiting, email delivery, monitoring, backups, analytics persistence, and production security headers are not configured.
- Playwright remains deferred until a founder-owned Supabase preview environment can support deterministic account, Pulse, unified-feed, Session-capacity, private-Circle, Commons-response, Realm-application, acceptance-contention, membership, and completion journeys. Phase 8 uses focused validation, component, ranking, adapter, redirect, and database-security contract tests.
- The SQL migrations have not been executed against a live project in this repository environment. Apply all six in order to a non-production Supabase branch/project, run multi-user negative RLS, concurrent Session/opportunity/campaign capacity, private-Circle, response/application privacy, withdrawal, membership, audit, Realm Session, and completion tests, and review regenerated database types before production.
- Next.js 16.2.12 still declares vulnerable transitive versions of `postcss` and `sharp`. Exact npm overrides resolve `postcss` to 8.5.25 and `sharp` to 0.35.3 throughout the dependency tree; both npm audit checks report zero vulnerabilities. Remove the overrides after Next.js directly declares patched versions, then regenerate the lockfile and rerun the full quality and audit gates.
- No component library was added. Phase 1 primitives are small, owned by FIFTHS, and documented in `docs/DESIGN_SYSTEM.md`.
- The MVP remains restricted to adults 18 and older and excludes payments, direct messaging, chat, AI/ML, public leaderboards, physical venue control, virtual tabletop tools, and copyrighted game content.

These are intentional phase boundaries. Phase 9 is the next tracked work in `docs/ROADMAP.md`.
