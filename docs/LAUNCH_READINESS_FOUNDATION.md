# SIGNAL Launch-Readiness Foundation

This document describes the application-side foundation added in September 2026. It is not a legal opinion, accessibility certification, penetration test,
or production go-live approval.

## Safety and privacy architecture

- Deleted Circle message text is moved out of the realtime-visible public row
  and retained only in `private.circle_message_deleted_bodies`. Ordinary Circle
  members receive no access. The safe read RPC returns retained text only to the
  message author, Circle owner, or platform administrator.
- Account deactivation/deletion begins as an authenticated, audited request.
  The account remains active until an authorized operational review completes.
  Safety, fraud, moderation, and legally required records are not automatically
  destroyed by the request RPC.
- The Terms, Privacy Policy, Community Guidelines, Commons Guidelines, and Realm
  Safety pages describe current product behavior and remain clearly labeled for
  professional legal review before launch.

## Tutorial, Starter Path, and Passport

- `/home/getting-started` is skippable, resumable, and route-based. It does not
  use fragile selectors or block normal navigation.
- Tutorial progress and Starter Path completion are private, caller-owned,
  select-only tables. Mutations use authenticated RPCs.
- Pulse, Circle, and Session milestones are derived from authoritative product
  state. Exploration tasks are intentionally lightweight and labeled as such.
- Starter Path rows never write to `passport_entries`. Verified Passport totals
  continue to come only from the existing authorized source workflows.

## Communications and email provider setup

The application stores private communication preferences but does not send
email until a provider adapter and worker are configured.

- Essential account, security, safety, moderation, and material policy messages
  are not represented as disableable preferences.
- Activity email and every marketing category default off.
- Newsletter, Five Fifths, eHub, fundraising, community/event, and feature email
  require an explicit choice. Consent and revocation changes record timestamp
  and source in a private audit table.
- `src/lib/communications/email.ts` defines the server-only `EmailProvider`
  contract. With no adapter, delivery throws
  `EmailProviderNotConfiguredError`; it never pretends an email was sent.
- `private.email_delivery_outbox` is default-deny groundwork for a future
  least-privilege worker. No browser or ordinary authenticated role can read or
  write it.

Before enabling email:

1. Select a provider and sign a data-processing agreement where appropriate.
2. Implement one server-only `EmailProvider` adapter. Keep its API key in the
   deployment secret store without a `NEXT_PUBLIC_` prefix.
3. Create reviewed templates for essential, activity, and marketing classes.
4. Build a least-privilege outbox worker with retries, deduplication, delivery
   audit, bounce/complaint handling, and provider webhook verification.
5. Add signed, expiring one-click unsubscribe links for marketing email. The
   authenticated account-level unsubscribe already exists, but it does not
   replace inbox-provider one-click unsubscribe requirements.
6. Run deliverability, consent, suppression, and cross-account tests in preview.

No new provider environment variable is required by this branch because no
provider is selected. Add provider-specific server variables only with the
adapter that consumes them.

## Analytics and cookie decision

SIGNAL now records a finite set of first-party product events for authenticated
members. Raw events are RLS-protected with no browser table grants. Routes are
stored without query strings, properties use a small allowlist, writes are rate
limited, and a private cleanup function defaults to 13 months.

The implementation does **not** store email, username, profile/chat/report text,
precise location, advertising identifiers, or cross-site identifiers. Analytics
failure never changes the member action.

Page views, route popularity, feature use, return usage, and unique signed-in
members can be measured. Anonymous visitors are not assigned an identifier, so
anonymous unique visitors and return visits are deliberately unavailable.

Cookie conclusion: no generic consent banner was added. Current client storage
is used for necessary Supabase authentication and member-controlled form drafts;
the analytics foundation adds no optional cookie, local-storage ID,
fingerprinting, ad pixel, or cross-site tracking. Reassess consent before adding
an anonymous analytics identifier, marketing tag, third-party embed, or new
jurisdictional requirement. Optional tracking must remain unloaded until any
required consent is obtained.

## Deployment and security findings

Implemented application controls include production HSTS, CSP, frame denial,
MIME-sniffing prevention, strict-origin referrer policy, permissions policy,
server-only service-role access, default-deny RLS, RPC-first sensitive writes,
rate limits on abuse-prone workflows, and audited privileged changes.

Manual production gates remain:

- Confirm the hosting platform redirects HTTP to HTTPS. The application upgrades
  insecure production subresources and sends HSTS, but origin redirects are a
  deployment responsibility.
- Verify production and preview use separate Supabase projects/branches and
  exact Auth callback URLs.
- Confirm cookies are `Secure`, `HttpOnly` where applicable, and have the
  intended SameSite behavior on the deployed origin.
- Rotate and inventory Auth, database, service-role, moderation-provider, cron,
  and future email secrets. Confirm none are present in client bundles or logs.
- Enable monitored backups and complete a restore rehearsal before launch.
- Configure privacy-safe error/availability monitoring and an incident owner.
- Execute live positive/negative multi-user RLS tests, storage tests, rate-limit
  tests, and migration rollback/forward-fix procedures in non-production.
- Schedule the private analytics cleanup and media-quarantine cleanup jobs.

## Accessibility findings

Current strengths include a skip link, semantic headings, labeled forms,
keyboard-operable controls, visible focus treatments, reduced-motion handling,
responsive layouts, dialog labeling in the profile experience, and automated
axe coverage at desktop and mobile sizes.

Known limitations requiring manual review remain documented on
`/accessibility`: screen-reader journeys for realtime Circle chat and complex
profile controls, 200%/400% zoom, forced-colors/high-contrast behavior, focus
return in every dialog, live-region timing, long-content wrapping, and
representative touch-device testing. Automated checks are a regression guard,
not certification.

## Required professional and operational review

- Attorney/privacy review of every policy and the account-retention procedure.
- Accessibility review with disabled users and common assistive technology.
- A named moderation escalation process, including specialized legal/compliance
  handling for suspected child sexual exploitation material.
- Email provider, unsubscribe, suppression, and deliverability operations.
- Production TLS, header, RLS, backup/restore, monitoring, and incident-response
  verification.
