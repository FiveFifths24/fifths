import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OpportunityCard, type OpportunityCardItem } from "./opportunity-card";

const item: OpportunityCardItem = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  title: "Launch interview series",
  summary: "Produce a short creator interview series.",
  creator_display_name: "Avery",
  kind: "collaboration",
  status: "published",
  format: "online",
  location_label: null,
  response_deadline: "2026-09-01T21:00:00.000Z",
  timezone: "America/New_York",
  estimated_minutes: 120,
  positions: 2,
  accepted_count: 1,
  minimum_energy: 2,
  maximum_energy: 4,
  stimulation_level: "moderate",
  social_intensity: "light",
  modeName: "Create",
  skillNames: ["Production"],
  interestNames: ["Media"],
  saved: true,
  reasons: ["Fits your current mode"],
};

describe("OpportunityCard", () => {
  it("shows opportunity provenance, capacity, skill, and match context", () => {
    render(<OpportunityCard item={item} />);
    expect(
      screen.getByRole("link", { name: "Launch interview series" }),
    ).toHaveAttribute("href", `/home/commons/${item.id}`);
    expect(screen.getByText("Created by Avery")).toBeInTheDocument();
    expect(screen.getByText("1 opening")).toBeInTheDocument();
    expect(screen.getByText("Production")).toBeInTheDocument();
    expect(screen.getByText("Fits your current mode")).toBeInTheDocument();
  });
});
