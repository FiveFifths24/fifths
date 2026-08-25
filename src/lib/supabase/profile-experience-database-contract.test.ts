import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608250003_profile_experience.sql",
  ),
  "utf8",
).toLowerCase();

describe("profile experience database contract", () => {
  it("separates wallpaper, landscape, and card color presentation", () => {
    expect(migration).toContain("background_image_url text");
    expect(migration).toContain("profile_accent_color text");
    expect(migration).toContain("profiles_accent_color_hex");
    expect(migration).toContain("set background_image_url = cover_image_url");
    expect(migration).toContain("'image/gif'");
  });

  it("stores an expiring 24-hour Current Signal", () => {
    expect(migration).toContain("create table public.profile_statuses");
    expect(migration).toContain("interval '24 hours'");
    expect(migration).toContain("current_status.expires_at > now()");
    expect(migration).toContain("public.profile_mutes");
    expect(migration).toContain("public.profile_blocked_words");
  });

  it("limits featured connections to eight current friends", () => {
    expect(migration).toContain(
      "create table public.profile_featured_connections",
    );
    expect(migration).toContain("display_order between 1 and 8");
    expect(migration).toContain("public.profiles_are_friends");
  });
});
