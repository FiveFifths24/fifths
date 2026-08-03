# Manual Founder Setup

No credentials are needed to review public pages. The following founder-owned steps are required before live Phase 10 account, product, and trust-and-safety testing. Never paste credentials into an issue, pull request, chat, or committed file.

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
   - `supabase/migrations/202608030001_phase_4_sessions_foundation.sql`
   - `supabase/migrations/202608040001_phase_5_circles_foundation.sql`
   - `supabase/migrations/202608050001_phase_6_creator_commons_foundation.sql`
   - `supabase/migrations/202608060001_phase_7_fifth_realm_foundation.sql`
   - `supabase/migrations/202608070001_phase_9_passport_foundation.sql`
   - `supabase/migrations/202608080001_phase_10_trust_safety_foundation.sql`
8. In **Authentication → URL Configuration**, set the Site URL to the deployed application origin and add these redirect URLs for local and preview/production environments:
   - `http://localhost:3000/auth/callback`
   - `https://<your-preview-domain>/auth/callback`
   - `https://<your-production-domain>/auth/callback`
9. Keep email confirmations enabled. Configure custom SMTP before beta; the default Supabase sender is for limited testing only.
10. Create at least eleven test accounts: one trusted owner/host, one trusted platform moderator, one trusted platform administrator, one trusted creator, one trusted game master, one future local host, two Commons responders, two Realm applicants, and one unrelated member. Complete onboarding for each. After offline trust review, copy the trusted Auth user UUIDs and assign only the required platform roles in the non-production SQL Editor:

    ```sql
    insert into public.user_roles (user_id, role, granted_by)
    values ('<HOST_USER_UUID>'::uuid, 'host', null)
    on conflict (user_id, role) do nothing;

    insert into public.user_roles (user_id, role, granted_by)
    values ('<MODERATOR_USER_UUID>'::uuid, 'moderator', null)
    on conflict (user_id, role) do nothing;

    insert into public.user_roles (user_id, role, granted_by)
    values ('<CREATOR_USER_UUID>'::uuid, 'creator', null)
    on conflict (user_id, role) do nothing;

    insert into public.user_roles (user_id, role, granted_by)
    values ('<GAME_MASTER_USER_UUID>'::uuid, 'game_master', null)
    on conflict (user_id, role) do nothing;

    insert into public.user_roles (user_id, role, granted_by)
    values ('<PLATFORM_ADMIN_USER_UUID>'::uuid, 'platform_admin', null)
    on conflict (user_id, role) do nothing;
    ```

    Never expose this statement through a browser action. Confirm that ordinary members cannot insert, update, or delete `user_roles` or self-elevate.

