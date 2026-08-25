import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608250001_profile_social_safety.sql",
  ),
  "utf8",
).toLowerCase();

describe("profile social and safety database contract", () => {
  it("creates separate follow, friendship, mute, block, and word-filter models", () => {
    for (const table of [
      "profile_follows",
      "profile_friendships",
      "profile_blocks",
      "profile_mutes",
      "profile_blocked_words",
    ]) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toContain(
        `alter table public.${table} enable row level security`,
      );
    }
  });

  it("severs friendship and follows in both directions when a member blocks", () => {
    const blockFunction = migration.slice(
      migration.indexOf("create or replace function public.block_profile"),
      migration.indexOf("create or replace function public.unblock_profile"),
    );
    expect(blockFunction).toContain("delete from public.profile_follows");
    expect(blockFunction).toContain("delete from public.profile_friendships");
    expect(blockFunction).toContain("follower_id = p_target_user_id");
    expect(blockFunction).toContain("followed_id = current_user_id");
  });

  it("does not recreate relationships when a member unblocks", () => {
    const unblockFunction = migration.slice(
      migration.indexOf("create or replace function public.unblock_profile"),
      migration.indexOf("create or replace function public.mute_profile"),
    );
    expect(unblockFunction).toContain("delete from public.profile_blocks");
    expect(unblockFunction).not.toContain("insert into public.profile_follows");
    expect(unblockFunction).not.toContain(
      "insert into public.profile_friendships",
    );
  });

  it("keeps profile media private and scoped to a member folder", () => {
    expect(migration).toContain("'profile-media'");
    expect(migration).toContain("false,");
    expect(migration).toContain("public.can_view_profile");
    expect(migration).toContain("(storage.foldername(name))[1]");
  });
});
