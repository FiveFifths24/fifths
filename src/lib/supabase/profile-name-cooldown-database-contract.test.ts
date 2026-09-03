import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608250002_profile_name_change_cooldowns.sql",
  ),
  "utf8",
).toLowerCase();

describe("profile name change cooldown database contract", () => {
  it("tracks username and display-name changes independently", () => {
    expect(migration).toContain("username_changed_at timestamptz");
    expect(migration).toContain("display_name_changed_at timestamptz");
    expect(migration).toContain("old.username is distinct from new.username");
    expect(migration).toContain(
      "old.display_name is distinct from new.display_name",
    );
  });

  it("enforces a seven-day wait in the database", () => {
    expect(migration).toContain("interval '7 days'");
    expect(migration).toContain("username_change_cooldown");
    expect(migration).toContain("display_name_change_cooldown");
    expect(migration).toContain("before update on public.profiles");
    expect(migration).toContain(
      "new.username_changed_at := old.username_changed_at",
    );
  });

  it("checks case-insensitive username availability", () => {
    expect(migration).toContain("normalized_username text := lower");
    expect(migration).toContain("username = normalized_username");
    expect(migration).toContain("username_taken");
  });
});
