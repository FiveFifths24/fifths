# Supabase foundation

Phase 2 introduces the first migration for accounts, profiles, roles, onboarding taxonomies, audit records, and Row Level Security. Apply migrations only to a Five Fifths-owned Supabase project after reviewing `docs/MANUAL_SETUP.md`.

The browser uses only the project URL and publishable key. No service-role key is required by the Phase 2 application and none belongs in local source control.

The migration intentionally excludes Pulse check-ins, Sessions, Circles, Creator Commons, Fifth Realm, Passport, recommendations, registrations, payments, and messaging.