11. Confirm that each account can read only its own profile, Pulse history, registration history, attendance record, and Circle membership unless a scoped host/moderator rule grants more. Confirm that the Session host can read only authorized rosters and that unrelated members cannot read them.
12. Record Pulse check-ins for both members. Create a host draft, confirm it is absent from discovery, publish it, and confirm that matching reasons appear without raw scores.
13. Create a Session with capacity one. Submit near-simultaneous registrations from the two member accounts; exactly one must succeed. Cancel the successful registration, confirm the count returns to zero, and confirm the other member can then register.
14. After the Session start time, mark attendance as the host. Confirm the member can read only their own result, an unrelated member cannot read it, the private attendance audit table receives a record, and exactly one private participant Passport entry is issued. Repeat `attended` and confirm no duplicate. Change the result to `absent`, confirm the same entry is revoked, then return it to `attended` and confirm the same entry is restored. After the Session ends, complete it and confirm one host entry is issued because a non-host attendee is verified; a completed empty Session must not award hosting activity.
15. Create one public request-based Circle and one private invite-only Circle. Confirm drafts are manager-only, public discovery appears only after publication, private Circle data is unreadable to the unrelated member, and Pulse reasons expose no raw score.
16. Request public-Circle membership as the applicant, invite the invitee to the private Circle, and exercise approval, decline, acceptance, local host/moderator assignment, removal, and voluntary departure. Confirm unrelated members cannot view the queue or roster and every status/role mutation reaches `private.circle_membership_audit_logs`.
17. Create a Session draft as the trusted host, associate it with the private Circle, publish it, and confirm only active Circle members, registered participants, and authorized Session managers can read it. Confirm a published Session cannot be newly associated and a Circle with a future published Session cannot be archived.
18. Create one independent Commons draft as the trusted creator and one Circle-scoped draft as the local host. Confirm the unrelated member cannot read a private-Circle opportunity, and that neither draft appears in discovery before publication.
19. Publish an opportunity with one position. Submit near-simultaneous responses from both responders, then attempt to accept both. Exactly one acceptance must succeed; `accepted_count` must remain one and the opportunity must close as filled.
20. Confirm a response owner can read only their own statement and status, the authorized manager can read the scoped response queue, and an unrelated member cannot read any response. Verify changes reach both private Phase 6 audit tables.
21. Withdraw an accepted response before completion. Confirm the authoritative count decrements and a deadline-active opportunity closed as filled reopens. Accept another responder, close the opportunity, and verify neither side alone can complete the response.
22. Confirm completion first as the participant and then as the authorized manager. Confirm the response and opportunity complete only after both confirmations, one participant entry and one creator-lead Passport entry are issued without duplicates, and bounded Commons/Passport inbox updates appear without exposing the private response. Confirm no payment, contract, message, report, or upload is created.
23. Confirm a Circle with a published Commons opportunity cannot be archived. Close or cancel the opportunity through an allowed transition before testing archival again.
24. Create one independent Realm draft as the trusted game master. Confirm the ordinary member cannot create a campaign and the draft is absent from discovery before recruiting opens.
25. Try to associate the campaign with a Circle the game master does not host; confirm denial. Grant local host authority through the existing Circle owner flow, create a separate Circle-scoped draft, and confirm private-Circle campaign data is unreadable to the unrelated member.
26. Open recruiting on a campaign with one player seat. Submit applications from both Realm applicants, confirm each applicant can read only their own application, the game master can read the scoped queue, and the unrelated member cannot read application rows.
27. Attempt near-simultaneous acceptance for both applicants. Exactly one acceptance must succeed; `active_player_count` must remain one, the accepted application must have one active player membership, and all campaign/application/membership changes must reach the private Phase 7 audit tables.
28. Confirm the accepted player can read the active roster but cannot read other application answers. Exercise applicant withdrawal, active-player departure, and GM removal, verifying authoritative capacity decrements once and never becomes negative.
29. Create a compatible private Session draft, associate it with the campaign, publish it, and confirm only active campaign members, prior registrants, and authorized Session managers can read it. Confirm a published Session cannot be newly associated and a Circle with recruiting or active Realm work cannot be archived.
30. Complete a campaign and confirm one Passport entry and bounded Passport notification are issued to each active player plus one game-master entry. Confirm left/removed members receive none and no payment, message, report, virtual tabletop record, copyrighted rule content, or proprietary game content is created.
31. Confirm each member can read only their own Passport. Replay every eligible source action and verify the unique member/activity/source identity prevents duplicates. Revoke one entry as the platform administrator with a reason, replay its source, and confirm the administrative correction remains revoked and is recorded in `private.passport_entry_audit_logs`. Confirm an ordinary member cannot call the correction successfully.
32. As one ordinary member, submit private feedback and a safety report. Confirm an unrelated member cannot read either, the reporter can read status but not internal review notes, and the report target receives no report visibility or allegation notification.
33. Submit matching and repeated intake to verify duplicate active-report prevention and the five-per-24-hour limits. Confirm external context URLs are rejected while a protected path such as `/home/circles` succeeds.
34. As the moderator, move a report to reviewing and escalation, then confirm resolution and dismissal are denied. As the platform administrator, resolve or dismiss it with a note. Confirm each transition reaches `private.report_audit_logs`, the note exists only there, and the reporter receives bounded status notifications.
35. Confirm only the platform administrator can review/close feedback and that every transition reaches `private.feedback_audit_logs`. Confirm moderators cannot read the feedback queue.
36. Trigger a Circle invitation, Commons response decision, Realm application decision, Passport issuance/correction, and report update. Confirm exactly one caller-owned notification per dedupe key, cross-user denial, protected action paths, and owner-only mark-one/mark-all-read behavior.
37. Regenerate `src/types/database.ts` from the applied schema and review the diff before committing any generated update.

Do not paste or commit the database password, JWT signing key, or service-role key. Phase 10 does not require a service-role key.

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

With the non-production Supabase values configured, manually verify all account, Pulse, Session, Circle, Commons, Realm, Passport, report, feedback, moderation, audit, notification, privacy, capacity, and cross-user RLS journeys listed above. Do not apply any migration to production until these checks and a professional legal/privacy review are complete.
