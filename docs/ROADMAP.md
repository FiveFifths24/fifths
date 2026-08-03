# MVP Roadmap and Progress Checklist

Checked items are complete in the repository. A phase begins only after the prior phase is reviewed.

## Phase 0 — Architecture and repository setup

- [x] Inspect repository and environment
- [x] Establish Next.js, React, and strict TypeScript foundation
- [x] Configure Tailwind CSS
- [x] Configure ESLint and Prettier
- [x] Configure Vitest and React Testing Library
- [x] Define shared architecture and module boundaries
- [x] Document database and RLS direction
- [x] Add environment template and exact manual setup
- [x] Document security and known limitations
- [x] Add an initial architecture sanity test
- [ ] Connect founder-owned Supabase project
- [ ] Connect founder-owned Vercel project

## Delivery phases

- [x] **Phase 1:** Public shell, design system, landing/module pages, auth page UI, legal drafts
- [x] **Phase 2:** Supabase migrations, authentication, roles, RLS, onboarding
- [x] **Phase 3:** Pulse check-in, history, recommendation foundation, personal Home
- [x] **Phase 4:** Session discovery, hosting, registration, capacity, attendance foundation
- [x] **Phase 5:** Circle discovery, membership, roles, associations, moderation basics
- [x] **Phase 6:** Creator Commons creation, discovery, responses, acceptance, completion
- [x] **Phase 7:** Fifth Realm campaigns, discovery, applications, members, GM tools
- [x] **Phase 8:** Unified recommendation ranking and explanation tests
- [x] **Phase 9:** Verified Passport entries and duplicate prevention
- [x] **Phase 10:** Feedback, reports, notifications, moderation, admin controls
- [x] **Phase 11:** End-to-end, accessibility, mobile, security, and deployment review

## Release gate

Every meaningful phase must pass lint, type checking, tests, and a production build. Legal text, threat modeling, abuse procedures, backup/recovery, and launch-grade rate limiting require review before public launch.

## Phase 1 — Public shell and unified design system

- [x] Responsive desktop header and accessible mobile navigation
- [x] Skip link, main-content landmark, page container, and footer
- [x] Landing, About, and ecosystem overview pages
- [x] Public pages for Pulse, Circles, Creator Commons, Fifth Realm, and Passport
- [x] Interface-only login, signup, and password-reset pages
- [x] Draft privacy, terms, community, Commons, and Realm safety pages
- [x] Reusable buttons, links, fields, labels, cards, badges, headings, preview states, and status messages
- [x] Document design tokens, routes, boundaries, and accessibility decisions
- [x] Test landing content, navigation/mobile behavior, auth structure, and legal notices
- [x] Pass formatting, lint, strict TypeScript, tests, and production build

## Phase 2 — Authentication and identity foundation

- [x] Add cookie-based browser/server Supabase clients and Next.js Proxy session refresh
- [x] Add email/password signup, confirmation callback, login, logout, recovery, and password update
- [x] Validate all account and onboarding mutations with Zod on the server
- [x] Add profiles, platform roles, interests, skills, join tables, constraints, and audit records
- [x] Create a safe new-user trigger and atomic onboarding database function
- [x] Enable RLS on every exposed Phase 2 table and grant only narrow operations
- [x] Prevent authenticated members from self-assigning or changing roles
- [x] Add protected `/onboarding` and minimal `/account` routes without starting the product dashboard
- [x] Add focused validation, redirect-safety, auth-interface, and database-security contract tests
- [x] Document founder-owned Supabase setup, Auth redirects, migration application, and rollback cautions
- [x] Pass formatting, lint, strict TypeScript, tests, and production build

The code foundation for Phase 2 is complete. Live account testing still requires the founder to connect the Five Fifths Supabase project, apply the migration, configure Auth URLs, and set browser-safe environment values.

## Phase 3 — Pulse and personal Home foundation

