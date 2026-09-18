import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609180016_communication_preferences.sql",
  ),
  "utf8",
).toLowerCase();
const compactMigration = migration.replace(/\s+/g, " ");

describe("communication preferences database contract", () => {
  it("defaults every optional category off", () => {
    const optionalColumns = [
      "session_activity_email",
      "circle_activity_email",
      "commons_activity_email",
      "realm_activity_email",
      "passport_activity_email",
      "social_activity_email",
      "newsletter_email",
      "five_fifths_updates_email",
      "ehub_updates_email",
      "fundraising_email",
      "community_events_email",
      "feature_announcements_email",
    ];

    for (const column of optionalColumns) {
      expect(migration).toContain(`${column} boolean not null default false`);
    }
  });

  it("does not represent essential service email as a disableable preference", () => {
    expect(migration).not.toMatch(/essential_email\s+boolean/);
    expect(migration).not.toMatch(/security_email\s+boolean/);
  });

  it("records source-aware consent and revocation changes privately", () => {
    expect(migration).toContain("marketing_consented_at timestamptz");
    expect(migration).toContain("marketing_consent_source text");
    expect(migration).toContain("marketing_revoked_at timestamptz");
    expect(migration).toContain(
      "create table private.communication_preference_audit_logs",
    );
    expect(migration).toContain(
      "revoke all on private.communication_preference_audit_logs",
    );
  });

  it("unsubscribes every optional category without affecting service email", () => {
    expect(migration).toContain(
      "create or replace function public.unsubscribe_optional_email()",
    );
    expect(compactMigration).toContain(
      "select public.update_communication_preferences( false, false, false, false, false, false, false, false, false, false, false, false, 'unsubscribe'",
    );
  });

  it("keeps preferences select-only and the future delivery outbox private", () => {
    expect(migration).toContain(
      "revoke all on public.communication_preferences from public, anon, authenticated",
    );
    expect(migration).toContain("create table private.email_delivery_outbox");
    expect(migration).toContain(
      "revoke all on private.email_delivery_outbox from public, anon, authenticated",
    );
  });
});
