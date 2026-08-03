# Database Design

Supabase PostgreSQL is the single source of truth. Ordered migrations implement identity (Phase 2), Pulse (3), Sessions (4), Circles (5), Creator Commons (6), Fifth Realm (7), Passport (9), and trust/safety (10). Phase 8 was application-code-only. Later modules extend this topology instead of building parallel systems.

## Domain groups

| Group                | Tables                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Identity             | `profiles`, `user_roles`, `interests`, `profile_interests`, `skills`, `profile_skills`                                 |
| Organizations        | `organizations`, `organization_members`                                                                                |
| Pulse                | `modes`, `pulse_check_ins`, `pulse_check_in_interests`                                                                 |
| Circles              | `circles`, `circle_interests`, `circle_members`                                                                        |
| Shared sessions      | `sessions`, `session_interests`, `registrations`, `attendance_records`                                                 |
| Creator Commons      | `creator_opportunities`, `opportunity_skills`, `opportunity_interests`, `opportunity_responses`, `saved_opportunities` |
| Fifth Realm          | `realm_campaigns`, `campaign_interests`, `campaign_applications`, `campaign_members`                                   |
| Passport             | `passport_entries`                                                                                                     |
| Trust and engagement | `member_feedback`, `reports`, `notifications`, private audit logs                                                      |

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
2. **Phase 3 complete:** Pulse enums, modes, private check-ins, current-interest joins, atomic write RPC, Pulse policies
3. **Phase 4 complete:** shared Sessions, interest joins, capacity-safe registrations, attendance, audit, Session policies
4. **Phase 5 complete:** Circles, interest joins, membership roles/state, Session associations, moderation audit, Circle policies
5. **Phase 6 complete:** Creator Commons opportunities, taxonomy joins, saves, private responses, acceptance, completion, and audit
6. **Phase 7 complete:** Fifth Realm campaigns, interest joins, private applications, capacity-safe membership, Session associations, and audit
7. **Phase 9 complete:** Passport entries, trusted-source issuance, corrections, audit, and RLS
8. **Phase 10 complete:** feedback, reports, notifications, moderation/admin RPCs, audit, and RLS
9. Organizations remain deferred
10. Clearly labeled demonstration seed data only where a later phase requires it

Generated database TypeScript types will be committed after the first migration and regenerated whenever schema changes.

## Phase 7 implemented schema

Phase 7 creates `realm_campaigns`, `campaign_interests`, `campaign_applications`, and `campaign_members`, then adds nullable `sessions.campaign_id`. Campaign profiles store original, system-neutral premise and discovery metadata, a constrained lifecycle, broad access and cadence labels, safety expectations, authoritative player capacity, one Pulse mode, energy bounds, stimulation, social pace, and one to eight active interests.

Every campaign begins as a private draft. Only centrally assigned game masters and platform administrators can create one; Circle association additionally requires local owner or host authority. The creator receives one fixed active `game_master` membership. Recruiting, active, completed, and cancelled transitions run through a validated RPC.

Applications are private, unique per campaign/member, and require explicit safety acknowledgement. `review_campaign_application` locks the campaign row before checking seats, then accepts the application, creates active player membership, and increments `active_player_count` in one transaction. Player departure and manager removal use the same authoritative row lock before decrementing capacity.

Realm Session association is limited to compatible private drafts managed by the caller. A database constraint keeps `campaign_id` and `source_module = 'realm'` consistent. Published Realm Sessions require active campaign membership, an existing registration, or Session-manager authority.

## Phase 7 RLS and grant summary

| Table                   | Authenticated access in Phase 7                                            |
| ----------------------- | -------------------------------------------------------------------------- |
| `realm_campaigns`       | Select eligible published/member/manager records; writes through RPCs only |
| `campaign_interests`    | Select only when the parent campaign is visible                            |
| `campaign_applications` | Select own rows or managed-campaign rows; writes through RPCs only         |
| `campaign_members`      | Select within active membership or manager scope; writes through RPCs only |
| private Realm audit     | No anonymous or authenticated access                                       |

No Phase 7 function inserts Passport credit, rule content, VTT state, payments, messages, reports, or notifications.

## Phase 3 implemented schema

Phase 3 creates the five-value `modes` taxonomy plus `pulse_check_ins` and `pulse_check_in_interests`. A check-in stores only matching inputs: mode, energy from 1–5, stimulation, social intensity, format, available time, an optional broad travel range, and up to five active interests. It stores no diagnosis, health note, free text, or precise location.

Every record receives a database-derived creation time and an expiration no more than 24 hours later. Expiration stops the record from being considered current; the member can still read it in private history.

`record_pulse_check_in` is an explicitly granted security-definer function that:

1. derives the member only from `auth.uid()`;
2. requires completed onboarding;
3. validates every enum, range, active taxonomy record, duplicate, and selection limit again in PostgreSQL;
4. creates the check-in and its interest rows atomically; and
5. returns only the new record identifier.

Authenticated clients have no direct insert, update, or delete grants on Pulse tables.

