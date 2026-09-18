import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609180015_signal_tutorial_starter_path.sql",
  ),
  "utf8",
).toLowerCase();

describe("SIGNAL tutorial and Starter Path database contract", () => {
  it("persists start, skip, resume, and completion states", () => {
    for (const action of ["'start'", "'advance'", "'skip'", "'complete'"]) {
      expect(migration).toContain(action);
    }
    expect(migration).toContain(
      "greatest(signal_tutorial_progress.current_step",
    );
    expect(migration).toContain("when p_action = 'skip' then 'skipped'");
    expect(migration).toContain("when p_action = 'complete' then 'completed'");
  });

  it("makes task completion idempotent", () => {
    expect(migration).toContain("primary key (user_id, task_key)");
    expect(migration).toContain("on conflict (user_id, task_key) do nothing");
  });

  it("derives participation tasks from member-owned product state", () => {
    expect(migration).toContain("from public.pulse_check_ins");
    expect(migration).toContain("from public.circle_members");
    expect(migration).toContain("from public.registrations");
    expect(migration).toContain("and status = 'active'");
    expect(migration).toContain("and status = 'registered'");
  });

  it("does not spoof or write verified Passport participation", () => {
    expect(migration).not.toMatch(/insert\s+into\s+public\.passport_entries/);
    expect(migration).not.toMatch(/update\s+public\.passport_entries/);
    expect(migration).not.toMatch(/delete\s+from\s+public\.passport_entries/);
  });

  it("keeps tables select-only and mutations behind authenticated RPCs", () => {
    expect(migration).toContain(
      "revoke all on public.signal_tutorial_progress from public, anon, authenticated",
    );
    expect(migration).toContain(
      "revoke all on public.signal_starter_path_tasks from public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant execute on function public.set_signal_tutorial_progress(text, integer)",
    );
  });
});
