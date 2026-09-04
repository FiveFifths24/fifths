import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampaignCard, type CampaignCardItem } from "./campaign-card";

const item: CampaignCardItem = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  title: "The Lantern Archive",
  summary: "An original collaborative mystery.",
  game_master_display_name: "Avery",
  genre: "Mystery",
  tone: "Hopeful",
  status: "recruiting",
  format: "online",
  location_label: null,
  schedule_summary: "Two Saturdays each month",
  timezone: "America/New_York",
  estimated_session_minutes: 120,
  application_deadline: "2026-09-01T21:00:00.000Z",
  player_capacity: 5,
  active_player_count: 1,
  experience_level: "new",
  minimum_energy: 2,
  maximum_energy: 4,
  stimulation_level: "moderate",
  social_intensity: "social",
  modeName: "Immerse",
  interestNames: ["Storytelling"],
  reasons: ["Fits Your Current Mode"],
  applicationStatus: "submitted",
};

describe("CampaignCard", () => {
  it("shows provenance, seats, cadence, application, and Pulse context", () => {
    render(<CampaignCard item={item} />);
    expect(
      screen.getByRole("link", { name: "The Lantern Archive" }),
    ).toHaveAttribute("href", `/home/realm/${item.id}`);
    expect(screen.getByText("Fifth Realm Campaign")).toBeInTheDocument();
    expect(screen.getByText("Game master Avery")).toBeInTheDocument();
    expect(screen.getByText("4 seats")).toBeInTheDocument();
    expect(screen.getByText("Application: submitted")).toBeInTheDocument();
    expect(screen.getByText("Fits Your Current Mode")).toBeInTheDocument();
  });
});
