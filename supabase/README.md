# Supabase foundation

Phase 2 introduces accounts, profiles, roles, onboarding taxonomies, audit records, and identity Row Level Security. Phase 3 adds modes, private Pulse check-ins, short-lived matching windows, current-interest joins, and Pulse RLS. Apply migrations in filename order only to a Five Fifths-owned Supabase project after reviewing `docs/MANUAL_SETUP.md`.

The browser uses only the project URL and publishable key. No service-role key is required by the Phase 3 application and none belongs in local source control.

The migrations intentionally exclude Sessions, registrations, Circle membership, Creator Commons workflows, Fifth Realm campaigns, Passport entries, payments, and messaging. The recommendation scorer lives in application code; it receives no candidate inventory until later phases.
