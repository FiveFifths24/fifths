# Intentional activity and discovery

## Product boundary

SIGNAL Home answers “What is happening in my world?” with a finite,
friend-scoped activity list. It does not contain infinite scroll, profile views,
search history, private messages, saved items, click tracking, or an opaque
engagement ranker. Global discovery is loaded only after the member chooses
**Explore Beyond Your Circle**.

## Existing systems reused

- Accepted friendships, follows, blocks, mutes, and blocked-word preferences
- Profile visibility, discoverability, and broad city/region visibility
- Canonical Sessions, Circles, Creator Commons, interests, and formats
- Existing source-specific `can_view_*` database functions and RLS
- Structured private reports, notifications, moderator roles, and audit logs
- Current Pulse and deterministic recommendation foundations

The implementation does not duplicate those systems. Activity rows reference
canonical source IDs; titles, destinations, and source visibility are resolved
when the viewer requests activity.

## Activity architecture

Meaningful source changes create one `signal_activity_events` row. A stable
dedupe key collapses repeated edits or leave/rejoin churn into the latest event.
The controlled activity types are:

- `session_created`
- `session_joined`
- `circle_created`
- `circle_joined`
- `profile_status_updated`
- `profile_music_updated`
- `profile_featured_media_updated`
- `profile_recommendation_updated`
- `commons_created`

The featured-media type is reserved for integration with image moderation PR
#24, but this branch does not emit it on its own. That prevents an image change
from being amplified before the quarantine/approval pipeline is installed.

`get_friend_activity` is the only member-readable activity interface. Direct
table reads are revoked and the table has default-deny RLS. The function:

1. Requires an accepted friendship.
2. Applies the actor's overall and category sharing preferences.
3. Excludes blocked and viewer-muted actors.
4. Applies profile visibility.
5. Re-checks the canonical Session, Circle, opportunity, status, or profile
   field and its source-specific access function.
6. Omits deleted, private, cancelled, archived, cleared, or expired sources.
7. Returns at most 20 events per page from a 30-day window plus an honest
   `has_more` cursor.

When `has_more` is false, Home displays **You're caught up**. Global discovery
is a separate request and is not hidden behind that statement.

## Privacy defaults

Activity is visible only to accepted friends. Session, Circle, and profile
activity default on within that boundary. Commons publishing defaults off
because professional opportunity activity can be more sensitive. Members can
disable all sharing or any category from Account. Blocks, source privacy, and
access checks always override preferences.

## Discovery

`/home/discover` provides explicit, finite discovery across the existing:

- People
- Sessions
- Circles
- Creator Commons opportunities

Filters use only fields already stored: type, broad scope, participation format,
interest, and happening soon. A lightweight parser recognizes phrases such as
“near me,” “this weekend,” and “happening soon”; no AI service or behavioral
ranking is involved.

Near Me uses only the viewer's profile city/region and public entity location
labels. Other profiles are returned through `get_member_profiles` with
`p_discoverable_only: true`, so their visibility, discoverability, blocks, and
location-sharing choices remain authoritative. Exact addresses, coordinates,
emails, phone numbers, and internal IDs are never exposed as location results.

## Abuse and link protection

Temporary server-side limits cover direct messages, repeated identical message
content, follows, friend requests,
Session registrations, Circle membership actions, and Session/Circle/Commons
creation. Counters live in the private schema and can be cleaned after seven
days. Ordinary over-limit behavior receives a retry-later error; it does not
permanently punish or ban a member.

Profile URLs are normalized server-side and checked again by a database trigger.
Only public HTTP(S) URLs without embedded credentials, localhost, loopback,
link-local, or private-network hosts are accepted. Existing Spotify, YouTube,
portfolio, gaming, and business links remain supported. External links continue
to use `noopener noreferrer` where they open a new tab.

The existing reporting foundation remains authoritative. Report entry points
now cover public profiles, Sessions, Circles, Commons opportunities, and message
conversations. Existing duplicate-report and daily report limits protect the
queue from abuse. Surface-specific reports also retain the authorized entity ID
in the restricted report record so a reviewer can identify the reported member,
Session, Circle, or Commons opportunity without relying on URL parsing.

## Setup

Apply:

```text
supabase/migrations/202609040002_intentional_activity_discovery.sql
```

No new environment variables or dashboard-created resources are required.
After application, confirm `signal_activity_events` has RLS enabled and no
authenticated SELECT grant. Test with at least three ordinary accounts: two
accepted friends and one non-friend, then repeat after an opt-out, mute, and
block.

## Intentional deferrals

- Events are not modeled in the current repository, so no event activity or
  filter was invented.
- Fifth Realm remains available through its existing dedicated discovery page;
  it is not duplicated in the first unified search surface.
- Image moderation PR #24 remains separate. This branch reserves the activity
  type but deliberately does not emit featured-media activity. Emission should
  be enabled only after PR #24 is integrated, and only for approved media.
- A full natural-language/semantic search service is deferred. The current
  deterministic parser keeps the schema ready without adding an unnecessary AI
  dependency.
- CAPTCHA and edge-level login defense are deployment-layer follow-ups. This
  change adds server-side limits only where authenticated write RPCs and tables
  already exist.
