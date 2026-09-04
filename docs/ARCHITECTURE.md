# Architecture

The finite friend-activity and opt-in discovery architecture is documented in
`docs/INTENTIONAL_ACTIVITY_DISCOVERY.md`. Personal Home performs no global
module discovery queries; canonical activity is retrieved through one
privacy-checking RPC, and global exploration is a separate route.

## Decision summary

FIFTHS will be one Next.js application and one Supabase project. This **modular monolith** keeps the MVP affordable and understandable while enforcing product boundaries in code. It avoids five separate apps, duplicated accounts, and fragile data synchronization.

## Layers

1. **Routes (`src/app`)** compose pages and layouts using the App Router.
2. **Features (`src/features`)** own module-specific UI, schemas, server actions, and queries.
3. **Shared platform (`src/components`, `src/lib`, `src/types`)** owns reusable presentation, authentication, database clients, analytics, and shared types.
4. **Supabase (`supabase`)** owns migrations, seed data, database functions, and Row Level Security policies.

Server Components are the default. Client Components are used only for interaction or browser APIs. All mutations will run through server-side actions/handlers that validate with Zod and rely on both authorization checks and database RLS.

## Shared data model

`auth.users` provides login identity and maps one-to-one to `profiles`. A profile connects to interests, skills, roles, Circles, registrations, opportunity responses, campaigns, Pulse history, notifications, and one Passport ledger.

`sessions` is the common scheduled-experience type. Its optional `circle_id`, `campaign_id`, and `organization_id` plus `source_module` let all five products schedule experiences without duplicating event logic.

Pulse reads the latest valid private check-in and ranks eligible records from Sessions, Circles, Commons, and Realm using one deterministic scoring service. Passport now receives verified, idempotent entries from database-observed activity; it never trusts a browser request to award credit.

## Proposed folder structure

```text
src/
  app/                 routes, layouts, route handlers
  components/          shared accessible UI
  config/              typed application configuration
  features/            module-owned product code
  lib/
    analytics/         provider-neutral event interface
    auth/              server authorization helpers
    recommendations/   rule-based scoring
    supabase/           browser/server/admin clients
    validation/         shared Zod schemas
  types/               cross-feature and generated DB types
supabase/
  migrations/          ordered SQL schema and policies
  seed.sql              clearly marked demo content
docs/                  founder and engineering documentation
tests/e2e/              essential Playwright journeys (Phase 11)
```

## Dependency decisions

| Dependency                  | Why it exists                                                     |
| --------------------------- | ----------------------------------------------------------------- |
| Next.js + React             | One responsive web app with server rendering and route protection |
| TypeScript                  | Finds data-shape mistakes before users do                         |
| Tailwind CSS                | Consistent mobile-first visual system without scattered styles    |
| Supabase JS + SSR           | Typed database/auth access that supports secure server sessions   |
| Zod                         | Validates forms, environment values, and external data at runtime |
| React Hook Form + resolvers | Accessible forms with focused rerenders and Zod integration       |
| Lucide React                | Consistent accessible icon primitives                             |
| clsx + tailwind-merge       | Predictable reusable component class composition                  |
| Vitest + Testing Library    | Fast behavior-focused unit and component tests                    |
| Playwright + axe-core       | Desktop/mobile journeys and accessibility regression checks       |
| ESLint + Prettier           | Automated correctness and formatting standards                    |

shadcn/ui is intentionally not installed as a package. FIFTHS owns the small Phase 1 component primitives and avoids unused UI code. Phase 11 activates Playwright for deterministic public journeys; live authenticated multi-user journeys remain environment-owned release gates.

## Architectural rules

- No feature reads private internals from another feature.
- No service-role key enters browser code.
- No raw, unvalidated form payload reaches a mutation.
- Authorization exists server-side and in RLS; hidden buttons are not security.
- Shared status values use database constraints and TypeScript unions.
- Analytics code calls an internal interface, not a paid vendor directly.
- Audit-sensitive records use statuses or revocation rather than destructive deletion.

## Phase 1 public architecture

