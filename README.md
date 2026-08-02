# FIFTHS

**Find your space. Match your energy.**

FIFTHS is a mobile-first community platform connecting five products—Pulse, Circles, Creator Commons, Fifth Realm, and Passport—through one account, profile, recommendation system, and Supabase backend.

This repository has completed **Phase 2: authentication and identity foundation**. It includes the Phase 1 public experience plus Supabase migrations, email/password authentication, secure SSR sessions, protected onboarding, a minimal account-readiness page, roles, and default-deny Row Level Security. The founder-owned Supabase project must be connected before live account testing. Product activity begins in Phase 3 and later.

## Prerequisites

- Node.js 22 LTS or newer
- npm 10 or newer
- Git
- A Five Fifths-owned Supabase project (required for Phase 2 account flows)
- A Vercel account linked to this GitHub repository (required for deployment)

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

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Roadmap and tracked checklist](docs/ROADMAP.md)
- [Database design](docs/DATABASE.md)
- [Security approach](docs/SECURITY.md)
- [Product modules](docs/PRODUCT_MODULES.md)
- [Manual founder setup](docs/MANUAL_SETUP.md)
- [Known limitations](docs/KNOWN_LIMITATIONS.md)
- [Glossary](docs/GLOSSARY.md)

## Current architecture

- Next.js App Router, React, and strict TypeScript
- Tailwind CSS for mobile-first styling
- Reusable public shell, form, feedback, module, and document components
- Cookie-based Supabase SSR clients and Next.js Proxy session refresh
- Versioned PostgreSQL identity migration with default-deny Row Level Security
- Zod-validated email/password and onboarding server actions
- Zod at every external-data boundary
- Vitest and React Testing Library for unit/component tests
- ESLint and Prettier for consistency

Public and account routes live under `src/app`; shared design-system and shell components live under `src/components`; authentication and onboarding behavior lives under `src/features`. Future product code follows the module boundaries documented in `docs/ARCHITECTURE.md`.
