# Security

Security uses overlapping controls: server authorization prevents inappropriate actions before a query, while Supabase Row Level Security protects records even if application code makes a mistake.

## Required controls

- Enable RLS on every application table before exposing it.
- Default-deny, then add narrow policies for each action and role.
- Store passwords only in Supabase Auth.
- Keep Pulse history, applications, reports, private feedback, meeting links, and private Circle content restricted.
- Prevent users from assigning elevated roles or self-verifying Passport credit.
- Validate all inputs with Zod on the server and apply database constraints independently.
- Escape rendered user content; do not introduce raw HTML without sanitization.
- Record privileged role, moderation, attendance, and Passport changes in audit logs.
- Keep `.env.local` and all service-role credentials out of Git.
- Return safe user-facing errors and log detailed server errors without private data.

## Client boundaries

`NEXT_PUBLIC_SUPABASE_URL` and the Supabase publishable/anonymous key are designed for browser use when RLS is correct. The service-role key bypasses RLS and is server-only. It must be configured only in protected server environments and used through narrowly scoped helpers.

## Phase 2 implemented controls

- Next.js Proxy refreshes Auth cookies and uses `getClaims()` for protected-route decisions; server pages use `getUser()` when they need the current Auth record.
- Login failures are generic, and password-reset requests return the same success message regardless of account existence.
- Callback and login destinations pass through a same-origin relative-path allow rule to prevent open redirects.
- Passwords must contain 12–72 characters and are sent only to Supabase Auth.
- The application has no service-role client and no server secret is required for Phase 2.
- All account and onboarding inputs are validated by Zod before a Supabase mutation, then constrained again by PostgreSQL.
- Public Phase 2 tables use default-deny RLS plus explicit grants. Authenticated members can read only their own profile and roles and cannot mutate `user_roles`.
- Onboarding uses one security-definer function scoped to `auth.uid()`; the caller cannot choose a target user ID.
- Role changes are audited in a private schema that anonymous and authenticated clients cannot access.
- Account pages do not expose Pulse history, applications, feedback, reports, precise location, or other later-phase private data.

RLS still requires integration testing against the founder-owned Supabase project with multiple real test users before public beta. Static contract tests in this repository detect missing Phase 2 RLS statements and accidental member role-mutation grants, but they do not replace database execution tests.

## Phase 3 implemented controls

- `/home` and all nested Pulse routes join the existing protected-route list and verify the current user and completed onboarding on the server.
- Pulse form data is validated by Zod and independently constrained inside PostgreSQL.
- Check-in writes use `record_pulse_check_in`, which derives its target only from `auth.uid()`; callers cannot supply or impersonate a user ID.
- Authenticated members receive select-only table grants. They cannot directly insert, update, or delete Pulse rows or joins.
- Pulse-history RLS allows only the owning member to read a check-in. Interest rows authorize through their parent check-in.
- A check-in can affect matching for no more than 24 hours, using timestamps created inside the database.
- Pulse collects no diagnosis, health note, free text, date of birth, or precise location. Optional travel preference is only a broad maximum distance.
- Recommendation ranking is deterministic application code. It receives already-eligible candidates, exposes reason labels rather than raw scores, and uses no AI or machine learning.
- Personal Home renders no demonstration sessions, communities, opportunities, or campaigns as if they were live.

The Phase 3 migration also needs multi-user positive and negative RLS tests in the founder-owned non-production project. Static SQL contract tests are safeguards, not proof that the deployed database and Auth configuration are correct.

## Dependency supply-chain controls

- Keep `package-lock.json` committed and use `npm ci` in automated environments so reviewed dependency resolution is reproducible.
- Run `npm audit --omit=dev` alongside the full formatting, lint, type, test, and production-build gates when changing dependency resolution.
- Next.js 16.2.12 declares vulnerable transitive `postcss` 8.4.31 and `sharp` 0.34.x ranges. The root package uses exact npm overrides to resolve those packages to patched `postcss` 8.5.25 and `sharp` 0.35.3 throughout the dependency tree.
- Treat the override as temporary compatibility debt. Recheck it on each Next.js upgrade and remove it once the framework declares patched versions directly; never use `npm audit fix --force` when it proposes a framework downgrade.

