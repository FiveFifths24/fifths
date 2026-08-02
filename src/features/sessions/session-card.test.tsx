import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionCard, type SessionCardItem } from "./session-card";

const session: SessionCardItem = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  title: "Community design studio",
  summary: "A focused session for shaping a neighborhood creative project.",
  host_display_name: "Jordan",
  status: "published",
  format: "in_person",
  starts_at: "2027-01-15T23:00:00.000Z",
  ends_at: "2027-01-16T01:00:00.000Z",
  timezone: "America/New_York",
  capacity: 20,
  confirmed_registration_count: 7,
  location_label: "Downtown studio",
  minimum_energy: 2,
  maximum_energy: 4,
  stimulation_level: "moderate",
  social_intensity: "social",
  modeName: "Create",
  interestNames: ["Arts & culture"],
  reasons: ["Fits your current mode", "Matches your available energy"],
  fit: "strong",
};

describe("SessionCard", () => {
  it("shows honest capacity, access, and Pulse-match context", () => {
    render(<SessionCard item={session} />);
    expect(
      screen.getByRole("link", { name: "Community design studio" }),
    ).toHaveAttribute("href", `/home/sessions/${session.id}`);
    expect(screen.getByText("13 spots left")).toBeInTheDocument();
    expect(screen.getByText(/In person · Downtown studio/)).toBeInTheDocument();
    const reasons = screen.getByRole("list", {
      name: "Why this matches your Pulse",
    });
    expect(within(reasons).getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.getByText(/strong fit · Why this may fit/i),
    ).toBeInTheDocument();
  });

  it("communicates a full Session with text", () => {
    render(
      <SessionCard
        item={{ ...session, confirmed_registration_count: session.capacity }}
      />,
    );
    expect(screen.getByText("Full")).toBeInTheDocument();
  });
});
