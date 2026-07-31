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
- [ ] **Phase 2:** Supabase migrations, authentication, roles, RLS, onboarding
- [ ] **Phase 3:** Pulse check-in, history, recommendation foundation, personal Home
- [ ] **Phase 4:** Session discovery, hosting, registration, capacity, attendance foundation
- [ ] **Phase 5:** Circle discovery, membership, roles, associations, moderation basics
- [ ] **Phase 6:** Creator Commons creation, discovery, responses, acceptance, completion
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

Phase 2 is next. Supabase, authentication, database schema, roles, Row Level Security, and onboarding remain intentionally untouched.
