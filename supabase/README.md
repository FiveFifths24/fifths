# Supabase foundation

Phase 2 introduces accounts, profiles, roles, onboarding taxonomies, audit records, and identity Row Level Security. Phase 3 adds private Pulse signals. Phase 4 adds shared Sessions, capacity-safe registration, attendance audit, and Session RLS. Apply migrations in filename order only to a Five Fifths-owned Supabase project after reviewing `docs/MANUAL_SETUP.md`.

The browser uses only the project URL and publishable key. No service-role key is required by the Phase 4 application and none belongs in local source control.

The migrations intentionally exclude organizations, Circle membership, Creator Commons workflows, Fifth Realm campaigns, Passport entries, payments, messaging, and waitlists. The application scorer receives only already-authorized, published Session candidates and exposes reason labels without raw scores.
