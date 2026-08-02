# Architecture

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

Pulse reads the latest valid private check-in and ranks eligible records from Sessions, Circles, Commons, and Realm using one deterministic scoring service. Passport receives verified, idempotent entries from completed activity; it never trusts a browser request to award credit.

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
| ESLint + Prettier           | Automated correctness and formatting standards                    |

shadcn/ui is intentionally not installed as a package. Components will be added selectively in Phase 1 so FIFTHS owns the source and avoids unused UI code. Playwright is deferred until essential journeys exist.

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
