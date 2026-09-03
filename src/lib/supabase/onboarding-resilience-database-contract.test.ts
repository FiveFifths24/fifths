import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/202608290002_onboarding_resilience.sql",
  ),
  "utf8",
).toLowerCase();

describe("onboarding resilience database contract", () => {
  it("enforces the twenty-character handle limit in storage and RPCs", () => {
    expect(migration).toContain("char_length(username::text) between 3 and 20");
    expect(migration.match(/between 3 and 20/g)?.length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("allows twenty interests without changing the skill limit", () => {
    expect(migration).toContain("requested_interest_count > 20");
    expect(migration).toContain("requested_skill_count > 12");
  });

  it("preserves every active launch-profile editor argument", () => {
    for (const argument of [
      "p_profile_song_url",
      "p_latest_pick_url",
      "p_mood",
      "p_view_my_url",
    ]) {
      expect(migration).toContain(argument);
    }
  });
});
