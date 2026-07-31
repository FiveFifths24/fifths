# Known Limitations

Phase 1 establishes the complete public experience and design foundation. It does not activate member features.

- Authentication pages are accessible interfaces only. Submissions and social login are disabled until Phase 2.
- Supabase is not connected; no migrations, Auth, Row Level Security, storage policies, or seed data exist yet.
- Profiles, onboarding, dashboards, Pulse check-ins, recommendations, Sessions, registrations, Circle membership, Commons submissions, campaign applications, Passport entries, reports, and notifications are not implemented.
- Demonstration and preview language is explicitly labeled; no sample card represents a live opportunity, community, campaign, or activity.
- Privacy, terms, community, Creator Commons, and Fifth Realm safety pages are structured drafts requiring professional legal and operational review.
- Rate limiting, email delivery, monitoring, backups, analytics persistence, and production security headers are not configured.
- Playwright remains deferred until Phase 2 provides real account journeys; Phase 1 behavior is covered by focused Vitest and Testing Library tests.
- No component library was added. Phase 1 primitives are small, owned by FIFTHS, and documented in `docs/DESIGN_SYSTEM.md`.
- The MVP remains restricted to adults 18 and older and excludes payments, direct messaging, chat, AI/ML, public leaderboards, physical venue control, virtual tabletop tools, and copyrighted game content.

These are intentional phase boundaries. Track the next work in `docs/ROADMAP.md`.
