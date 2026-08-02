import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608040001_phase_5_circles_foundation.sql",
  ),
  "utf8",
).toLowerCase();

const phaseFiveTables = ["circles", "circle_interests", "circle_members"];

describe("Phase 5 Circles database security contract", () => {
  it.each(phaseFiveTables)("enables RLS on %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("keeps every Circle write behind a validated RPC", () => {
    for (const table of phaseFiveTables) {
      expect(migration).toContain(
        `revoke all on public.${table} from anon, authenticated`,
      );
      expect(migration).not.toMatch(
        new RegExp(
          `grant\\s+(?:insert|update|delete)[^;]*public\\.${table}\\s+to\\s+authenticated`,
        ),
      );
    }
    expect(migration).toContain("current_user_id uuid := auth.uid()");
    expect(migration).toContain("public.has_role('host')");
    expect(migration).toContain("public.has_role('platform_admin')");
  });

  it("enforces private visibility and scoped local roles", () => {
    expect(migration).toContain("visibility = 'public'");
    expect(migration).toContain("public.is_circle_member(sessions.circle_id)");
    expect(migration).toContain("role in ('owner', 'moderator')");
    expect(migration).toContain("role in ('owner', 'host')");
    expect(migration).toContain("p_role = 'owner'");
    expect(migration).toContain("ownership transfer is not available");
  });

  it("audits membership status and role changes", () => {
    expect(migration).toContain("private.circle_membership_audit_logs");
    expect(migration).toContain("circle_membership_audit_change");
    expect(migration).toContain(
      "revoke all on private.circle_membership_audit_logs from public, anon, authenticated",
    );
  });

  it("associates only manageable draft Sessions with host-scoped Circles", () => {
    expect(migration).toContain("not public.can_manage_session(p_session_id)");
    expect(migration).toContain("current_session.status <> 'draft'");
    expect(migration).toContain("not public.can_host_circle(p_circle_id)");
    expect(migration).toContain(
      "set circle_id = p_circle_id, source_module = 'circles'",
    );
  });

  it("does not add later-phase workflows or self-award Passport activity", () => {
    expect(migration).not.toMatch(/insert into public\.passport_entries/);
    expect(migration).not.toMatch(/create table public\.creator_opportunities/);
    expect(migration).not.toMatch(/create table public\.realm_campaigns/);
    expect(migration).not.toMatch(/create table public\.reports/);
    expect(migration).not.toMatch(/create table public\.notifications/);
    expect(migration).not.toMatch(/create table public\.messages/);
  });
});
