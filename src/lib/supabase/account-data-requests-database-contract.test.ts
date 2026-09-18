import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609180014_account_data_requests.sql",
  ),
  "utf8",
).toLowerCase();

describe("account data request database contract", () => {
  it("allows members to read only their requests and denies direct writes", () => {
    expect(migration).toContain("user_id = auth.uid()");
    expect(migration).toContain("or public.has_role('platform_admin')");
    expect(migration).toContain(
      "revoke all on public.account_data_requests from public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant select on public.account_data_requests to authenticated",
    );
    expect(migration).not.toMatch(
      /grant\s+(insert|update|delete|all)\s+on\s+public\.account_data_requests\s+to\s+authenticated/,
    );
  });

  it("permits only one active request per member", () => {
    expect(migration).toContain(
      "create unique index account_data_requests_one_active_idx",
    );
    expect(migration).toContain("where status in ('submitted', 'in_review')");
    expect(migration).toContain("pg_catalog.pg_advisory_xact_lock");
  });

  it("keeps the audit trail private and records status transitions", () => {
    expect(migration).toContain(
      "create table private.account_data_request_audit_logs",
    );
    expect(migration).toContain(
      "revoke all on private.account_data_request_audit_logs",
    );
    expect(migration).toContain("after insert or update of status");
  });

  it("exposes narrowly scoped authenticated RPCs without deleting accounts", () => {
    expect(migration).toContain(
      "grant execute on function public.request_account_data_action",
    );
    expect(migration).toContain(
      "grant execute on function public.cancel_account_data_request(uuid)",
    );
    expect(migration).not.toMatch(
      /delete\s+from\s+(auth\.users|public\.profiles)/,
    );
  });
});
