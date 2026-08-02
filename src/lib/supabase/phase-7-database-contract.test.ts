import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608060001_phase_7_fifth_realm_foundation.sql",
  ),
  "utf8",
).toLowerCase();
const phaseSevenTables = [
  "realm_campaigns",
  "campaign_interests",
  "campaign_applications",
  "campaign_members",
];

describe("Phase 7 Fifth Realm database security contract", () => {
  it.each(phaseSevenTables)("enables RLS on %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("keeps every Realm write behind validated RPCs", () => {
    for (const table of phaseSevenTables) {
      expect(migration).toContain(
        `revoke all on public.${table} from anon, authenticated`,
      );
      expect(migration).not.toMatch(
        new RegExp(
          `grant\\s+(?:insert|update|delete)[^;]*public\\.${table}\\s+to\\s+authenticated`,
        ),
      );
    }
    expect(migration).toContain("public.has_role('game_master')");
    expect(migration).toContain("public.can_host_circle(p_circle_id)");
  });

  it("keeps applications private and acceptance capacity-safe", () => {
    expect(migration).toContain(
      'create policy "campaign_applications_select_own_or_manager"',
    );
    expect(migration).toContain("user_id = (select auth.uid())");
    expect(migration).toContain("where id = p_campaign_id for update");
    expect(migration).toContain(
      "current_campaign.active_player_count >= current_campaign.player_capacity",
    );
    expect(migration).toContain("p_safety_acknowledged is distinct from true");
    expect(migration).toContain("private.campaign_application_audit_logs");
  });

  it("creates authoritative membership and member-only Realm Sessions", () => {
    expect(migration).toContain("insert into public.campaign_members");
    expect(migration).toContain(
      "create or replace function public.set_session_campaign",
    );
    expect(migration).toContain(
      "public.is_campaign_member(sessions.campaign_id)",
    );
    expect(migration).toContain("sessions_realm_source_consistency");
  });

  it("preserves Circle visibility and prevents unsafe archival", () => {
    expect(migration).toContain("public.is_circle_member(campaign.circle_id)");
    expect(migration).toContain("visibility = 'public'");
    expect(migration).toContain("status in ('recruiting', 'active')");
  });

  it("does not add Passport, proprietary rules, VTT, payment, or messaging workflows", () => {
    expect(migration).not.toMatch(/insert into public\.passport_entries/);
    expect(migration).not.toMatch(/create table public\.payments/);
    expect(migration).not.toMatch(/create table public\.messages/);
    expect(migration).not.toMatch(/create table public\.virtual_tabletops/);
    expect(migration).not.toMatch(/create table public\.game_rules/);
  });
});
