# Database Design

Supabase PostgreSQL is the single source of truth. Phase 2 adds the first versioned migration at `supabase/migrations/202608010001_phase_2_identity_foundation.sql`; later modules will extend this topology instead of building parallel systems.

## Domain groups

| Group                | Tables                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Identity             | `profiles`, `user_roles`, `interests`, `profile_interests`, `skills`, `profile_skills`        |
| Organizations        | `organizations`, `organization_members`                                                       |
| Pulse                | `modes`, `pulse_check_ins`                                                                    |
| Circles              | `circles`, `circle_members`                                                                   |
| Shared sessions      | `sessions`, `session_interests`, `registrations`, `attendance_records`                        |
| Creator Commons      | `creator_opportunities`, `opportunity_skills`, `opportunity_responses`, `saved_opportunities` |
| Fifth Realm          | `realm_campaigns`, `campaign_applications`, `campaign_members`                                |
| Passport             | `passport_entries`                                                                            |
| Trust and engagement | feedback tables, `reports`, `notifications`, `audit_logs`                                     |

## Conventions

- UUID primary keys; `auth.users.id` is the root user identifier.
- `created_at` and `updated_at` are timezone-aware.
- Foreign keys encode ownership and prevent orphaned data.
- Unique constraints prevent duplicate usernames, registrations, memberships, saves, applications, and source-based Passport credit.
- Check constraints protect status, capacity, points, age, and time ranges.
- Index foreign keys plus fields used by discovery filters and active-status queries.
- Audit-sensitive content uses lifecycle status (`draft`, `published`, `cancelled`, `closed`, `archived`) rather than silent deletion.

## Passport idempotency

Each verified entry will have a stable source identity, such as `(user_id, activity_type, session_id)` or an explicit `idempotency_key`, protected by a unique index. A security-definer database function may create entries only after checking the caller's authorized role and underlying completion record. Users cannot insert verified entries for themselves.

## Recommendation reads

The recommendation service will fetch eligible candidates and calculate documented scores in application code. It returns reason labels, never raw scores. PostgreSQL remains responsible for privacy, eligibility, active status, capacity, and location/filter narrowing.

## Phase 2 implemented schema

Phase 2 creates `profiles`, `user_roles`, `interests`, `profile_interests`, `skills`, and `profile_skills`. It also creates a non-exposed `private.role_audit_logs` table. Every exposed table has RLS enabled before grants are issued.

The `handle_new_user` trigger creates one profile and the non-elevated `member` role for each Auth user. Elevated roles have no authenticated insert, update, or delete grant and every role insert/delete is recorded in the private audit table.

`complete_onboarding` is an explicitly granted security-definer function that:

1. derives the target only from `auth.uid()`;
2. validates username, display name, pronouns, timezone, and taxonomy limits again in PostgreSQL;
3. rejects unknown or inactive taxonomy IDs;
4. updates the caller's profile and replaces only the caller's interest/skill rows in one transaction; and
5. records the 18+ self-attestation timestamp and onboarding completion.

No medical diagnosis, date of birth, or precise home address is collected.

## RLS and grant summary

| Table                                 | Authenticated access in Phase 2                                   |
| ------------------------------------- | ----------------------------------------------------------------- |
| `profiles`                            | Select own row; onboarding writes only through the validated RPC  |
| `user_roles`                          | Select own rows; no member mutation grants                        |
| `interests`, `skills`                 | Select active taxonomy rows                                       |
| `profile_interests`, `profile_skills` | Select own rows; onboarding writes only through the validated RPC |
| `private.role_audit_logs`             | No anonymous or authenticated access                              |

## Migration order

1. **Phase 2 complete:** extensions, identity enums/helpers, profiles, roles, interests, skills, identity policies
2. Organizations
3. remaining taxonomies (including Pulse modes)
4. Circles and Sessions
5. Commons and Realm
6. Passport, feedback, reports, notifications, audit logs
7. indexes, functions, triggers, RLS policies
8. clearly labeled demonstration seed data

Generated database TypeScript types will be committed after the first migration and regenerated whenever schema changes.