## Phase 3 RLS and grant summary

| Table                      | Authenticated access in Phase 3                             |
| -------------------------- | ----------------------------------------------------------- |
| `modes`                    | Select active mode rows                                     |
| `pulse_check_ins`          | Select caller-owned rows; insert only through validated RPC |
| `pulse_check_in_interests` | Select rows whose parent check-in belongs to the caller     |

Anonymous clients receive no access. Static contract tests guard the presence of these policies and the absence of direct member write grants; founder-run database tests must still exercise the policies with two real users.

## Recommendation contract

The Phase 8 application scorer accepts candidates already filtered for authorization and eligibility. It compares mode, energy, stimulation, social pace, format, time, current interests, and broad travel range, normalized by the signals each candidate actually supplies. Cross-module sorting is deterministic, duplicate identity includes module and record ID, and Personal Home softly balances initial product representation before filling remaining places by fit. The returned object strips internal weights and exposes only ordered candidates, nonnumeric fit levels, and plain-language reasons. This application layer does not change database RLS or product eligibility.

## Phase 4 implemented schema

Phase 4 creates `sessions`, `session_interests`, `registrations`, and `attendance_records`. A Session records a host snapshot, lifecycle status, format, start/end time, supported timezone, bounded capacity, broad venue/access label, one Pulse mode, an energy range, stimulation, social pace, and up to eight active interests. It stores no precise address, private meeting link, payment data, diagnosis, or participant note.

The `confirmed_registration_count` lives on the Session row so every authorized discovery read sees the same capacity state. `register_for_session` locks that row, validates publication and timing, checks the count, upserts the caller's unique registration, and increments within one transaction. Cancellation locks the same row and safely decrements. There is no Phase 4 waitlist.

Only `host` and `platform_admin` roles can call `create_session`. New records are drafts. `set_session_status` allows only draft-to-published, draft/published-to-cancelled, and ended published-to-completed transitions. Members cannot self-assign roles or mutate Session tables directly.

`get_session_roster` exposes registered member display identity only to the owning host or platform administrator. `mark_session_attendance` requires an active registration and a started, published/completed Session. A private trigger-backed audit table records the old/new attendance state and actor. Phase 9 separately observes the authoritative attended state for Passport issuance and correction.

## Phase 4 RLS and grant summary

| Table                | Authenticated access in Phase 4                                                    |
| -------------------- | ---------------------------------------------------------------------------------- |
| `sessions`           | Select published Sessions, managed Sessions, and Sessions tied to own registration |
| `session_interests`  | Select only when the parent Session is visible                                     |
| `registrations`      | Select own rows or managed-Session roster rows; mutate only through RPCs           |
| `attendance_records` | Select own rows or managed-Session rows; mutate only through the audited RPC       |

Anonymous clients receive no access. Authenticated clients receive select-only table grants. Static contract tests guard the policies, role checks, capacity lock, audit path, and absence of later product writes; live multi-user tests remain required.

## Phase 5 implemented schema

Phase 5 creates `circles`, `circle_interests`, and `circle_members`, then adds an optional `circle_id` to shared `sessions`. A Circle stores bounded identity, purpose, rules, visibility, join policy, participation format, broad access label, Pulse-fit signals, lifecycle state, and up to eight active interests. It stores no member posts, messages, diagnoses, precise address, report evidence, payment data, or Passport credit.

Public Circles support open, request-reviewed, or invite-only membership. Private Circles are invite-only and become readable only to invited/active members or authorized moderators. Membership uses one unique `(circle_id, user_id)` record with audited status transitions: requested, invited, active, declined, removed, or left.

Circle-local roles are owner, host, moderator, and member. They do not change `user_roles`. The creator becomes the fixed owner; Phase 5 intentionally has no ownership-transfer workflow. Owners/platform administrators control lifecycle and role assignment, moderators handle requests/invitations/removals, and local hosts can associate only draft Sessions they are separately authorized to manage.

`set_session_circle` adds or removes a Circle association only while a Session is a draft. The Session source module changes atomically with the foreign key. `can_view_session` now prevents a private-Circle Session from becoming generally discoverable while preserving access for active Circle members, registered participants, and authorized Session managers.

## Phase 5 RLS and grant summary

| Table              | Authenticated access in Phase 5                                                |
| ------------------ | ------------------------------------------------------------------------------ |
| `circles`          | Select published public, caller-related private, or authorized managed Circles |
| `circle_interests` | Select only when the parent Circle is visible                                  |
| `circle_members`   | Select caller-owned membership or rows in a Circle the caller may moderate     |
| `sessions`         | Existing Phase 4 select boundary plus private-Circle membership visibility     |

Anonymous clients receive no access. Authenticated clients receive select-only Circle table grants. Every write uses a narrowly granted RPC, derives the actor from `auth.uid()`, validates transitions again in PostgreSQL, and records membership/role changes in `private.circle_membership_audit_logs`. Static contract tests do not replace founder-run multi-user RLS and audit validation.

## Phase 6 implemented schema

