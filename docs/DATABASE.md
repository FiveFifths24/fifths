# Database Design

Supabase PostgreSQL is the single source of truth. Phase 2 will add versioned SQL migrations; Phase 0 defines the topology so later modules share data instead of building parallel systems.

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

## Migration order

1. Extensions, shared enums/helpers, profiles
2. Roles and organizations
3. taxonomies (modes, interests, skills)
4. Circles and Sessions
5. Commons and Realm
6. Passport, feedback, reports, notifications, audit logs
7. indexes, functions, triggers, RLS policies
8. clearly labeled demonstration seed data

Generated database TypeScript types will be committed after the first migration and regenerated whenever schema changes.
