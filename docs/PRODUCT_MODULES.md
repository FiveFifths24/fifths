# Product Modules

## One connected loop

Pulse captures present capacity. The recommendation service ranks Sessions, Circles, Commons opportunities, and Realm campaigns. Participation occurs through those shared records. Authorized completion creates Passport activity. That history can improve future recommendations without becoming a public score.

## Pulse

Owns private check-ins: mode, stimulation, social intensity, format, time, interests, and optional range. It consumes eligible records from other modules but does not own them. MVP recommendations are deterministic and explainable—no AI or machine learning.

## Circles

Owns community identity, visibility, rules, memberships, requests, and moderator/host roles. Sessions, Commons opportunities, and Realm campaigns may belong to a Circle. MVP excludes real-time chat.

## Creator Commons

Owns opportunities, skills, saves, responses, participant selection, closure, and confirmed completion. It does not own payments, escrow, messaging, or complex contracts.

## Fifth Realm

Owns campaign profiles, game-master ownership, filters, player applications, membership, and campaign participation. Campaign meetings use shared Sessions. It does not reproduce rules or build virtual tabletop tools.

## Passport

Owns immutable or revocable verified activity entries and configurable point values. Authorized workflows can issue credit for attendance, hosting, volunteering, collaboration, and campaign participation. No public leaderboard and no self-verification.

## Shared platform capabilities

Profiles, interests, skills, roles, organizations, Sessions, reports, notifications, analytics, authorization, and recommendations belong to the platform—not to an individual product module.

## Phase 2 account foundation

One Supabase Auth identity now maps to one private profile and one or more centrally managed platform roles. Onboarding collects a display identity, timezone, optional pronouns, interests, skills, and an 18+ self-attestation. It does not collect diagnoses or a precise home address.

This shared identity is intentionally product-neutral. Pulse, Circles, Creator Commons, Fifth Realm, and Passport will consume it in later phases without creating separate accounts or parallel role systems.

## Phase 3 Pulse implementation

Pulse now records a private, short-lived view of present capacity: one of five modes, energy, stimulation, social pace, format, available time, optional broad travel range, and up to five current interests. Check-ins remain readable only by their owner and stop influencing matching after 24 hours. The form deliberately avoids diagnoses, health notes, and precise location.

The shared recommendation foundation can rank eligible future candidates with stable rules and plain-language reasons. It does not fetch product inventory and does not use AI. Personal Home therefore shows real Pulse state plus an explicitly empty recommendation state until Phase 4 and later modules create real eligible records.

## Phase 4 Sessions implementation

Shared Sessions are now the first live recommendation inventory. Authenticated members can discover published future Sessions, review timing and capacity, see transparent Pulse-match reasons, register or cancel, and review their private registration history. Personal Home shows up to three eligible Session matches without manufacturing activity.

Trusted `host` and `platform_admin` roles can create private drafts, publish or cancel them, complete ended Sessions, review the active roster, and mark audited attendance. Registration capacity is enforced atomically in PostgreSQL. Phase 4 does not add Circle associations, Commons or Realm ownership, payments, waitlists, messaging, private access links, or Passport issuance.

## Phase 5 Circles implementation

Circles now provide real protected discovery, purpose and rule context, public/private visibility, open/request/invite-only membership, and caller-owned membership history. Eligible published Circles participate in the existing deterministic Pulse scorer without exposing raw scores or private moderation state.

Trusted platform hosts create private drafts and become the Circle owner. Circle-local owner, host, moderator, and member roles stay scoped to one Circle. Membership requests, invitations, approvals, declines, removals, departures, and role changes run through audited database functions; ordinary authenticated clients have no direct write grants.

Authorized hosts can associate a Circle with a draft shared Session. Private-Circle Sessions remain restricted to active Circle members after publication. Phase 5 does not add posts, chat, feeds, organizations, reports, notifications, global moderation queues, Commons or Realm ownership, payments, or Passport issuance.

## Phase 6 Creator Commons implementation

Creator Commons now provides protected opportunity discovery, clear scope and deliverables, required skills, optional interests, deadlines, openings, private saves, private structured responses, participant selection, and confirmed completion. Eligible published opportunities participate in the existing deterministic Pulse scorer without exposing raw scores, private responses, profile skills, or selection state.

Centrally assigned creators and platform administrators can create independent private drafts. Active Circle owners and local hosts can create opportunities scoped only to their Circle. Private-Circle opportunities inherit member-aware visibility; unrelated members cannot discover the opportunity or its taxonomy data.

Opportunity managers review responses privately and accept only while authoritative positions remain. Acceptance is capacity-safe under a row lock. Participants retain a withdrawal path before completion. A closed opportunity completes only after both the accepted participant and an authorized manager confirm the work; that confirmation does not create Passport credit.

Phase 6 does not process payment, escrow, contracts, tax information, uploads, equipment transfers, private links, direct messages, organizations, reports, notifications, Realm campaigns, or Passport entries.

## Phase 7 Fifth Realm implementation

Fifth Realm now provides protected discovery for original, system-neutral campaign profiles with genre, tone, cadence, experience welcome, safety expectations, player capacity, and bounded Pulse-fit metadata. Eligible recruiting campaigns participate in the existing deterministic scorer without exposing raw scores, private applications, or roster data.

Centrally assigned game masters and platform administrators create private drafts. A campaign can be associated with a Circle only when its game master is also an active Circle owner or host. Private-Circle campaigns inherit member-aware visibility, and a Circle cannot be archived while associated Realm work is recruiting or active.

Applications remain private to each applicant and the campaign manager. Acceptance locks the campaign row, verifies seats, changes application state, creates active player membership, and increments authoritative capacity in one transaction. Game masters have a private application queue and active roster; players can leave, and managers can remove players, with all state changes audited.

Campaign meetings reuse shared Sessions. Only compatible private draft Sessions can be associated, and published Realm Sessions are readable only by active campaign members, registrants, or authorized Session managers. Phase 7 does not reproduce rules, host virtual tabletops, collect copyrighted content, add chat or payments, or issue Passport credit.

## Phase 1 public representation

Each module has a public overview route explaining audience, planned capabilities, Pulse and Passport connections, MVP scope, and explicit exclusions. Preview notices distinguish planned behavior from live functionality. All five routes use one shared `ModuleOverview` component so product storytelling stays cohesive while allowing restrained module accents.