- [x] Add protected `/home`, `/home/pulse`, and `/home/pulse/history` routes
- [x] Add reusable member navigation and preserve the public product routes
- [x] Add modes and constrained private Pulse check-ins with a 24-hour matching window
- [x] Store optional current interests without collecting diagnoses, notes, or precise location
- [x] Route Pulse writes through one validated RPC scoped only to `auth.uid()`
- [x] Enable default-deny RLS for modes, Pulse history, and Pulse-interest joins
- [x] Add deterministic candidate ranking with stable tie-breaks and plain-language reasons
- [x] Show real private state and an honest no-inventory recommendation state in personal Home
- [x] Add focused validation, accessibility, ranking, and database-security contract tests
- [x] Document Phase 3 architecture, privacy boundaries, founder setup, and intentional exclusions
- [x] Pass formatting, lint, strict TypeScript, tests, and production build

The Phase 3 code foundation remains complete. Its live validation still requires the founder-owned Supabase project, ordered migrations, Auth configuration, and two-user RLS testing. Phase 4 builds on that boundary without changing Pulse privacy. Circle membership, Commons workflows, Realm campaigns, and Passport issuance remain in their later tracked phases.

## Phase 4 — Shared Sessions foundation

- [x] Add protected Session discovery, detail, registration, and registration-history routes
- [x] Add trusted-role hosting with draft, publish, cancel, and complete lifecycle controls
- [x] Add shared Session records with Pulse-fit metadata and interest joins
- [x] Adapt published Sessions to the existing deterministic scorer with reason labels
- [x] Enforce registration uniqueness and capacity atomically under a database row lock
- [x] Add host-only roster access and audited attendance marking for active registrants
- [x] Enable default-deny RLS and keep all Session writes behind validated RPCs
- [x] Preserve honest empty states with no demonstration or seeded member activity
- [x] Add focused schema, component, recommendation-adapter, navigation, and database-security tests
- [x] Document Phase 4 architecture, founder setup, role boundaries, and intentional exclusions
- [x] Pass formatting, lint, strict TypeScript, tests, and production build

The Phase 4 code foundation remains complete. Its live validation still requires the founder-owned non-production Supabase project, the first three ordered migrations, a deliberately assigned host role, and multi-user capacity/RLS testing. Phase 5 builds on that boundary without changing registration or attendance ownership. Commons workflows, Realm campaigns, Passport issuance, payments, and messaging remain in later phases.

## Phase 5 — Circles foundation

- [x] Add protected Circle discovery, detail, membership, invitation, and management routes
- [x] Add trusted-role Circle creation with draft, publish, and archive lifecycle controls
- [x] Add public and private Circle visibility plus open, request, and invite-only membership boundaries
- [x] Add Circle-local owner, host, moderator, and member roles without changing platform roles
- [x] Add audited request approval, decline, invitation, role change, removal, and self-service departure flows
- [x] Add optional draft Session associations and member-aware visibility for private-Circle Sessions
- [x] Adapt eligible published Circles to the existing deterministic Pulse scorer with reason labels
- [x] Keep Circle and membership writes behind validated RPCs with default-deny RLS
- [x] Add focused schema, component, recommendation-adapter, navigation, and database-security tests
- [x] Document Phase 5 architecture, founder setup, role boundaries, and intentional exclusions
- [x] Pass formatting, lint, strict TypeScript, tests, production build, and dependency audits

The Phase 5 code foundation remains complete. Its live validation still requires the founder-owned non-production Supabase project, the first four ordered migrations, deliberately assigned host/moderator test roles, and multi-user Circle visibility, membership, moderation, audit, and Session-association testing. Phase 6 builds on this boundary without changing Circle membership ownership. Organizations, Realm campaigns, Passport issuance, reports, notifications, messaging, and payments remain later work.

## Phase 6 — Creator Commons foundation

- [x] Add protected opportunity discovery, detail, saved, response-history, creation, and management routes
- [x] Add creator-role and scoped Circle-host private draft creation with constrained publish, close, and cancel transitions
- [x] Add required skills, optional interests, bounded Pulse-fit metadata, deadlines, openings, and broad access labels
- [x] Add private saves and private structured responses without collecting contact, payment, contract, or file data
- [x] Lock the opportunity row before accepting a response and enforce authoritative position capacity
- [x] Add response withdrawal, acceptance, decline, and two-sided completion confirmation
- [x] Audit opportunity lifecycle plus response state and confirmation changes in private tables
- [x] Preserve private-Circle visibility for associated opportunities and block unsafe Circle archival
- [x] Adapt eligible published Commons opportunities to the deterministic Pulse scorer with reason labels
- [x] Keep every Commons write behind validated RPCs with default-deny RLS
- [x] Add focused schema, component, recommendation-adapter, navigation, and database-security tests
- [x] Document Phase 6 architecture, founder setup, trust boundaries, and intentional exclusions
- [x] Pass formatting, lint, strict TypeScript, tests, production build, and dependency audits

