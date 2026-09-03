import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/202608290001_profile_launch_foundation.sql",
  ),
  "utf8",
).toLowerCase();

describe("profile launch database contract", () => {
  it("stores only aggregate daily-deduplicated profile traffic", () => {
    expect(migration).toContain("create table public.profile_view_buckets");
    expect(migration).toContain(
      "primary key (profile_id, viewer_id, viewed_on)",
    );
    expect(migration).toContain("current_user_id = p_profile_id");
    expect(migration).toContain("on conflict do nothing");
    expect(migration).not.toContain("who viewed");
  });

  it("keeps presence throttled and server-authorized", () => {
    expect(migration).toContain(
      "create or replace function public.touch_profile_presence",
    );
    expect(migration).toContain("interval '2 minutes'");
    expect(migration).toContain("security definer");
  });

  it("does not expose raw profile-view rows", () => {
    expect(migration).toContain(
      "revoke all on public.profile_view_buckets from anon, authenticated",
    );
    expect(migration).not.toContain(
      "grant select on public.profile_view_buckets",
    );
  });
});
