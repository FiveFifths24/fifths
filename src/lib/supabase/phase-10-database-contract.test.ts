import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608080001_phase_10_trust_safety_foundation.sql",
  ),
  "utf8",
).toLowerCase();

describe("Phase 10 trust-and-safety database contract", () => {
  it("keeps feedback, reports, and notifications private with no direct member writes", () => {
    for (const table of ["member_feedback", "reports", "notifications"]) {
      expect(migration).toContain(
        `alter table public.${table} enable row level security`,
      );
      expect(migration).toContain(
        `revoke all on public.${table} from anon, authenticated`,
      );
      expect(migration).toContain(
        `grant select on public.${table} to authenticated`,
      );
      expect(migration).not.toMatch(
        new RegExp(
          `grant\\s+(?:insert|update|delete)[^;]*public\\.${table}\\s+to\\s+authenticated`,
        ),
      );
    }
    expect(migration).toContain("reporter_user_id = (select auth.uid())");
    expect(migration).toContain("user_id = (select auth.uid())");
  });

  it("rate-limits duplicate submissions and accepts only internal context paths", () => {
    expect(migration).toContain("feedback submission limit reached");
    expect(migration).toContain("report submission limit reached");
    expect(migration).toContain("a matching active report already exists");
    expect(migration).toContain("context must be a fifths path");
    expect(migration).toContain("context_url !~ '^//'");
    expect(migration).toContain("action_url !~ '^//'");
  });

  it("separates moderator triage from platform-admin final decisions", () => {
    expect(migration).toContain("public.has_role('moderator')");
    expect(migration).toContain("public.has_role('platform_admin')");
    expect(migration).toContain(
      "final decisions require a platform administrator",
    );
    expect(migration).toContain("final reports cannot be reopened in phase 10");
    expect(migration).toContain("private.report_audit_logs");
    expect(migration).toContain("private.feedback_audit_logs");
  });

  it("keeps internal review notes out of reporter-readable tables", () => {
    const reportsTable = migration.slice(
      migration.indexOf("create table public.reports"),
      migration.indexOf("create trigger reports_set_updated_at"),
    );
    expect(reportsTable).not.toContain("resolution_note");
    expect(migration).toContain("current_setting('app.moderation_note', true)");
  });

  it("issues deduplicated notifications for meaningful workflow changes", () => {
    expect(migration).toContain("unique (user_id, dedupe_key)");
    expect(migration).toContain("circle_invitation_notify_member");
    expect(migration).toContain("opportunity_response_notify_member");
    expect(migration).toContain("campaign_application_notify_member");
    expect(migration).toContain("passport_change_notify_member");
    expect(migration).toContain("report_status_notify_reporter");
    expect(migration).toContain(
      "revoke all on function private.issue_notification",
    );
  });

  it("does not begin Phase 11 or add excluded automation and enforcement", () => {
    expect(migration).not.toMatch(
      /create table public\.(?:messages|leaderboards|payments)/,
    );
    expect(migration).not.toContain("openai");
    expect(migration).not.toContain("machine learning");
    expect(migration).not.toContain("account_suspension");
  });
});
