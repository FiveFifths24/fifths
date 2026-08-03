import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608070001_phase_9_passport_foundation.sql",
  ),
  "utf8",
).toLowerCase();

describe("Phase 9 Passport database security contract", () => {
  it("keeps Passport private and gives authenticated members select-only access", () => {
    expect(migration).toContain(
      "alter table public.passport_entries enable row level security",
    );
    expect(migration).toContain('create policy "passport_entries_select_own"');
    expect(migration).toContain("user_id = (select auth.uid())");
    expect(migration).toContain(
      "revoke all on public.passport_entries from anon, authenticated",
    );
    expect(migration).toContain(
      "grant select on public.passport_entries to authenticated",
    );
    expect(migration).not.toMatch(
      /grant\s+(?:insert|update|delete)[^;]*public\.passport_entries\s+to\s+authenticated/,
    );
  });

  it("prevents duplicate activity with one stable source identity", () => {
    expect(migration).toContain(
      "unique (user_id, activity_kind, source_record_id)",
    );
    expect(migration).toContain(
      "on conflict (user_id, activity_kind, source_record_id) do update",
    );
    expect(migration).toContain(
      "and passport_entries.revocation_kind = 'source_correction'",
    );
  });

  it("issues only through private triggers tied to verified source state", () => {
    expect(migration).toContain("session_attendance_sync_passport");
    expect(migration).toContain("session_completion_sync_passport");
    expect(migration).toContain("opportunity_response_sync_passport");
    expect(migration).toContain("opportunity_completion_sync_passport");
    expect(migration).toContain("campaign_completion_sync_passport");
    expect(migration).toContain("new.status = 'attended'");
    expect(migration).toContain("new.status = 'completed'");
    expect(migration).toContain("membership.status = 'active'");
    expect(migration).toContain("private.sync_session_host_passport");
    expect(migration).toContain(
      "attendance.user_id <> source_session.host_user_id",
    );
    expect(migration).toContain("attendance.user_id <> session.host_user_id");
    expect(migration).toContain(
      "revoke all on function private.issue_passport_entry",
    );
    expect(migration).toContain(
      "revoke all on function private.sync_session_host_passport",
    );
    expect(migration).not.toMatch(
      /grant execute on function (?:public|private)\.issue_passport_entry/,
    );
  });

  it("keeps corrections visible, audited, and resistant to automatic administrative reversal", () => {
    expect(migration).toContain("private.passport_entry_audit_logs");
    expect(migration).toContain("passport_entry_audit_change");
    expect(migration).toContain("revocation_kind = 'source_correction'");
    expect(migration).toContain("revocation_kind = 'administrative'");
    expect(migration).toContain("public.has_role('platform_admin')");
    expect(migration).toContain(
      "a correction reason between 10 and 500 characters is required",
    );
  });

  it("backfills eligible trusted activity through the same idempotent issuer", () => {
    expect(migration).toContain("from public.attendance_records attendance");
    expect(migration).toContain("from public.sessions session");
    expect(migration).toContain("from public.opportunity_responses response");
    expect(migration).toContain("from public.realm_campaigns campaign");
    expect(migration).toContain("select private.issue_passport_entry(");
  });

  it("does not begin Phase 10 or add gamified public ranking", () => {
    expect(migration).not.toMatch(
      /create table public\.(?:reports|notifications)/,
    );
    expect(migration).not.toMatch(/create table public\.leaderboards/);
    expect(migration).not.toMatch(/create table public\.passport_points/);
    expect(migration).not.toMatch(/create table public\.messages/);
  });
});