The root layout now owns the public shell: skip link, responsive header, main landmark, and footer. Route pages remain Server Components by default. `SiteHeader` and `PasswordField` are narrowly scoped Client Components because they require menu and visibility state.

Reusable UI is organized by responsibility:

- `src/components/ui` — tokens expressed through buttons, badges, containers, headings, messages, and preview states
- `src/components/shell` — header, footer, and page hero
- `src/components/forms` — accessible field and authentication-interface primitives
- `src/components/modules` — shared module cards, public module overview, and participation loop
- `src/components/legal` — readable policy document shell with required draft notices

No component initializes Supabase or implies successful authentication. Disabled auth submissions make the Phase 1 boundary explicit while preserving semantic form structure for Phase 2.

## Phase 1 routes

| Area             | Routes                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| Core public      | `/`, `/about`, `/ecosystem`                                                           |
| Products         | `/pulse`, `/circles`, `/commons`, `/realm`, `/passport`                               |
| Auth interfaces  | `/login`, `/signup`, `/forgot-password`                                               |
| Legal and safety | `/privacy`, `/terms`, `/community-guidelines`, `/commons/guidelines`, `/realm/safety` |

Nested guideline routes reserve clear informational locations without conflicting with future Commons opportunities or Realm campaign routes.

## Phase 2 identity architecture

Phase 2 activates the account layer without crossing into product behavior:

- `src/lib/supabase/client.ts` creates the browser client only when interactive client behavior needs it.
- `src/lib/supabase/server.ts` creates a cookie-aware server client for Server Components, Server Actions, and Route Handlers.
- root `proxy.ts` delegates token refresh to `src/lib/supabase/proxy.ts`; protected-route decisions use validated Auth claims rather than an unverified cookie session.
- `src/features/auth` owns Zod schemas, server actions, action state, and accessible interactive forms.
- `src/features/onboarding` owns profile validation, the onboarding form, and the single atomic onboarding RPC call.
- `src/types/database.ts` is the checked-in Phase 2 database type snapshot and must be regenerated from the linked project after applying migrations.
- `supabase/migrations` is the source of truth for identity tables, constraints, triggers, functions, grants, and RLS.

The application never initializes a service-role client. Signup, login, password recovery, and onboarding use only the publishable key and the signed-in user's session under RLS.

## Phase 2 routes

| Area          | Routes                                                      | Boundary                                                                |
| ------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| Account entry | `/login`, `/signup`, `/forgot-password`, `/update-password` | Email/password Auth only; social login is deferred                      |
| Auth exchange | `/auth/callback`                                            | Exchanges PKCE codes and accepts only same-origin relative destinations |
| Identity      | `/onboarding`, `/account`                                   | Protected profile setup and account readiness; not a product dashboard  |

Phase 2 does not add Pulse check-ins, recommendations, Sessions, registrations, Circle membership, Creator Commons responses, Fifth Realm applications, or Passport entries. Those remain isolated to their later feature phases.

## Phase 3 Pulse and personal Home architecture

Phase 3 adds the first private product behavior while retaining the modular-monolith boundary:

- `src/app/home` owns the protected personal experience. It does not replace the public `/pulse` overview or claim later module routes.
- `src/components/member` owns the reusable member navigation and signed-in shell inside the existing root design system.
- `src/features/pulse` owns check-in validation, the accessible form, the server action, and private-history presentation.
- `src/lib/recommendations` owns a pure deterministic ranking function shared by future modules. Callers must fetch only eligible records; PostgreSQL remains responsible for privacy, publication status, capacity, and later location narrowing.
- `supabase/migrations/202608020001_phase_3_pulse_foundation.sql` owns Pulse taxonomies, records, constraints, grants, the authenticated-user RPC, and RLS.

The scoring service accepts normalized Pulse signals and candidate metadata, applies documented weights, uses start time and ID for stable ties, and returns ordered candidates with reason labels. Numeric scores stay internal. Phase 3 does not query Sessions, Circles, Commons, or Realm because those records do not exist yet.

## Phase 3 routes

