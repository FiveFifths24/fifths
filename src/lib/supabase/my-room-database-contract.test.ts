import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608250005_my_room_foundation.sql",
  ),
  "utf8",
).toLowerCase();

describe("My Room database contract", () => {
  it("stores a limited visual room configuration without a furniture economy", () => {
    expect(migration).toContain("create table public.profile_rooms");
    expect(migration).toContain("wall_color text");
    expect(migration).toContain("character_accessory text");
    expect(migration).toContain("motion_enabled boolean");
    expect(migration).not.toContain("furniture_inventory");
  });

  it("keeps reads visibility-aware and writes owner-bound", () => {
    expect(migration).toContain("current_user_id uuid := auth.uid()");
    expect(migration).toContain("public.can_view_profile(profile.id)");
    expect(migration).toContain(
      "grant execute on function public.get_profile_room(uuid) to anon, authenticated",
    );
  });

  it("rejects arbitrary colors and unsupported customization values", () => {
    expect(migration).toContain("profile_rooms_wall_color_hex");
    expect(migration).toContain("profile_rooms_lighting_theme");
    expect(migration).toContain("profile_rooms_character_accessory");
  });
});
