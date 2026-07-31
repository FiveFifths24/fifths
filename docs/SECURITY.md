# Security

Security uses overlapping controls: server authorization prevents inappropriate actions before a query, while Supabase Row Level Security protects records even if application code makes a mistake.

## Required controls

- Enable RLS on every application table before exposing it.
- Default-deny, then add narrow policies for each action and role.
- Store passwords only in Supabase Auth.
- Keep Pulse history, applications, reports, private feedback, meeting links, and private Circle content restricted.
- Prevent users from assigning elevated roles or self-verifying Passport credit.
- Validate all inputs with Zod on the server and apply database constraints independently.
- Escape rendered user content; do not introduce raw HTML without sanitization.
- Record privileged role, moderation, attendance, and Passport changes in audit logs.
- Keep `.env.local` and all service-role credentials out of Git.
- Return safe user-facing errors and log detailed server errors without private data.

## Client boundaries

`NEXT_PUBLIC_SUPABASE_URL` and the Supabase publishable/anonymous key are designed for browser use when RLS is correct. The service-role key bypasses RLS and is server-only. It must be configured only in protected server environments and used through narrowly scoped helpers.

## Rate-limiting plan

Before public beta, rate-limit authentication, password reset, content creation, applications, responses, registrations, and reports. Prefer platform/database-backed limits that work across serverless instances. Add bot protection to abuse-prone public forms. This is documented but intentionally not implemented before endpoints exist.

## Launch security work

- Threat-model each role and cross-organization boundary.
- Test RLS using multiple users and negative cases.
- Review storage bucket policies and upload type/size limits.
- Establish report escalation, account suspension, and evidence-retention procedures.
- Configure security headers, monitoring, backup/recovery, dependency scanning, and secret rotation.
- Complete privacy and legal review; the application is 18+ and will not collect diagnoses or precise home addresses.
