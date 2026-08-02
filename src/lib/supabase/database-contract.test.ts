import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608010001_phase_2_identity_foundation.sql",
  ),
  "utf8",
).toLowerCase();

const publicTables = [
  "profiles",
  "user_roles",
  "interests",
  "profile_interests",
  "skills",
  "profile_skills",
];

describe("Phase 2 database security contract", () => {
  it.each(publicTables)("enables RLS on %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("keeps elevated roles outside member mutation grants", () => {
    expect(migration).toContain(
      "grant select on public.user_roles to authenticated",
    );
    expect(migration).not.toMatch(
      /grant\s+(?:insert|update|delete)[^;]*public\.user_roles\s+to\s+authenticated/,
    );
    expect(migration).toContain("user_roles_audit_change");
  });

  it("routes identity writes through validated database functions", () => {
    expect(migration).not.toMatch(
      /grant\s+update[^;]*public\.profiles\s+to\s+authenticated/,
    );
    expect(migration).not.toMatch(
      /grant\s+(?:insert|delete)[^;]*public\.profile_(?:interests|skills)\s+to\s+authenticated/,
    );
  });

  it("limits onboarding completion to the authenticated caller", () => {
    expect(migration).toContain("current_user_id uuid := auth.uid()");
    expect(migration).toContain(
      "grant execute on function public.complete_onboarding",
    );
    expect(migration).toContain("where id = current_user_id");
  });
});
