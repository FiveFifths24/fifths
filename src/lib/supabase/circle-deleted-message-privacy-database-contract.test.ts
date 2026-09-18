import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609180013_circle_deleted_message_privacy.sql",
  ),
  "utf8",
).toLowerCase();

describe("Circle deleted-message privacy contract", () => {
  it("moves retained bodies into a private, default-deny table", () => {
    expect(migration).toContain(
      "create table if not exists private.circle_message_deleted_bodies",
    );
    expect(migration).toContain(
      "alter table private.circle_message_deleted_bodies enable row level security",
    );
    expect(migration).toContain(
      "revoke all on private.circle_message_deleted_bodies",
    );
    expect(migration).not.toMatch(
      /grant\s+select\s+on\s+private\.circle_message_deleted_bodies/,
    );
  });

  it("redacts the public row before realtime can expose it", () => {
    expect(migration).toContain("body = '[deleted]'");
    expect(migration).toContain(
      "insert into private.circle_message_deleted_bodies",
    );
    expect(migration).toContain("for update");
  });

  it("returns retained text only to a Circle owner or platform admin", () => {
    expect(migration).toContain("and member.role = 'owner'");
    expect(migration).toContain("public.has_role('platform_admin')");
    expect(migration).toContain("when privileged_viewer then retained.body");
    expect(migration).toContain("else null");
  });

  it("keeps RPC-only writes and the safe read RPC", () => {
    for (const name of [
      "delete_circle_message(uuid)",
      "moderate_circle_message(uuid)",
      "get_circle_chat_messages(uuid, integer)",
    ]) {
      expect(migration).toContain(`revoke all on function public.${name}`);
      expect(migration).toContain(`grant execute on function public.${name}`);
    }
  });
});
