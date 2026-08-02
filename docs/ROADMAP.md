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
- [ ] **Phase 7:** Fifth Realm campaigns, discovery, applications, members, GM tools
- [ ] **Phase 8:** Unified recommendation ranking and explanation tests
- [ ] **Phase 9:** Verified Passport entries and duplicate prevention
- [ ] **Phase 10:** Feedback, reports, notifications, moderation, admin controls
- [ ] **Phase 11:** End-to-end, accessibility, mobile, security, and deployment review

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
