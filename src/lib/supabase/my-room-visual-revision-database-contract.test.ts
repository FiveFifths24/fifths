import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608250006_my_room_visual_revision.sql",
  ),
  "utf8",
).toLowerCase();

describe("My Room visual revision database contract", () => {
  it("stores compatible blob accessories in independent slots", () => {
    expect(migration).toContain("add column head_accessory text");
    expect(migration).toContain("add column face_accessory text");
    expect(migration).toContain("add column neck_accessory text");
    expect(migration).toContain("'sunglasses'");
    expect(migration).toContain("'bandana'");
  });

  it("migrates earlier single accessories forward", () => {
    expect(migration).toContain("when 'headphones' then 'headphones'");
    expect(migration).toContain("when 'glasses' then 'glasses'");
    expect(migration).toContain("when 'beanie' then 'beanie'");
  });

  it("keeps room reads subject to existing profile visibility", () => {
    expect(migration).toContain("public.can_view_profile(profile.id)");
    expect(migration).toContain(
      "grant execute on function public.get_profile_room(uuid) to anon, authenticated",
    );
  });
});
