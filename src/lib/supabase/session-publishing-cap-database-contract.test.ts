import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609040004_session_publishing_cap.sql",
  ),
  "utf8",
).toLowerCase();

describe("Session publishing cap database contract", () => {
  it("enforces the cap inside the authenticated lifecycle RPC", () => {
    expect(migration).toContain(
      "create or replace function public.set_session_status",
    );
    expect(migration).toContain("security definer");
    expect(migration).toContain("auth.uid() is null");
    expect(migration).toContain("public.can_manage_session(p_session_id)");
    expect(migration).toContain(
      "grant execute on function public.set_session_status",
    );
  });

  it("serializes each host's count and publish operation", () => {
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("session-publish-cap:");
    expect(migration).toContain("host_user_id = current_session.host_user_id");
  });

  it("blocks a sixth published upcoming Session within 14 days", () => {
    expect(migration).toContain("status = 'published'");
    expect(migration).toContain("starts_at > now()");
    expect(migration).toContain("starts_at <= now() + interval '14 days'");
    expect(migration).toContain("published_upcoming_count >= 5");
    expect(migration).toContain(
      "you already have 5 published sessions scheduled within the next 14 days. cancel or complete one before publishing another.",
    );
  });

  it("does not count drafts, cancelled, completed, past, or later Sessions", () => {
    const countQuery = migration.match(
      /select count\(\*\)[\s\S]*?if published_upcoming_count >= 5/,
    )?.[0];

    expect(countQuery).toContain("status = 'published'");
    expect(countQuery).toContain("starts_at > now()");
    expect(countQuery).toContain("starts_at <= now() + interval '14 days'");
    expect(countQuery).not.toContain("status = 'draft'");
    expect(countQuery).not.toContain("status = 'cancelled'");
    expect(countQuery).not.toContain("status = 'completed'");
  });

  it("allows a draft outside the near-term window to publish without using a slot", () => {
    expect(migration).toContain(
      "if current_session.starts_at <= now() + interval '14 days' then",
    );
    expect(migration).toMatch(
      /end if;\s+update public\.sessions\s+set status = 'published'/,
    );
  });
});