| Area              | Route                 | Boundary                                                        |
| ----------------- | --------------------- | --------------------------------------------------------------- |
| Personal overview | `/home`               | Real account/Pulse state and honest no-inventory matching state |
| Pulse check-in    | `/home/pulse`         | Private validated capacity signals; no diagnoses or free text   |
| Pulse history     | `/home/pulse/history` | Latest 30 caller-owned records under RLS                        |
| Identity          | `/account`            | Existing identity summary with a link back to personal Home     |

The public `/pulse` route remains the product overview. Phase 4 owns Session discovery, hosting, registration, capacity, and attendance; none of those are stubbed as live behavior in Phase 3.

## Phase 4 shared Sessions architecture

Phase 4 activates the shared scheduled-experience layer without claiming a product-specific workflow:

- `src/features/sessions` owns Session validation, host and member actions, cards, registration controls, and the adapter into the shared recommendation scorer.
- `src/app/home/sessions` owns authenticated discovery, detail, hosting, and host-management routes. `/home/registrations` owns the caller's private registration history.
- `supabase/migrations/202608030001_phase_4_sessions_foundation.sql` owns Session lifecycle, capacity, registration, attendance, functions, grants, audit records, and RLS.
- Hosts create private drafts through a role-authorized RPC. Publishing, cancelling, and completion use constrained status transitions; authenticated clients receive no direct table mutation grants.
- Registration locks the Session row before checking and incrementing authoritative capacity. Re-registration is idempotent, cancellation decrements capacity safely, and Phase 4 deliberately has no waitlist.
- Attendance is available only after a Session begins, only for active registrants, and only to the Session host or a platform administrator. Every insert or change is written to a private audit table; the later Phase 9 trigger mirrors only `attended` state into Passport.

Published, upcoming Sessions are the first real candidate inventory for the Phase 3 scorer. The adapter supplies mode, energy, stimulation, social pace, format, duration, time, and interests; it does not bypass RLS, publication state, timing, or capacity checks. Personal Home shows at most three matches, while discovery orders the complete eligible result set. Both use reason labels without exposing numeric scores.

## Phase 4 routes

| Area                 | Route                             | Boundary                                                         |
| -------------------- | --------------------------------- | ---------------------------------------------------------------- |
| Session discovery    | `/home/sessions`                  | Published future Sessions; Pulse-aware ordering when available   |
| Session details      | `/home/sessions/[sessionId]`      | Authorized record details and caller-owned registration controls |
| Hosting              | `/home/sessions/host`             | Host/platform-admin role gate and draft creation                 |
| Session management   | `/home/sessions/host/[sessionId]` | Host/admin lifecycle, roster, and audited attendance controls    |
| Registration history | `/home/registrations`             | Caller-owned active and cancelled registrations                  |

Phase 4 does not create Circle membership, Commons opportunities, Realm campaigns, organizations, Passport entries, payments, messaging, or an administrator UI. Those remain assigned to later phases.

## Phase 5 Circles architecture

Phase 5 activates Circles as the first product-specific community layer while preserving the shared identity, Pulse, and Session boundaries:

- `src/features/circles` owns Circle validation, server actions, discovery cards, membership controls, and the adapter into the shared recommendation scorer.
- `src/app/home/circles` owns protected discovery, details, the caller's membership/invitation history, trusted creation, and role-scoped management routes. The public `/circles` route remains the product overview.
- `supabase/migrations/202608040001_phase_5_circles_foundation.sql` owns Circle lifecycle, visibility, join policies, membership state, local roles, Session association, private audit records, grants, and RLS.
- Platform `host` or `platform_admin` roles can create private drafts. A Circle creator becomes its fixed Phase 5 owner; owner transfer is intentionally deferred.
- Circle-local `host`, `moderator`, and `member` roles never modify or imply a platform role. Owners and platform administrators manage lifecycle and roles; Circle moderators review membership; Circle hosts can associate Sessions they are independently authorized to manage.
- Public Circles can be open, request-based, or invite-only. Private Circles are invite-only and readable only by invited/active members or authorized moderators.
- Circle membership and role changes run through RPCs and write to a private audit log. Authenticated clients have no direct Circle-table mutation grants.
- Only draft Sessions can be associated or detached. Private-Circle Sessions inherit member-aware visibility after publication; registration and Session-management rules remain owned by Phase 4.

