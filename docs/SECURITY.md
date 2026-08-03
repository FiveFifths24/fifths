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
- Keep the Phase 11 response headers and dependency gates enabled; configure monitoring, backup/recovery, operational secret rotation, and restore testing.
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
- Phase 9 observes attended state through a private trigger. Members still cannot award attendance or call the Passport issuer.

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

## Phase 6 implemented controls

- All live Commons routes remain inside the protected, onboarding-gated member shell. The public `/commons` overview remains informational.
- Only centrally assigned creators/platform administrators can create independent opportunities. Active Circle owners and local hosts can create and manage only opportunities associated with their Circle.
- Every opportunity begins as a private draft. Publication, closure, and cancellation use constrained RPC transitions; authenticated clients receive no direct table write grants.
- Private-Circle opportunities are unreadable to unrelated members. Associated taxonomy rows inherit the parent opportunity's visibility boundary.
- Saves are caller-owned and private. Saving never reserves a position or submits a response.
- Responses are readable only by their owner and authorized opportunity managers. Creator response reads use a narrow RPC that returns display identity, statement, availability, status, and confirmation state—not email or private profile data.
- Response content is length-bounded and explicitly excludes contact, payment, diagnosis, precise-address, upload, and contract collection.
- Acceptance locks the opportunity row before checking authoritative capacity. Unique `(opportunity_id, user_id)` rows prevent duplicate responses.
- Participants can withdraw submitted or accepted responses. Accepted withdrawal decrements capacity and reopens only a still-active opportunity that closed because it filled.
- Completion requires a closed opportunity and separate confirmation from both the accepted participant and an authorized manager. Opportunity and response state changes are recorded in private audit tables.
- Commons recommendations receive only RLS-eligible published records plus bounded matching metadata. Required skills are labels, not a hidden eligibility score; raw recommendation scores remain hidden.
- No save, response, or acceptance action creates Passport activity. Phase 9 observes only mutually completed responses and fully completed opportunities; none of these actions creates payment, a contract, a message, a notification, or a report.

The Phase 6 migration still requires founder-run positive/negative RLS and concurrency tests with a creator, Circle host, two responders, accepted participant, and unrelated member. Static SQL contract tests protect the checked-in intent but do not prove the deployed database configuration, audit behavior, or contention handling.

## Phase 7 implemented controls

- All live Realm routes remain inside the protected, onboarding-gated member shell. Public `/realm` and `/realm/safety` pages remain informational.
- Only centrally assigned game masters and platform administrators create campaigns. Optional Circle association also requires active local owner or host authority; no campaign action changes platform or Circle roles.
- Every campaign begins as a private draft. Recruiting, active, completed, and cancelled transitions use constrained RPCs; authenticated clients receive no direct Realm-table write grants.
- Private-Circle campaigns and their interest rows are unreadable to unrelated members. A Circle cannot be archived while associated campaigns are recruiting or active.
- Applications are readable only by the applicant and authorized campaign manager. The narrow manager RPC returns display identity, structured application fields, experience comfort, status, and submission time—not email or private profile data.
- Application content is length-bounded and explicitly excludes contact information, diagnoses, precise addresses, copyrighted rules, and proprietary game content. Safety acknowledgement is required in both application validation and the database constraint.
- Acceptance locks the campaign row before checking authoritative player capacity. Unique campaign/application and campaign/member keys prevent duplicates; accepted membership and capacity update occur atomically.
- Game-master, application, and membership state changes write to private audit tables unavailable to anonymous and authenticated clients.
- Only compatible private draft Sessions can be associated. Published Realm Sessions require active campaign membership, prior registration, or Session-management authority.
- Realm recommendations receive only RLS-eligible campaign records and bounded matching metadata. Private applications, safety acknowledgements, and roster state never enter ranking; raw scores remain hidden.
- No campaign creation, application, membership, or Session association creates Passport activity. Phase 9 observes only final campaign completion for active members; Phase 10 may issue a bounded private application-status notification. Realm actions still create no payment, message, report, VTT record, or copyrighted game record.

The Phase 7 migration still requires founder-run positive/negative RLS and concurrency tests with a game master, Circle host, two applicants, active player, departed player, and unrelated member. Static SQL contract tests protect checked-in intent but do not prove deployed database configuration, audit behavior, or contention handling.

## Phase 8 implemented controls

