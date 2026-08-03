import { describe, expect, it } from "vitest";
import type { PassportEntry } from "@/types/database";
import { summarizePassport } from "./passport-data";

function entry(
  id: string,
  overrides: Partial<PassportEntry> = {},
): PassportEntry {
  return {
    id,
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    activity_kind: "attended_session",
    source_module: "sessions",
    source_record_id: id,
    source_title: "Community Session",
    occurred_at: "2026-08-01T18:00:00.000Z",
    status: "verified",
    verified_at: "2026-08-01T20:00:00.000Z",
    verified_by: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    revoked_at: null,
    revoked_by: null,
    revocation_kind: null,
    revocation_reason: null,
    created_at: "2026-08-01T20:00:00.000Z",
    updated_at: "2026-08-01T20:00:00.000Z",
    ...overrides,
  };
}

describe("summarizePassport", () => {
  it("counts only currently verified activity while preserving corrections", () => {
    const summary = summarizePassport([
      entry("11111111-1111-4111-8111-111111111111"),
      entry("22222222-2222-4222-8222-222222222222", {
        activity_kind: "completed_opportunity",
        source_module: "commons",
      }),
      entry("33333333-3333-4333-8333-333333333333", {
        status: "revoked",
        revoked_at: "2026-08-02T12:00:00.000Z",
        revocation_kind: "source_correction",
        revocation_reason: "Attendance was corrected by the authorized host.",
      }),
    ]);

    expect(summary).toEqual({
      verifiedCount: 2,
      moduleCount: 2,
      activityCount: 2,
      correctionCount: 1,
    });
  });
});