Published, RLS-eligible Circles now adapt to the deterministic recommendation service using mode, energy, stimulation, social pace, format, and interests. The scorer receives no private membership queue, rules content, or numeric member-health signal and exposes no raw score.

## Phase 5 routes

| Area               | Route                             | Boundary                                                                   |
| ------------------ | --------------------------------- | -------------------------------------------------------------------------- |
| Circle discovery   | `/home/circles`                   | Eligible published Circles; Pulse-aware ordering when available            |
| Circle details     | `/home/circles/[circleId]`        | RLS-authorized identity, rules, membership action, and associated Sessions |
| Membership history | `/home/circles/memberships`       | Caller-owned active, requested, and invited memberships                    |
| Circle creation    | `/home/circles/manage`            | Trusted platform role gate plus scoped managed-Circle list                 |
| Circle management  | `/home/circles/manage/[circleId]` | Role-scoped lifecycle, invitations, membership, roles, and associations    |

Phase 5 does not add organizations, feeds, chat, direct messages, reports, notifications, bans, global moderation queues, Commons opportunities, Realm campaigns, Passport entries, payments, or an administrator interface. Those remain assigned to later phases.

## Phase 6 Creator Commons architecture

Phase 6 activates structured creator opportunities without turning FIFTHS into a payment processor, contract system, or messaging platform:

- `src/features/creator-commons` owns opportunity validation, server actions, discovery cards, response forms, and the adapter into the shared recommendation scorer.
- `src/app/home/commons` owns protected discovery, detail, saved opportunities, private response history, trusted creation, and role-scoped management routes. The public `/commons` route remains the product overview.
- `supabase/migrations/202608050001_phase_6_creator_commons_foundation.sql` owns opportunity lifecycle, required skills, optional interests, saves, private responses, selection capacity, completion confirmation, audit records, grants, and RLS.
- A centrally assigned `creator` or `platform_admin` can create an independent draft. Active Circle owners and local hosts can create and manage only opportunities associated with their Circle.
- Associated private-Circle opportunities remain readable only to active members, authorized managers, savers, and response owners. A Circle with a published opportunity cannot be archived.
- Response acceptance locks the opportunity row before checking authoritative openings. A participant can withdraw a submitted or accepted response; a filled opportunity reopens only when its deadline is still active.
- Completion requires the opportunity to be closed plus separate confirmation by the accepted participant and an authorized manager. Completion is audited; the later Phase 9 trigger observes only the final completed state.

Published, RLS-eligible opportunities adapt to the deterministic recommendation service using mode, energy, stimulation, social pace, format, estimated commitment, deadline ordering, and interests. Required skill labels inform the member but do not silently exclude them or expose profile skills to creators.

## Phase 6 routes

| Area                   | Route                                  | Boundary                                                                |
| ---------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| Commons discovery      | `/home/commons`                        | Published, deadline-active opportunities; Pulse-aware ordering          |
| Opportunity details    | `/home/commons/[opportunityId]`        | RLS-authorized scope, save state, and caller-owned response controls    |
| Saved opportunities    | `/home/commons/saved`                  | Caller-owned private collection; saving does not reserve a position     |
| Response history       | `/home/commons/responses`              | Caller-owned private status, withdrawal, and completion confirmation    |
| Opportunity creation   | `/home/commons/manage`                 | Creator/platform-admin gate plus scoped Circle-host authority           |
| Opportunity management | `/home/commons/manage/[opportunityId]` | Lifecycle, private response review, selection, and creator confirmation |

Phase 6 does not add organizations, payment or escrow, contracts, uploads, direct messaging, public applicant profiles, reports, notifications, Realm campaigns, or Passport entries. Those remain assigned to later phases.

## Phase 7 Fifth Realm architecture

Phase 7 activates original campaign coordination without becoming a rules repository or virtual tabletop:

