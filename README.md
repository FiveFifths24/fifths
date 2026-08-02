# FIFTHS

**Find your space. Match your energy.**

FIFTHS is a mobile-first community platform connecting five products—Pulse, Circles, Creator Commons, Fifth Realm, and Passport—through one account, profile, recommendation system, and Supabase backend.

This repository has completed **Phase 7: Fifth Realm foundation**. It includes the public experience, secure identity and onboarding, private Pulse check-ins, personal Home, shared Sessions, Circles, Creator Commons, and real Fifth Realm campaign discovery, private applications, capacity-safe membership, game-master tools, and Realm Session associations. The founder-owned Supabase project must be connected and all six ordered migrations applied before live testing. The unified recommendation review begins in Phase 8.

## Prerequisites

- Node.js 22 LTS or newer
- npm 10 or newer
- Git
- A Five Fifths-owned Supabase project (required for live account and product flows)
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
- Versioned PostgreSQL identity, Pulse, Session, Circle, Creator Commons, and Fifth Realm migrations with default-deny Row Level Security
- Zod-validated email/password, onboarding, Pulse, Session, Circle, Commons, and Realm actions
- Deterministic, explainable Session, Circle, Commons, and Realm scoring without AI or raw user-facing scores
- Zod at every external-data boundary
- Vitest and React Testing Library for unit/component tests
- ESLint and Prettier for consistency

Public and protected routes live under `src/app`; shared design-system and member-shell components live under `src/components`; authentication, onboarding, Pulse, Sessions, Circles, Creator Commons, and Fifth Realm live under `src/features`; shared recommendation rules live under `src/lib/recommendations`. Future product code follows the module boundaries documented in `docs/ARCHITECTURE.md`.
