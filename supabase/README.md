# Supabase foundation

Phase 2 introduces accounts, profiles, roles, onboarding taxonomies, audit records, and identity Row Level Security. Phase 3 adds private Pulse signals. Phase 4 adds shared Sessions, capacity-safe registration, attendance audit, and Session RLS. Phase 5 adds Circles, memberships, local roles, associations, and moderation audit. Phase 6 adds Creator Commons opportunities, taxonomy joins, private saves/responses, capacity-safe acceptance, mutual completion, audit, and RLS. Apply migrations in filename order only to a Five Fifths-owned Supabase project after reviewing `docs/MANUAL_SETUP.md`.

The browser uses only the project URL and publishable key. No service-role key is required by the Phase 6 application and none belongs in local source control.

The migrations intentionally exclude organizations, Fifth Realm campaigns, Passport entries, reports, notifications, payments, contracts, uploads, messaging, and waitlists. The application scorer receives only already-authorized, published Session, Circle, and Commons candidates and exposes reason labels without raw scores.
