# Known Limitations

Phase 4 establishes shared Session discovery and participation on top of private Pulse and personal Home. It does not activate product-specific communities or verified Passport activity.

- Email/password authentication, recovery, profile onboarding, logout, Pulse, and Sessions are implemented, but they cannot operate until the founder-owned Supabase project is connected, all three ordered migrations are applied, and Auth URLs are configured.
- Social login, MFA enrollment, account deletion, email change, profile editing, avatar upload, production SMTP, and an administrator role-management interface are not implemented.
- `/home` shows real profile, Pulse, and eligible Session matches. It still presents honest empty states when there is no current Pulse or no published inventory.
- Recommendation ranking is an application-code foundation, not the Phase 8 unified production review. It now adapts Sessions but does not fetch or rank Circles, Commons opportunities, or Realm campaigns.
- Pulse history is limited to the latest 30 records in the interface. Editing, deletion, export, analytics, streaks, and longitudinal health interpretation are not implemented.
- Session waitlists, recurring events, editing after creation, private meeting links, precise addresses, organizer co-hosting, payments, calendar export, and automated reminders are not implemented.
- Circle membership, Commons submissions, campaign applications, Passport entries, reports, and notifications are not implemented.
- Demonstration and preview language is explicitly labeled; no sample card represents a live opportunity, community, campaign, or activity.
- Privacy, terms, community, Creator Commons, and Fifth Realm safety pages are structured drafts requiring professional legal and operational review.
- Rate limiting, email delivery, monitoring, backups, analytics persistence, and production security headers are not configured.
- Playwright remains deferred until a founder-owned Supabase preview environment can support deterministic account, Pulse, capacity-contention, and attendance journeys. Phase 4 uses focused validation, component, ranking-adapter, redirect, and database-security contract tests.
- The SQL migrations have not been executed against a live project in this repository environment. Apply all three in order to a non-production Supabase branch/project, run multi-user negative RLS and concurrent-capacity tests, and review regenerated database types before production.
- As of the Phase 3 review, `npm audit --omit=dev` reports three high-severity advisories in Next.js transitive `postcss` and `sharp` packages. The available complete automated fix proposes a breaking downgrade to Next.js 9.3.3, so it was not applied. Upgrade only when a compatible patched Next.js release is available, then rerun the full gate.
- No component library was added. Phase 1 primitives are small, owned by FIFTHS, and documented in `docs/DESIGN_SYSTEM.md`.
- The MVP remains restricted to adults 18 and older and excludes payments, direct messaging, chat, AI/ML, public leaderboards, physical venue control, virtual tabletop tools, and copyrighted game content.

These are intentional phase boundaries. Phase 5 is the next tracked work in `docs/ROADMAP.md`.
