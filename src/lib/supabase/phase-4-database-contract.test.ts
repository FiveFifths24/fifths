import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608030001_phase_4_sessions_foundation.sql",
  ),
  "utf8",
).toLowerCase();

const phaseFourTables = [
  "sessions",
  "session_interests",
  "registrations",
  "attendance_records",
];

describe("Phase 4 Sessions database security contract", () => {
  it.each(phaseFourTables)("enables RLS on %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("keeps direct member writes disabled", () => {
    for (const table of phaseFourTables) {
      expect(migration).toContain(
        `revoke all on public.${table} from anon, authenticated`,
      );
      expect(migration).not.toMatch(
        new RegExp(
          `grant\\s+(?:insert|update|delete)[^;]*public\\.${table}\\s+to\\s+authenticated`,
        ),
      );
    }
  });

  it("requires a trusted host role and caller-derived identity", () => {
    expect(migration).toContain("current_user_id uuid := auth.uid()");
    expect(migration).toContain("public.has_role('host')");
    expect(migration).toContain("public.has_role('platform_admin')");
    expect(migration).toContain("host_user_id = auth.uid()");
  });

  it("serializes registration against authoritative capacity", () => {
    expect(migration).toContain("for update");
    expect(migration).toContain(
      "current_session.confirmed_registration_count >= current_session.capacity",
    );
    expect(migration).toContain(
      "confirmed_registration_count = confirmed_registration_count + 1",
    );
    expect(migration).toContain(
      "confirmed_registration_count = greatest(confirmed_registration_count - 1, 0)",
    );
    expect(migration).toContain("primary key (session_id, user_id)");
    expect(migration).not.toContain("waitlist");
  });

  it("restricts and audits attendance changes", () => {
    expect(migration).toContain("public.can_manage_session(p_session_id)");
    expect(migration).toContain("and status = 'registered'");
    expect(migration).toContain("private.session_attendance_audit_logs");
    expect(migration).toContain("session_attendance_audit_change");
    expect(migration).toContain(
      "revoke all on private.session_attendance_audit_logs from public, anon, authenticated",
    );
  });

  it("does not issue Passport activity or add later product workflows", () => {
    expect(migration).not.toMatch(/insert into public\.passport_entries/);
    expect(migration).not.toMatch(/create table public\.circle_members/);
    expect(migration).not.toMatch(/create table public\.creator_opportunities/);
    expect(migration).not.toMatch(/create table public\.realm_campaigns/);
  });
});