- Unified ranking consumes only records already returned by each product's authenticated RLS-protected discovery query. It cannot reveal an otherwise unreadable Circle, opportunity, campaign, Session, application, response, roster, or moderation record.
- Product adapters pass bounded matching metadata only. Private applications, responses, memberships, attendance, completion confirmations, and profile skill data do not enter the scorer.
- Applicable-signal normalization prevents missing product fields from becoming an implicit negative signal. Tests cover cross-module parity, stable ordering, soft representation limits, duplicate composite keys, and zero-reason filtering.
- Only nonnumeric fit labels and truthful reason strings leave the scorer. Internal weights are neither returned to UI code nor written to the database.
- The unified feed uses the member's explicit, unexpired Pulse. It does not infer energy, health, diagnosis, interests, or suitability from clicks, participation, protected characteristics, or missing data.
- Ranking changes presentation order only. It does not change database eligibility, capacity, application or membership state, authorization, or future Passport credit.
- Phase 8 adds no migration, grants, client writes, analytics collection, AI/ML dependency, or service-role access.

Live review still requires representative eligible inventory in the founder-owned non-production project to confirm that deployed RLS and real product distributions produce understandable results. Offline deterministic tests cannot validate production inventory quality or substitute for ongoing founder review of weights and explanation language.

## Phase 9 implemented controls

- Passport entries are caller-owned under RLS. Authenticated members receive select only and cannot insert, update, delete, self-verify, or choose another member's target identity.
- The issuer is a private security-definer function with no authenticated execute grant. Only database triggers and the one-time migration backfill can call it.
- Issuance observes authoritative source state already protected by earlier phases: host-marked attendance, completed Sessions with at least one attended non-host participant, mutually completed Commons responses, completed opportunities, and active Realm membership at campaign completion.
- The unique member/activity/source constraint and conflict-safe issuer make repeated trigger execution and backfill idempotent. No browser-generated idempotency key is trusted.
- A corrected attendance source revokes rather than deletes its entry. A later valid source correction can restore the same identity; a platform-admin administrative revocation cannot be silently restored by source replay.
- The correction RPC requires the centrally granted `platform_admin` role and a bounded reason. Every entry insertion or status change writes to a private audit table unavailable to anonymous or authenticated clients.
- Source title and provenance are bounded snapshots. Passport stores no free-form member claim, diagnosis, precise location, private application answer, response statement, contact detail, payment data, or protected-profile attribute.
- Passport is private by default and exposes no point total, public profile, highlight, leaderboard, export, or organization issuer.

The Phase 9 migration requires founder-run positive/negative tests with a host, participant, creator, Commons responder, game master, active player, platform administrator, and unrelated member. Test duplicate replay, attended-to-absent-to-attended correction, administrative revocation resistance, backfill, cross-user denial, and private audit records before production.

## Phase 10 implemented controls

- Reports and feedback are never public and are unreadable to the subject of a report. Reporters see their own status but cannot read internal moderation notes.
- Direct table writes are revoked. Submission RPCs derive identity from `auth.uid()`, enforce content limits, accept only internal FIFTHS context paths, cap daily intake, and block matching active reports.
- Centrally assigned moderators can triage or escalate only. Final resolution/dismissal and private feedback review require `platform_admin`; final reports cannot be reopened in Phase 10.
- Every report and feedback status transition reaches a private audit table. Review notes are session-local input captured only by the private report audit trigger.
- Notifications remain caller-owned under RLS. Private issuance helpers are unavailable to authenticated clients, dedupe repeated events, and contain no report details, application answers, contact data, diagnosis data, or precise location.
- Safety copy explicitly distinguishes reporting from emergency response and prevents claims of automated enforcement or guaranteed outcomes.

The Phase 10 migration requires founder-run positive/negative tests with two members, a moderator, a platform administrator, and workflow owners. Test cross-user report/feedback/notification denial, daily and duplicate limits, moderator final-decision denial, admin completion, audit-note privacy, mark-read ownership, and every source notification trigger before production.

## Phase 11 implemented controls

- Every application response receives a Content Security Policy, frame denial, MIME sniffing prevention, a strict-origin referrer policy, and a permissions policy that disables camera, microphone, and geolocation. Production responses also receive two-year HSTS and insecure-request upgrades.
- The CSP permits only same-origin application resources, HTTPS images, and the required Supabase HTTPS/WebSocket origins. Next.js inline runtime styles/scripts remain allowed; this is documented residual policy debt, not a claim of a nonce-based strict CSP.
- Browser tests exercise representative public, auth-interface, and policy pages at desktop and mobile dimensions, verify no horizontal overflow, and check security-header delivery.
- axe-core blocks serious and critical WCAG regression findings on representative pages. Automated scans do not replace manual assistive-technology or disability-led review.
- GitHub Actions uses lockfile installs, read-only repository permission, bounded timeouts, current major official actions, both npm audit scopes, and retained browser diagnostics.
- The release checklist requires environment separation, live negative RLS and concurrency checks, production SMTP, platform rate limiting, monitoring, backup/restore rehearsal, legal/privacy review, manual accessibility review, and a named release/rollback owner before beta.

The repository remains a public-beta no-go until those founder-owned controls are completed. Security headers do not compensate for an untested deployed database, missing operational monitoring, or draft legal policy.