Phase 6 creates `creator_opportunities`, `opportunity_skills`, `opportunity_interests`, `opportunity_responses`, and `saved_opportunities`. An opportunity stores creator provenance, optional Circle scope, bounded content and deliverables, kind, lifecycle, format, broad access label, deadline with timezone, estimated commitment, positions, authoritative accepted count, and Pulse-fit metadata. It stores no payment terms, contract, upload, contact detail, private meeting link, diagnosis, precise address, or Passport credit.

Independent opportunity creation requires a centrally assigned `creator` or `platform_admin` role. Active Circle owners and local hosts can create only for their scoped Circle. Every new opportunity begins as a private draft. Publishing, closing, and cancellation use constrained database transitions; completed status can be reached only through the two-sided confirmation workflow.

Each member has at most one response per opportunity. Submitted responses can be withdrawn and resubmitted while the opportunity remains eligible. Acceptance locks the opportunity row before checking and incrementing `accepted_count`; a filled opportunity closes atomically. Accepted participants can withdraw before completion, which decrements the authoritative count and safely reopens only a deadline-active opportunity that closed because it filled.

Completion requires a closed opportunity, an accepted response, participant confirmation, and authorized-manager confirmation. When both exist, the response completes; the opportunity completes when no accepted response remains pending and at least one response completed. Private audit tables capture lifecycle and response/confirmation changes. Phase 9 observes only these final states for duplicate-safe participant and creator Passport entries.

## Phase 9 implemented schema

Phase 9 creates `passport_entries` plus activity, source-module, entry-status, and correction-kind enums. Entries retain a bounded source-title snapshot and UUID rather than a polymorphic foreign key, so a member's verified history survives later source visibility changes while issuance remains traceable.

Private trigger functions issue or correct entries from trusted source state. One unique member/activity/source key prevents duplicates during concurrent or repeated processing. Session host activity additionally requires a completed Session with at least one attended non-host participant. Existing eligible attendance, qualifying Session hosting, mutually completed Commons work, and completed active Realm membership are backfilled through the same issuer.

Automatic source corrections and administrative corrections are distinct. Only source corrections may be restored by later valid source state; a platform-admin revocation requires a reason and cannot be undone by replay. Every insert or status change reaches `private.passport_entry_audit_logs`.

## Phase 9 RLS and grant summary

| Table                    | Authenticated access in Phase 9                             |
| ------------------------ | ----------------------------------------------------------- |
| `passport_entries`       | Select caller-owned history only; no direct mutation grants |
| private Passport audit   | No anonymous or authenticated access                        |
| private issuance helpers | Trigger/backfill use only; no authenticated execute grant   |
| correction RPC           | Callable but rejects every caller without `platform_admin`  |

No Phase 9 schema stores points, popularity, diagnoses, public highlights, manual claims, reports, notifications, messages, payment data, or leaderboard state.

## Phase 10 implemented schema

Phase 10 creates `member_feedback`, `reports`, and `notifications` plus bounded workflow enums. Feedback stores one private member statement, area, optional future-contact consent, and review state. Reports store a structured target type, category, summary, details, optional internal FIFTHS path, and lifecycle state. They do not store uploads, external evidence links, diagnoses, precise locations, or public accusations.

Submission and mutation occur only through security-definer RPCs that derive the actor from `auth.uid()`. Daily limits cap feedback and report intake at five each, and a matching active report cannot be repeated within 24 hours. Moderators can triage/escalate; platform administrators own final decisions and feedback review. Internal notes and status evidence are stored in private audit tables.

Notifications are deduplicated by member and source key. Product triggers create bounded updates without copying protected source content, while caller-owned RPCs mark one or all notifications read.

| Table                | Authenticated access in Phase 10                                                         |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `member_feedback`    | Select caller-owned rows; platform-admin review visibility; no direct writes             |
| `reports`            | Select caller-owned rows or restricted reviewer queue; no target access or direct writes |
| `notifications`      | Select caller-owned rows only; no direct writes                                          |
| private audit tables | No anonymous or authenticated access                                                     |

No Phase 10 schema creates messages, uploads, account sanctions, public moderation records, payments, leaderboards, email/push delivery, or AI/ML state.

## Phase 6 RLS and grant summary

| Table                   | Authenticated access in Phase 6                                                      |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `creator_opportunities` | Published eligible records, managed records, or records tied to caller save/response |
| `opportunity_skills`    | Select only when the parent opportunity is visible                                   |
| `opportunity_interests` | Select only when the parent opportunity is visible                                   |
| `opportunity_responses` | Select caller-owned response or responses on an authorized managed opportunity       |
| `saved_opportunities`   | Select caller-owned saves only                                                       |

Anonymous clients receive no access. Authenticated clients receive select-only table grants. Every write uses a narrowly granted security-definer RPC, validates `auth.uid()` and the current lifecycle again in PostgreSQL, and writes audit-sensitive changes to private tables. Static contract tests do not replace founder-run multi-user RLS, capacity, withdrawal, and completion validation.