- `src/features/fifth-realm` owns campaign validation, cards, application forms, server actions, and the Realm recommendation adapter.
- `src/app/home/realm` owns protected discovery, detail, caller-owned application and membership history, game-master creation, and campaign management. The public `/realm` and `/realm/safety` routes remain informational drafts.
- `supabase/migrations/202608060001_phase_7_fifth_realm_foundation.sql` owns campaign lifecycle, interest joins, private applications, membership, Session association, private audit records, grants, and RLS.
- A centrally assigned `game_master` or `platform_admin` creates each private draft and becomes its fixed game master. Optional Circle association additionally requires local Circle owner or host authority.
- Application acceptance locks the campaign row before capacity evaluation and creates active player membership atomically. Application answers never enter discovery or recommendation ranking.
- Only compatible private draft Sessions can become Realm Sessions. After publication, campaign membership becomes the Realm visibility boundary while existing Session registration and manager lifecycle access remain intact.

Published, RLS-eligible recruiting campaigns adapt to the deterministic recommendation service using mode, energy, stimulation, social pace, format, typical session duration, application deadline, and interests.

## Phase 7 routes

| Area                  | Route                             | Boundary                                                              |
| --------------------- | --------------------------------- | --------------------------------------------------------------------- |
| Realm discovery       | `/home/realm`                     | Eligible recruiting/active campaigns; Pulse-aware ordering            |
| Campaign details      | `/home/realm/[campaignId]`        | RLS-authorized profile, safety context, application, and Sessions     |
| Participation history | `/home/realm/applications`        | Caller-owned applications and active campaign memberships             |
| Campaign creation     | `/home/realm/manage`              | Game-master/platform-admin gate plus optional scoped Circle authority |
| Campaign management   | `/home/realm/manage/[campaignId]` | Lifecycle, private applications, roster, and Session associations     |

Phase 7 does not add proprietary rules, copyrighted setting content, character builders, maps, dice, virtual tabletops, private meeting links, chat, payments, reports, notifications, organizations, or Passport entries. Those are later work or explicit exclusions.

## Phase 8 unified recommendation architecture

Phase 8 completes the shared application-code review without changing the database:

- Each product adapter converts only records already returned by its RLS-protected discovery query into the shared `RecommendationCandidate` contract. The scorer never fetches data or expands eligibility.
- The base scorer compares the private current Pulse with only the signals a candidate actually supplies. Fit is the matched weight divided by applicable weight, preventing products without duration or travel data from receiving an automatic disadvantage.
- Internal weights order candidates deterministically but never leave the service. Callers receive the candidate, ordered plain-language reasons, and a nonnumeric `strong`, `good`, or `possible` fit label.
- Stable comparison uses normalized fit, reason count, time, module, and record ID. Cross-module identity is `module:id`, so equal UUIDs from different product tables remain distinct while duplicate reads are removed.
- Personal Home removes candidates with no truthful reason, softly admits up to two initial results per available module, fills remaining places from overall order, and caps the feed at eight results.
- Module discovery pages keep their own complete eligible inventory and Pulse-aware ordering. Soft balance and relevance filtering apply only to the unified Personal Home feed.
- The interface explains data eligibility, applicable-signal normalization, product balance, score privacy, absence of AI/diagnosis inference, and the member's final choice.

Phase 8 adds no tables, RPCs, policies, grants, roles, mutations, analytics, or background jobs. Phase 9 owns verified Passport issuance and duplicate prevention; recommendation ranking must not award credit or consume unverified browser claims.

## Phase 9 Passport architecture

Phase 9 adds one private outcome layer without moving ownership out of the product workflows that verify participation:

