import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609040002_intentional_activity_discovery.sql",
  ),
  "utf8",
).toLowerCase();
const home = readFileSync(
  resolve(process.cwd(), "src/app/home/page.tsx"),
  "utf8",
).toLowerCase();
const discovery = readFileSync(
  resolve(process.cwd(), "src/app/home/discover/page.tsx"),
  "utf8",
).toLowerCase();
const activityComponent = readFileSync(
  resolve(process.cwd(), "src/features/activity/friends-activity.tsx"),
  "utf8",
).toLowerCase();

describe("intentional activity and discovery database contract", () => {
  it("uses a controlled, meaningful activity taxonomy", () => {
    for (const type of [
      "session_created",
      "session_joined",
      "circle_created",
      "circle_joined",
      "profile_status_updated",
      "profile_music_updated",
      "profile_featured_media_updated",
      "profile_recommendation_updated",
      "commons_created",
    ]) {
      expect(migration).toContain(`'${type}'`);
    }
    for (const excluded of [
      "profile_view",
      "search",
      "message_read",
      "saved_item",
      "page_visit",
    ]) {
      expect(migration).not.toContain(`'${excluded}'`);
    }
  });

  it("keeps activity rows default-deny and exposes only a checked RPC", () => {
    expect(migration).toContain(
      "alter table public.signal_activity_events enable row level security",
    );
    expect(migration).toContain(
      "revoke all on public.signal_activity_events from public, anon, authenticated",
    );
    expect(migration).not.toContain(
      "grant select on public.signal_activity_events to authenticated",
    );
    expect(migration).toContain(
      "public.profiles_are_friends(auth.uid(), event.actor_user_id)",
    );
    expect(migration).toContain(
      "not public.profiles_are_blocked(auth.uid(), event.actor_user_id)",
    );
    expect(migration).toContain("public.profile_mutes");
  });

  it("honors category opt-outs and private canonical source visibility", () => {
    expect(migration).toContain("preference.share_with_friends");
    expect(migration).toContain("preference.share_session_activity");
    expect(migration).toContain("preference.share_circle_activity");
    expect(migration).toContain("preference.share_profile_activity");
    expect(migration).toContain("preference.share_commons_activity");
    expect(migration).toContain("public.can_view_session(event.entity_id)");
    expect(migration).toContain("public.can_view_circle(event.entity_id)");
    expect(migration).toContain(
      "public.can_view_creator_opportunity(event.entity_id)",
    );
    expect(migration).toContain("public.can_view_profile(event.actor_user_id)");
  });

  it("does not leak deleted, hidden, cancelled, cleared, or expired sources", () => {
    expect(migration).toContain("session.status = 'published'");
    expect(migration).toContain("circle.status = 'published'");
    expect(migration).toContain("opportunity.status = 'published'");
    expect(migration).toContain("status.expires_at > now()");
    expect(migration).toContain("profile.profile_song_title");
    expect(migration).toContain("profile.featured_profile_image_url");
    expect(migration).toContain("profile.latest_pick_title");
    expect(migration).not.toContain(
      "'profile_featured_media_updated',\n      'profile',",
    );
  });

  it("collapses repeat activity and reaches a genuine finite end", () => {
    expect(migration).toContain("unique (dedupe_key)");
    expect(migration).toContain("on conflict (dedupe_key)");
    expect(migration).toContain(
      "event.created_at >= now() - interval '30 days'",
    );
    expect(migration).toContain("p_before timestamptz default null");
    expect(migration).toContain("p_before_id uuid default null");
    expect(migration).toContain("event.id < p_before_id");
    expect(migration).toContain("limit least(greatest(p_limit, 1), 20) + 1");
    expect(migration).toContain("has_more boolean");
  });

  it("does not load global discovery as part of personal Home", () => {
    expect(home).toContain('rpc("get_friend_activity"');
    expect(home).not.toContain('.from("sessions")');
    expect(home).not.toContain('.from("circles")');
    expect(home).not.toContain('.from("creator_opportunities")');
    expect(activityComponent).toContain("you&apos;re caught up");
    expect(activityComponent).toContain("/home/discover");
  });

  it("uses discoverability and broad location only in explicit discovery", () => {
    expect(discovery).toContain("p_discoverable_only: true");
    expect(discovery).toContain('.select("city, region")');
    expect(discovery).not.toContain('.select("address');
    expect(discovery).not.toContain("latitude");
    expect(discovery).not.toContain("longitude");
    expect(discovery).not.toContain('.select("email');
    expect(discovery).not.toContain('.select("phone');
    expect(discovery).toContain("results are finite");
  });

  it("adds progressive server-side limits without permanent punishment", () => {
    for (const action of [
      "direct_message",
      "follow",
      "friend_request",
      "session_registration",
      "circle_membership",
      "session_create",
      "circle_create",
      "commons_create",
    ]) {
      expect(migration).toContain(`'${action}'`);
    }
    expect(migration).toContain("please slow down and try again later");
    expect(migration).toContain("'direct_message_repeat:' || md5");
    expect(migration).not.toContain("account_suspension");
  });

  it("retains the authorized entity behind a surface-specific report", () => {
    expect(migration).toContain("add column target_entity_id uuid");
    expect(migration).toContain(
      "create or replace function public.submit_entity_report",
    );
    expect(migration).toContain(
      "select 1 from public.profiles profile where profile.id = p_target_entity_id",
    );
    expect(migration).toContain("public.can_view_session(p_target_entity_id)");
    expect(migration).toContain("public.can_view_circle(p_target_entity_id)");
    expect(migration).toContain(
      "public.can_view_creator_opportunity(p_target_entity_id)",
    );
  });

  it("validates public external URLs in the database", () => {
    expect(migration).toContain(
      "create or replace function public.is_safe_external_url",
    );
    expect(migration).toContain("profiles_validate_external_urls");
    expect(migration).not.toContain("javascript:");
    expect(migration).toContain("localhost");
    expect(migration).toContain("192\\.168\\.");
  });
});