The Phase 6 code foundation is complete. Live validation still requires the founder-owned non-production Supabase project, all five ordered migrations, deliberately assigned creator and Circle-host roles, and multi-user discovery, response-privacy, capacity, withdrawal, audit, and completion-confirmation testing. Phase 7 is next: Fifth Realm campaigns, discovery, applications, members, and game-master tools. Organizations, Passport issuance, reports, notifications, messaging, contracts, files, and payments remain later work.

## Phase 7 — Fifth Realm foundation

- [x] Add protected campaign discovery, detail, application-history, creation, and game-master routes
- [x] Add game-master-role private draft creation with optional scoped Circle association
- [x] Store system-neutral premise, genre, tone, cadence, safety expectations, experience welcome, and bounded Pulse-fit metadata
- [x] Keep applications structured and private with explicit safety acknowledgement
- [x] Lock the campaign row before acceptance and create authoritative membership atomically
- [x] Add applicant withdrawal, player departure, GM removal, roster access, and constrained campaign lifecycle controls
- [x] Audit campaign, application, and membership state changes in private tables
- [x] Preserve private-Circle visibility and block archival while Realm work is recruiting or active
- [x] Associate compatible private draft Sessions and restrict published Realm Sessions to active campaign members
- [x] Adapt eligible recruiting campaigns to the deterministic Pulse scorer with reason labels
- [x] Keep every Realm write behind validated RPCs with default-deny RLS
- [x] Add focused schema, component, recommendation-adapter, navigation, and database-security tests
- [x] Document Phase 7 architecture, founder setup, trust boundaries, originality limits, and intentional exclusions
- [x] Pass formatting, lint, strict TypeScript, tests, production build, and dependency audits

The Phase 7 code foundation is complete. Live validation still requires the founder-owned non-production Supabase project, all six ordered migrations, deliberately assigned game-master and Circle-host roles, and multi-user discovery, application-privacy, capacity, membership, audit, Circle-visibility, and Realm-Session tests. Phase 8 builds on these eligible product records without changing Realm ownership. Organizations, Passport issuance, reports, notifications, messaging, copyrighted game content, virtual tabletop tools, files, and payments remain later or excluded work.

## Phase 8 — Unified recommendations

- [x] Normalize ranking by the recommendation signals each product actually supplies
- [x] Combine eligible Sessions, Circles, Commons opportunities, and Realm campaigns into one Personal Home feed
- [x] Keep database visibility and product eligibility outside the scorer and preserve module-specific discovery
- [x] Deduplicate with stable module-and-record keys and deterministic cross-module tie-breaks
- [x] Softly balance the initial feed across available products before filling remaining places by fit
- [x] Exclude zero-explanation filler from Personal Home while keeping honest empty states
- [x] Add nonnumeric strong, good, and possible fit labels plus plain-language reasons
- [x] Document the method, privacy boundary, applicable-signal normalization, and member choice in the interface
- [x] Test normalization, module balance, deduplication, relevance filtering, ordering stability, limits, and score privacy
- [x] Document Phase 8 architecture, security decisions, completion status, and intentional exclusions
- [x] Pass formatting, lint, strict TypeScript, tests, production build, and dependency audits

The Phase 8 code foundation is complete. It adds no database migration and preserves the six existing migrations and RLS boundaries. Live validation still requires the founder-owned non-production Supabase project and representative eligible inventory across all four candidate modules. Phase 9 builds on verified product outcomes without changing recommendation ordering. Organizations, reports, notifications, moderation, messaging, payments, AI/ML, and public leaderboards remain later or excluded work.

## Phase 9 — Verified Passport activity

