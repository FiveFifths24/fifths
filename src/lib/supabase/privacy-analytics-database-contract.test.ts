import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609180017_privacy_conscious_analytics.sql",
  ),
  "utf8",
).toLowerCase();

describe("privacy-conscious analytics database contract", () => {
  it("keeps raw events unreadable and unwritable to members", () => {
    expect(migration).toContain(
      "alter table public.product_analytics_events enable row level security",
    );
    expect(migration).toContain(
      "revoke all on public.product_analytics_events from public, anon, authenticated",
    );
    expect(migration).not.toMatch(
      /grant\s+(select|insert|update|delete|all)\s+on\s+public\.product_analytics_events/,
    );
  });

  it("accepts events only from authenticated members and rate limits writes", () => {
    expect(migration).toContain("current_user_id uuid := auth.uid()");
    expect(migration).toContain("if current_user_id is null then");
    expect(migration).toContain("interval '10 minutes'");
    expect(migration).toContain(") >= 120 then");
    expect(migration).not.toContain(") to anon;");
  });

  it("allows only a small metadata vocabulary and strips query strings", () => {
    expect(migration).toContain("allowed_property_keys text[]");
    for (const key of [
      "source",
      "outcome",
      "feature",
      "step",
      "duration_bucket",
    ]) {
      expect(migration).toContain(`'${key}'`);
    }
    expect(migration).toContain("split_part(btrim(p_route), '?', 1)");
    expect(migration).toContain("octet_length(properties::text) <= 2048");
    expect(migration).toContain("jsonb_typeof(property.value) not in");
    expect(migration).toContain("!~ '^[a-z0-9_-]{1,80}$'");
  });

  it("provides a private retention function with a 13-month default", () => {
    expect(migration).toContain("private.prune_product_analytics_events");
    expect(migration).toContain("interval '13 months'");
    expect(migration).toContain(
      "revoke all on function private.prune_product_analytics_events(interval)",
    );
  });
});
