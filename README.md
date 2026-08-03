# FIFTHS

**Find your space. Match your energy.**

FIFTHS is a mobile-first community platform connecting five products—Pulse, Circles, Creator Commons, Fifth Realm, and Passport—through one account, profile, recommendation system, and Supabase backend.

This repository has completed **Phase 11: release readiness**. It includes the public experience, identity, Pulse, Sessions, Circles, Creator Commons, Fifth Realm, unified recommendations, private Passport activity, structured feedback and reports, private in-app notifications, role-gated human review, browser/accessibility regression tests, production response headers, and automated release gates. The founder-owned Supabase project must still be connected, all eight ordered migrations applied, and the documented live gates passed before public beta.

## Prerequisites

- Node.js 22 LTS or newer
- npm 10 or newer
- Git
- A Five Fifths-owned Supabase project (required for live account and product flows)
- A Vercel account linked to this GitHub repository (required for deployment)
- Chromium installed through Playwright (required for the complete release gate)

## Local setup

```bash
git clone https://github.com/FiveFifths24/fifths.git
cd fifths
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Do not commit `.env.local`. Only the public Supabase URL and publishable/anonymous key may use the `NEXT_PUBLIC_` prefix. Never place the Supabase service-role key in browser code. Public pages remain reviewable with placeholder values; account actions show a setup notice until the real values and migration are present.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run all four together with `npm run check`.

Run the complete Phase 11 gate, including formatting, browser/accessibility checks, and dependency audits, with:

```bash
npx playwright install chromium
npm run check:release
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Roadmap and tracked checklist](docs/ROADMAP.md)
- [Database design](docs/DATABASE.md)
- [Security approach](docs/SECURITY.md)
- [Product modules](docs/PRODUCT_MODULES.md)
- [Manual founder setup](docs/MANUAL_SETUP.md)
- [Known limitations](docs/KNOWN_LIMITATIONS.md)
- [Release readiness and rollback](docs/RELEASE_READINESS.md)
- [Glossary](docs/GLOSSARY.md)

## Current architecture

- Next.js App Router, React, and strict TypeScript
- Tailwind CSS for mobile-first styling
- Reusable public shell, form, feedback, module, and document components
- Cookie-based Supabase SSR clients and Next.js Proxy session refresh
- Versioned PostgreSQL identity, Pulse, Session, Circle, Creator Commons, Fifth Realm, and Passport migrations with default-deny Row Level Security
- Zod-validated email/password, onboarding, Pulse, Session, Circle, Commons, and Realm actions
- Unified, deterministic Session, Circle, Commons, and Realm ranking with applicable-signal normalization, stable tie-breaks, soft module balance, and no AI or raw user-facing scores
- Private, duplicate-safe Passport activity with audited correction and no member write access
- Private feedback and structured safety reports with bounded submissions, restricted human review, audited decisions, and caller-owned notifications
- Zod at every external-data boundary
- Vitest and React Testing Library for unit/component tests
- Playwright and axe-core for desktop/mobile browser and automated accessibility regression tests
- ESLint and Prettier for consistency

Public and protected routes live under `src/app`; shared design-system and member-shell components live under `src/components`; authentication, onboarding, Pulse, Sessions, Circles, Creator Commons, and Fifth Realm live under `src/features`; shared recommendation rules live under `src/lib/recommendations`. Future product code follows the module boundaries documented in `docs/ARCHITECTURE.md`.
