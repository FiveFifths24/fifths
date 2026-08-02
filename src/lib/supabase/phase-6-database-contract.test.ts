import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608050001_phase_6_creator_commons_foundation.sql",
  ),
  "utf8",
).toLowerCase();

const phaseSixTables = [
  "creator_opportunities",
  "opportunity_skills",
  "opportunity_interests",
  "opportunity_responses",
  "saved_opportunities",
];

describe("Phase 6 Creator Commons database security contract", () => {
  it.each(phaseSixTables)("enables RLS on %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("keeps every Commons write behind a validated RPC", () => {
    for (const table of phaseSixTables) {
      expect(migration).toContain(
        `revoke all on public.${table} from anon, authenticated`,
      );
      expect(migration).not.toMatch(
        new RegExp(
          `grant\\s+(?:insert|update|delete)[^;]*public\\.${table}\\s+to\\s+authenticated`,
        ),
      );
    }
    expect(migration).toContain("public.has_role('creator')");
    expect(migration).toContain("public.can_host_circle(p_circle_id)");
  });

  it("keeps responses private and capacity-safe", () => {
    expect(migration).toContain(
      'create policy "opportunity_responses_select_own_or_manager"',
    );
    expect(migration).toContain("user_id = (select auth.uid())");
    expect(migration).toContain("for update");
    expect(migration).toContain(
      "current_opportunity.accepted_count >= current_opportunity.positions",
    );
  });

  it("requires manager and participant completion confirmation", () => {
    expect(migration).toContain("creator_confirmed_at is not null");
    expect(migration).toContain("participant_confirmed_at is not null");
    expect(migration).toContain("close the opportunity before completion");
    expect(migration).toContain("private.opportunity_response_audit_logs");
  });

  it("preserves private Circle visibility for associated opportunities", () => {
    expect(migration).toContain(
      "public.is_circle_member(opportunity.circle_id)",
    );
    expect(migration).toContain("visibility = 'public'");
    expect(migration).toContain(
      "prevent a circle from being archived while it still owns a published commons opportunity",
    );
  });

  it("does not add Phase 7+, payment, messaging, or self-award workflows", () => {
    expect(migration).not.toMatch(/insert into public\.passport_entries/);
    expect(migration).not.toMatch(/create table public\.realm_campaigns/);
    expect(migration).not.toMatch(/create table public\.organizations/);
    expect(migration).not.toMatch(/create table public\.payments/);
    expect(migration).not.toMatch(/create table public\.messages/);
    expect(migration).not.toMatch(/create table public\.reports/);
    expect(migration).not.toMatch(/create table public\.notifications/);
  });
});