## Rate-limiting plan

Before public beta, rate-limit authentication, password reset, content creation, applications, responses, registrations, and reports. Prefer platform/database-backed limits that work across serverless instances. Add bot protection to abuse-prone public forms. This is documented but intentionally not implemented before endpoints exist.

## Launch security work

- Threat-model each role and cross-organization boundary.
- Test RLS using multiple users and negative cases.
- Review storage bucket policies and upload type/size limits.
- Establish report escalation, account suspension, and evidence-retention procedures.
- Configure security headers, monitoring, backup/recovery, dependency scanning, and secret rotation.
- Complete privacy and legal review; the application is 18+ and will not collect diagnoses or precise home addresses.

## Phase 4 implemented controls

- All Session routes remain inside the protected, onboarding-gated member shell; the public product overview routes are unchanged.
- Only centrally assigned `host` and `platform_admin` roles can create Sessions. Members have no role-mutation grant and no application path can self-elevate.
- New Sessions begin as private drafts. Publication, cancellation, and completion run through constrained status transitions in a security-definer function.
- Authenticated clients receive select-only grants on Session, interest, registration, and attendance tables. Every write uses a narrowly granted RPC that derives or validates the actor with `auth.uid()`.
- Registration locks the Session row before evaluating capacity, so concurrent requests cannot overbook the authoritative count. The `(session_id, user_id)` primary key prevents duplicates.
- A member can read only their registration and attendance records. Session hosts and platform administrators can read a roster only for Sessions they are authorized to manage.
- Attendance requires an active registration and a started, published/completed Session. Every insert or change is recorded in `private.session_attendance_audit_logs`, which has no anonymous or authenticated access.
- Session discovery reads only published future records. Draft and cancelled Sessions remain visible only to authorized managers or members tied to a registration for lifecycle clarity.
- Hosting stores a broad venue/access label only. Phase 4 does not collect precise addresses, private meeting links, participant notes, diagnosis data, payment data, or messages.
- Attendance does not award Passport credit. Verified, idempotent issuance remains isolated to Phase 9.

The Phase 4 migration still requires founder-run contention tests and positive/negative RLS tests with a host, two members, and an unrelated account. Static SQL contract tests protect the checked-in intent but do not prove the deployed database configuration.

## Phase 5 implemented controls

- All live Circle routes remain inside the protected, onboarding-gated member shell. The public `/circles` product overview remains informational.
- Only centrally assigned `host` and `platform_admin` roles can create a Circle. Creation produces a private draft and one active owner membership; no member can self-elevate a platform role.
- Circle-local owner, host, moderator, and member roles are scoped to one Circle. They never write to or imply `user_roles`.
- Private Circles are invite-only. Their identity, rules, interests, membership, and associated published Sessions are unreadable to unrelated members under RLS.
- Open joins, requests, invitations, approvals, declines, removals, departures, and role changes use security-definer RPCs with database-side transition validation. Authenticated clients receive no direct Circle-table write grant.
- Only owners/platform administrators assign local host or moderator roles. Local moderators cannot remove or demote an owner, host, or another moderator; those actions require owner/platform authority.
- Membership inserts and updates are recorded in `private.circle_membership_audit_logs`, which has no anonymous or authenticated access.
- Session association requires both authorization over the draft Session and Circle-local hosting authority. A published Session cannot be attached after its visibility boundary is active.
- Archiving is final in Phase 5 and is rejected while the Circle has a future published Session. This prevents an archived Circle from silently stranding active public activity.
- Circle recommendations receive only already-visible published records and bounded matching metadata. Private membership state and moderator queues never enter ranking, and raw scores remain hidden.
- Phase 5 stores no posts, chat, direct messages, diagnosis data, precise address, payment data, report evidence, or Passport entry.

The Phase 5 migration still requires founder-run positive/negative RLS tests with an owner, local host, local moderator, applicant, invitee, active member, and unrelated member. Static SQL contract tests protect the checked-in intent but do not prove the deployed database configuration or audit behavior.
