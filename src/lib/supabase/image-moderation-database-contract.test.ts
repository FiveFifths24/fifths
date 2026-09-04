import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/202609040001_image_moderation.sql"),
  "utf8",
);

describe("image moderation database contract", () => {
  it("creates a private quarantine bucket without user object policies", () => {
    expect(migration).toContain("'media-quarantine'");
    expect(migration).toContain("set public = false");
    expect(migration).not.toMatch(
      /create policy [^\n]*quarantine[^\n]*\n[^;]*(insert|select|update|delete)/i,
    );
  });

  it("enforces owner-bound random paths and upload throttling", () => {
    expect(migration).toContain("split_part(p_quarantine_path, '/', 1)");
    expect(migration).toContain("current_user_id::text");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain(">= 12");
    expect(migration).toContain("claim_media_upload_slots");
    expect(migration).toContain("private.media_upload_rate_limits");
  });

  it("removes direct approved-bucket writes and blocks arbitrary profile paths", () => {
    expect(migration).toContain(
      'drop policy if exists "profile_media_insert_own"',
    );
    expect(migration).toContain(
      'drop policy if exists "profile_media_update_own"',
    );
    expect(migration).toContain("profiles_require_approved_media");
    expect(migration).toContain("profile_media_path_is_approved");
    expect(migration).toContain("and status = 'approved'");
    expect(migration).toContain("and published_path = p_path");
  });

  it("keeps specialized child-safety handling out of ordinary review access", () => {
    expect(migration).toContain("legal_escalation_required = false");
    expect(migration).toContain("public.has_role('moderator')");
    expect(migration).toContain("public.has_role('platform_admin')");
  });

  it("indexes abandoned quarantine records for cleanup", () => {
    expect(migration).toContain("media_moderation_quarantine_cleanup_idx");
    expect(migration).toContain("quarantine_deleted_at is null");
    expect(migration).toContain("expires_at");
  });
});
