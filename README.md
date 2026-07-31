# FIFTHS

**Find your space. Match your energy.**

FIFTHS is a mobile-first community platform connecting five products—Pulse, Circles, Creator Commons, Fifth Realm, and Passport—through one account, profile, recommendation system, and Supabase backend.

This repository is currently at **Phase 0: architecture and repository setup**. Product screens and live Supabase features begin in later phases.

## Prerequisites

- Node.js 22 LTS or newer
- npm 10 or newer
- Git
- A Supabase project (required in Phase 2; placeholders work for Phase 0)
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

Do not commit `.env.local`. Only the public Supabase URL and publishable/anonymous key may use the `NEXT_PUBLIC_` prefix. Never place the Supabase service-role key in browser code.

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
- Supabase for PostgreSQL, authentication, Row Level Security, and limited storage
- Zod at every external-data boundary
- Vitest and React Testing Library for unit/component tests
- ESLint and Prettier for consistency

Feature code lives under `src/features`; shared platform code lives under `src/lib`, `src/components`, and `src/types`. See `docs/ARCHITECTURE.md` before adding a new module.
