# Supabase foundation

Phase 2 introduces accounts, profiles, roles, onboarding taxonomies, audit records, and identity Row Level Security. Phase 3 adds private Pulse signals. Phase 4 adds shared Sessions, capacity-safe registration, attendance audit, and Session RLS. Phase 5 adds Circles, memberships, local roles, associations, and moderation audit. Phase 6 adds Creator Commons opportunities, taxonomy joins, private saves/responses, capacity-safe acceptance, mutual completion, audit, and RLS. Phase 7 adds Fifth Realm campaigns, private applications, capacity-safe membership, game-master tools, Realm Session associations, audit, and RLS. Phase 9 adds private, verified, duplicate-safe Passport activity and audited corrections. Apply migrations in filename order only to a Five Fifths-owned Supabase project after reviewing `docs/MANUAL_SETUP.md`.

The browser uses only the project URL and publishable key. No service-role key is required by the Phase 9 application and none belongs in local source control.

The migrations intentionally exclude organizations, public Passport profiles, points, leaderboards, reports, notifications, payments, contracts, uploads, messaging, waitlists, copyrighted rules, and virtual tabletop tools. The application scorer receives only already-authorized Session, Circle, Commons, and Realm candidates and exposes reason labels without raw scores.
