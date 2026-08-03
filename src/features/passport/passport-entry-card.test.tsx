import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PassportEntry } from "@/types/database";
import { PassportEntryCard } from "./passport-entry-card";

const entry: PassportEntry = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  activity_kind: "completed_opportunity",
  source_module: "commons",
  source_record_id: "22222222-2222-4222-8222-222222222222",
  source_title: "Neighborhood story archive",
  occurred_at: "2026-08-01T18:00:00.000Z",
  status: "verified",
  verified_at: "2026-08-01T20:00:00.000Z",
  verified_by: null,
  revoked_at: null,
  revoked_by: null,
  revocation_kind: null,
  revocation_reason: null,
  created_at: "2026-08-01T20:00:00.000Z",
  updated_at: "2026-08-01T20:00:00.000Z",
};

describe("PassportEntryCard", () => {
  it("identifies the category, product, verification, source, and date with text", () => {
    render(<PassportEntryCard entry={entry} timezone="America/New_York" />);
    expect(screen.getByText("Creator Commons")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(
      screen.getByText("Completed a Commons contribution"),
    ).toBeInTheDocument();
    expect(screen.getByText("Neighborhood story archive")).toBeInTheDocument();
    expect(screen.getByText("August 1, 2026")).toBeInTheDocument();
  });

  it("explains a correction without relying on color", () => {
    render(
      <PassportEntryCard
        entry={{
          ...entry,
          status: "revoked",
          revoked_at: "2026-08-02T12:00:00.000Z",
          revocation_kind: "administrative",
          revocation_reason: "The source record was corrected after review.",
        }}
        timezone="UTC"
      />,
    );
    expect(screen.getByText("Corrected")).toBeInTheDocument();
    expect(
      screen.getByText("This activity no longer counts as verified."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The source record was corrected after review."),
    ).toBeInTheDocument();
  });
});
