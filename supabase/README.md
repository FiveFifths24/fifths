# Supabase foundation

Phase 2 introduces identity. Phase 3 adds private Pulse. Phase 4 adds Sessions. Phase 5 adds Circles. Phase 6 adds Creator Commons. Phase 7 adds Fifth Realm. Phase 9 adds private verified Passport activity. Phase 10 adds private feedback, reports, in-app notifications, human moderation, and audited admin decisions. Apply all migrations in filename order only to a Five Fifths-owned non-production Supabase project after reviewing `docs/MANUAL_SETUP.md`.

The browser uses only the project URL and publishable key. No service-role key is required by the Phase 10 application and none belongs in local source control.

The migrations intentionally exclude organizations, public Passport profiles, points, leaderboards, automated moderation, account sanctions, evidence uploads, email/push delivery, payments, contracts, messaging, waitlists, copyrighted rules, and virtual tabletop tools.