- [x] Add a protected `/home/passport` history route and member-navigation destination
- [x] Add private Passport entries with activity categories, product provenance, source snapshots, and explicit verified/revoked state
- [x] Issue activity only from host-marked Session attendance, completed Sessions with a verified non-host attendee, mutually confirmed Commons completion, and completed Realm membership
- [x] Map Circle-, Commons-, and Realm-owned Sessions to their product provenance without treating membership alone as contribution
- [x] Prevent duplicates with one unique member, activity-kind, and source-record identity
- [x] Backfill eligible trusted Phase 4, 6, and 7 state through the same idempotent issuer
- [x] Revoke corrected attendance automatically while preserving history and private audit evidence
- [x] Add a platform-admin-only correction RPC whose revocations cannot be silently restored by source replay
- [x] Keep members on select-only, caller-owned RLS access with no self-verification path
- [x] Add accessible cards, text status, honest empty states, summary counts, and privacy explanations
- [x] Add component, summary, navigation, duplicate-prevention, issuance, correction, RLS, and phase-boundary tests
- [x] Document Phase 9 architecture, migration order, security controls, founder validation, and intentional exclusions
- [x] Pass formatting, lint, strict TypeScript, tests, production build, and dependency audits

The Phase 9 code foundation is complete. Live validation still requires the founder-owned non-production Supabase project, all seven ordered migrations, and multi-user tests for issuance, duplicate replay, correction, administrative revocation, audit, and cross-user RLS denial. Phase 10 builds on those private ownership rules without changing Passport issuance. Organizations, messaging, payments, AI/ML, public Passport sharing, points, and leaderboards remain later or excluded work.

## Phase 10 — Trust, safety, and private notifications

- [x] Add protected member feedback and structured safety-report interfaces
- [x] Bound content, accept only internal context paths, cap daily submissions, and reject duplicate active reports
- [x] Keep feedback and report history caller-owned while allowing only authorized review roles into restricted queues
- [x] Separate moderator triage/escalation from platform-admin final decisions and feedback review
- [x] Keep internal review notes in private audit storage rather than reporter-readable rows
- [x] Add private deduplicated notifications for report updates, Circle invitations, Commons responses, Realm applications, and Passport changes
- [x] Add owner-only notification reads and database-controlled mark-read actions
- [x] Add accessible text status, urgent-safety guidance, honest empty states, and large mobile actions
- [x] Add schema, component, navigation, privacy, authorization, audit, notification, and phase-boundary tests
- [x] Document Phase 10 routes, database boundaries, manual validation, completion status, and exclusions
- [x] Pass formatting, lint, strict TypeScript, tests, production build, and dependency audits

The Phase 10 code foundation is complete. Live validation still requires all eight ordered migrations in the founder-owned non-production Supabase project and multi-user tests for report privacy, submission limits, moderator/admin separation, audit records, notification ownership, and workflow delivery. Phase 11 is next: end-to-end, accessibility, mobile, security, and deployment review. Automated moderation, account suspension, evidence uploads, appeals, email/push delivery, emergency response, organizations, messaging, payments, AI/ML, and leaderboards remain later or excluded work.

## Phase 11 — Release readiness review

- [x] Add Chromium end-to-end coverage for the public shell, navigation, auth interfaces, legal notices, and response headers
- [x] Exercise desktop and mobile viewports and reject horizontal overflow on representative public routes
- [x] Add axe-core WCAG regression checks for representative landing, account-entry, and policy pages
- [x] Add production CSP, frame denial, content-type, referrer, permissions, and HSTS response headers
- [x] Preserve visible focus, reduced-motion, large-target, semantic-landmark, and forced-colors behavior
- [x] Add least-privilege GitHub Actions gates for formatting, lint, strict TypeScript, tests, build, audits, and browser review
- [x] Document environment promotion, preview/production smoke tests, founder go/no-go gates, deployment, and rollback
- [x] Separate locally verifiable release controls from founder-owned Supabase, legal, accessibility, backup, monitoring, and operational review
- [x] Update architecture, security, setup, limitations, and completion documentation without changing product or database boundaries
- [x] Pass the complete release gate and review the final dependency tree and repository contents

Phase 11 completes the tracked MVP code phases. It adds no migration or new product behavior. Public beta remains a no-go until the founder completes `docs/RELEASE_READINESS.md`, applies all eight migrations to a non-production Supabase project, passes the documented multi-user tests, and approves legal, security, accessibility, backup, monitoring, and operational readiness. Any additional product scope requires a separately reviewed roadmap; it is not implied by Phase 11 completion.
