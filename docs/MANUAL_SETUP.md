# Manual Founder Setup

No credentials are needed to review Phase 0 locally. Complete these account-owned steps before Phase 2/deployment.

## 1. Supabase

1. Create a Supabase organization owned by Five Fifths and a production project in the closest practical US region.
2. Generate and store a strong database password in a password manager.
3. In **Project Settings → API**, copy the project URL and publishable key.
4. Copy `.env.example` to `.env.local` and replace only the placeholder values locally.
5. Invite technical collaborators individually; do not share the founder login.
6. Enable multi-factor authentication on the Supabase account.

Do not paste or commit the database password, JWT secret, or service-role key. Phase 2 will provide migrations and exact Auth redirect settings.

## 2. Vercel

1. Sign in to Vercel with the Five Fifths GitHub account or organization.
2. Import `FiveFifths24/fifths` as a new project using the Next.js preset.
3. Keep the default build command (`next build`) and output settings.
4. Add the three public values from `.env.example` under Project Settings → Environment Variables, with the production site URL changed to the final Vercel/custom domain.
5. Require preview deployments for pull requests and keep production deployment on `main` only.
6. Enable multi-factor authentication and limit project access.

## 3. GitHub branch protection

After the first pull request exists, protect `main`: require a pull request, require passing lint/type/test/build checks, block force pushes, and require the branch to be current before merging.

## 4. Local validation

```bash
npm install
cp .env.example .env.local
npm run check
```

The placeholder Supabase values are acceptable during Phase 0 because no live database client is initialized yet.
