# Manual Founder Setup

No credentials are needed to review public pages. The following founder-owned steps are required before live Phase 3 account and Pulse testing. Never paste credentials into an issue, pull request, chat, or committed file.

## 1. Supabase

1. Create a Supabase organization owned by Five Fifths and first create a non-production branch/project in the closest practical US region for migration and RLS testing.
2. Generate and store a strong database password in a password manager.
3. In **Project Settings → API**, copy the project URL and publishable key.
4. Copy `.env.example` to `.env.local` and replace only the three browser-safe placeholder values locally.
5. Invite technical collaborators individually; do not share the founder login.
6. Enable multi-factor authentication on the Supabase account.
7. Review and apply these migrations to the non-production project in order using the Supabase SQL Editor or an authenticated Supabase CLI workflow:
   - `supabase/migrations/202608010001_phase_2_identity_foundation.sql`
   - `supabase/migrations/202608020001_phase_3_pulse_foundation.sql`
8. In **Authentication → URL Configuration**, set the Site URL to the deployed application origin and add these redirect URLs for local and preview/production environments:
   - `http://localhost:3000/auth/callback`
   - `https://<your-preview-domain>/auth/callback`
   - `https://<your-production-domain>/auth/callback`
9. Keep email confirmations enabled. Configure custom SMTP before beta; the default Supabase sender is for limited testing only.
10. Create at least two ordinary test accounts. Confirm that each account can read only its own profile, roles, Pulse history, and Pulse-interest joins; cannot read the other account's Pulse; and cannot directly insert/update/delete `user_roles` or Pulse tables.
11. For each account, complete onboarding, record multiple Pulse check-ins, confirm that the newest check-in appears on `/home`, confirm history order, and verify that expiration is set no more than 24 hours after creation.
12. Regenerate `src/types/database.ts` from the applied schema and review the diff before committing any generated update.

Do not paste or commit the database password, JWT signing key, or service-role key. Phase 3 does not require a service-role key.

## 2. Vercel

1. Sign in to Vercel with the Five Fifths GitHub account or organization.
2. Import `FiveFifths24/fifths` as a new project using the Next.js preset.
3. Keep the default build command (`next build`) and output settings.
4. Add the three public values from `.env.example` under Project Settings → Environment Variables. Use the matching preview or production application origin for `NEXT_PUBLIC_SITE_URL`.
5. Require preview deployments for pull requests and keep production deployment on `main` only.
6. Enable multi-factor authentication and limit project access.

## 3. GitHub branch protection

After the first pull request exists, protect `main`: require a pull request, require passing lint/type/test/build checks, block force pushes, and require the branch to be current before merging.

## 4. Required account-flow validation

```bash
npm install
cp .env.example .env.local
npm run check
```

With the non-production Supabase values configured, manually verify signup email confirmation, login, logout, password recovery, expired/invalid callback handling, onboarding, duplicate username handling, direct protected-route access, Pulse validation and history, 24-hour expiration, and cross-user RLS denial. Do not apply either migration to production until these checks and a legal/privacy review are complete.
