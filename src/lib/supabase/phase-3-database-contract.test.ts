import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608020001_phase_3_pulse_foundation.sql",
  ),
  "utf8",
).toLowerCase();

const phaseThreeTables = [
  "modes",
  "pulse_check_ins",
  "pulse_check_in_interests",
];

describe("Phase 3 Pulse database security contract", () => {
  it.each(phaseThreeTables)("enables RLS on %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("limits Pulse history reads to its authenticated owner", () => {
    expect(migration).toContain("pulse_check_ins_select_own");
    expect(migration).toContain("(select auth.uid()) = user_id");
    expect(migration).toContain("pulse_check_in_interests_select_own");
  });

  it("routes writes through an authenticated-user RPC", () => {
    expect(migration).toContain("current_user_id uuid := auth.uid()");
    expect(migration).toContain(
      "grant execute on function public.record_pulse_check_in",
    );
    expect(migration).not.toMatch(
      /grant\s+(?:insert|update|delete)[^;]*public\.pulse_check_ins\s+to\s+authenticated/,
    );
  });

  it("stores constrained signals without diagnosis or free-text notes", () => {
    expect(migration).toContain("energy_level between 1 and 5");
    expect(migration).toContain("interval '24 hours'");
    expect(migration).not.toMatch(/diagnos|medical|health_note|free_text/);
  });

  it("seeds the five documented Pulse modes", () => {
    for (const mode of ["play", "create", "connect", "focus", "reset"]) {
      expect(migration).toContain(`('${mode}'`);
    }
  });
});