- `public.passport_entries` stores member ownership, activity category, product provenance, source-record identity, a bounded title snapshot, source date, verification state, and correction metadata.
- The unique `(user_id, activity_kind, source_record_id)` identity makes source replay idempotent while allowing one person to receive distinct leadership and participation categories when both are legitimately verified.
- Private trigger functions observe only authoritative state: attended Session records, completed Sessions with at least one verified non-host attendee, completed Commons responses/opportunities, and completed Realm campaigns with active membership.
- Session provenance follows `source_module`, so a Circle-, Commons-, or Realm-owned Session remains visibly connected to that product. Circle membership by itself is never treated as contribution.
- Commons participant credit requires the existing two-sided completion state. Realm credit is limited to active players and the game master at campaign completion; applications or membership alone do not qualify.
- Corrected attendance changes the existing entry to `revoked` rather than deleting it. A later source correction can restore that same entry, but an administrative revocation cannot be silently reversed by trigger replay.
- Only a platform administrator can call the narrow correction RPC, with a bounded reason. There is no issuance RPC available to authenticated members and no direct table mutation grant.
- Personal Passport reads at most 100 recent entries under caller-owned RLS. The UI shows text status, source, category, and correction reason without points, public sharing, or ranking.

## Phase 9 route

| Area             | Route            | Boundary                                                         |
| ---------------- | ---------------- | ---------------------------------------------------------------- |
| Private Passport | `/home/passport` | Caller-owned verified and corrected entries; no client mutations |

Phase 9 does not add public Passport profiles, highlight controls, points, badges, exports, organization issuers, manual claims, self-verification, leaderboards, reports, notifications, moderation queues, or an administrator UI. Phase 10 owns the next trust-and-safety layer.

## Phase 10 trust-and-safety architecture

Phase 10 adds a shared trust layer without moving product ownership or exposing allegations to reported members:

- `member_feedback` is private to its author and platform administrators. `reports` is private to its reporter plus centrally assigned moderators/platform administrators. Neither table grants authenticated insert, update, or delete access.
- Submission RPCs derive the member from `auth.uid()`, enforce bounded content, five-per-day limits, internal-only context paths, and duplicate active-report prevention.
- Moderators may move reports into review or escalation. Only platform administrators may resolve/dismiss reports or review/close feedback. Final reports cannot be silently reopened.
- Internal review notes exist only in `private.report_audit_logs`; reporter-readable rows expose status, not staff notes. Targets receive no report visibility.
- `notifications` is a caller-owned in-app inbox. Private database triggers issue deduplicated updates for report status, Circle invitations, Commons response decisions, Realm application decisions, and Passport changes.
- No notification trigger expands source visibility. Notification copy contains bounded titles and links only to protected FIFTHS paths; it does not copy application answers, reports, private feedback, or contact details.

| Area          | Route                    | Boundary                                                             |
| ------------- | ------------------------ | -------------------------------------------------------------------- |
| Member safety | `/home/safety`           | Caller-owned feedback/report receipts and private submission RPCs    |
| In-app inbox  | `/home/notifications`    | Caller-owned newest 50 notifications and mark-read RPCs              |
| Human review  | `/home/admin/moderation` | Moderator triage; platform-admin final decisions and feedback review |

Phase 10 does not add automated moderation, account suspension, content deletion, evidence uploads, appeals, email/push/SMS, emergency response, public allegations, AI classification, or Phase 11 deployment changes.

## Phase 11 release architecture

Phase 11 changes release assurance without changing the database or product model:

- `tests/e2e` owns Chromium journeys for public content, responsive navigation, authentication structure, policy notices, overflow, response headers, and representative axe-core scans.
- `playwright.config.ts` runs the same journeys against desktop and mobile Chromium profiles with failure-only screenshots and retained traces.
- `next.config.ts` applies one response-header policy to every route. The policy permits the existing Next.js runtime and Supabase HTTPS/WebSocket connections while denying frames, objects, camera, microphone, and geolocation. HSTS and insecure-request upgrades are production-only.
- `.github/workflows/quality.yml` installs from the lockfile and separates the application gate from the browser/accessibility gate. Workflow permissions are read-only and redundant runs on the same ref are cancelled.
- `docs/RELEASE_READINESS.md` is the source of truth for environment promotion, founder-owned validation, smoke tests, deployment, rollback, and the current public-beta no-go decision.

The browser suite deliberately does not fake successful authentication or database state. Offline coverage proves public behavior and release configuration; the founder-owned preview project must prove Auth, RLS, capacity, audit, privacy, and cross-user behavior with synthetic accounts. Phase 11 adds no route, migration, database permission, product mutation, analytics provider, or service-role client.
